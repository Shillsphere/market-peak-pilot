// Resolve dotenv conflict: Remove explicit loading and fallback, rely on --env-file
// Keep express import
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { supabase } from './lib/supabase.js';
import { generateQueue } from './queue.js';
import { openai } from './lib/openai.js';
import { z } from 'zod';
import researchRoutes from './routes/researchRoutes.js';
import credentialsRoutes from './routes/credentialsRoutes.js';
import distributeRoutes from './routes/distributeRoutes.js';
import { testEncryptionKey } from './lib/encryption.js';

// Define interfaces for request and response bodies for clarity
interface CreatePostRequestBody {
  businessId: string;
  templateId?: string;   // NEW
  customPrompt?: string; // optional
}

interface CreatePostResponseBody {
  postId: string;
}

// Define interface for GET /content/posts query params
interface GetPostsQueryParams {
  businessId: string;
}

// Re-defined Post type for backend use
interface PostForBackend {
  id: string;
  caption: string;
  status: string; // Keep as string or use specific backend statuses
  created_at: string;
  generated_images: { url: string | null } | null; // Expecting single object or null from join
}

type GetPostsResponseBody = PostForBackend[];

// Input validation middleware - Updated for templateId or customPrompt
const validatePostRequest: RequestHandler<{}, {}, CreatePostRequestBody> = (req, res, next) => {
  const { businessId, templateId, customPrompt } = req.body;
  if (!businessId || typeof businessId !== 'string') {
    res.status(400).json({ error: 'Missing or invalid businessId' });
    return; // Explicit return after sending response
  }
  if (!templateId && !customPrompt) {
    res.status(400).json({ error: 'Either templateId or customPrompt is required' });
    return; // Explicit return after sending response
  }
  if (templateId && typeof templateId !== 'string') {
    res.status(400).json({ error: 'Invalid templateId' });
    return; // Explicit return after sending response
  }
  if (customPrompt && typeof customPrompt !== 'string') {
     res.status(400).json({ error: 'Invalid customPrompt' });
     return; // Explicit return after sending response
  }
  if (customPrompt && customPrompt.length < 10) {
      res.status(400).json({ error: 'Custom prompt must be at least 10 characters' });
      return; // Explicit return after sending response
  }
  next();
};

// Helper function to determine the prompt
const buildPrompt = async (body: CreatePostRequestBody): Promise<string> => {
  if (body.customPrompt) {
      console.log("Using custom prompt");
      return body.customPrompt;
  }

  if (body.templateId) {
    console.log(`Fetching template prompt for ID: ${body.templateId}`);
    const { data, error } = await supabase
      .from('templates')
      .select('prompt_stub')
      .eq('id', body.templateId)
      .single();

    if (error) {
        console.error("Error fetching template:", error);
        throw new Error(`Template not found or Supabase error: ${error.message}`);
    }
    if (!data) {
        throw new Error('Template not found');
    }
    console.log("Using template prompt stub:", data.prompt_stub);
    // TODO: Optional variable replacement can be added here if needed
    return data.prompt_stub;
  }

  // This should be unreachable due to validation middleware, but acts as a safeguard
  throw new Error('Either templateId or customPrompt required');
};


const app = express();
const port = process.env.PORT || 4000; // Use environment variable or default

app.use(express.json()); // Middleware to parse JSON bodies

// Verify encryption key is set up
if (!process.env.ENCRYPTION_KEY) {
  console.error('WARNING: ENCRYPTION_KEY environment variable is not set. Credentials encryption will not work!');
} else {
  // Test the encryption key
  const keyValid = testEncryptionKey();
  if (keyValid) {
    console.log('Encryption key is valid and working properly.');
  } else {
    console.error('ERROR: Encryption key test failed. Please check the ENCRYPTION_KEY format.');
  }
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Mount the routes
app.use('/api/research', researchRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/distribute', distributeRoutes);

// Extracted and typed handler for POST /content/text - Modified
const createPostHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { businessId, templateId, customPrompt } = req.body as CreatePostRequestBody;
    const userId = 'placeholder-user-id'; // FIXME: Need actual user ID from auth context

    console.log(`Received POST /content/text for business ${businessId}`);
    if (templateId) console.log(` -> templateId: ${templateId}`);
    if (customPrompt) console.log(` -> customPrompt: "${customPrompt.substring(0, 50)}..."`);

    // 0. Check and decrement credits before proceeding
    console.log(`Checking credits for business ${businessId}...`);
    const { data: creditOk, error: creditErr } = await supabase.rpc(
      'check_and_decrement_credits',
      { bid: businessId, cost: 1 }  // Adding default cost parameter
    );

    if (creditErr) {
      console.error('Credit check RPC error:', creditErr);
      res.status(500).json({ error: 'Credit check failed due to an internal error.' });
      return; // Explicit return after sending response
    }
    if (!creditOk) {
      console.log(`Credit check failed for business ${businessId}. Insufficient credits.`);
      res.status(402).json({ error: 'Not enough credits for caption generation.' });
      return; // Explicit return after sending response
    }
    console.log(`Credits check passed for business ${businessId}.`);


    // 1. Determine the prompt to use
    const finalPrompt = await buildPrompt(req.body);
    console.log(`Using final prompt for caption: "${finalPrompt.substring(0, 50)}..."`);


    // 2. Generate caption using OpenAI (gpt-4o-mini)
    console.log('Generating caption...');
    const captionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Generate a short, engaging social media caption for the following idea: ${finalPrompt}` }],
      max_tokens: 100,
    });
    const caption = captionResponse.choices[0]?.message?.content?.trim() ?? 'Placeholder caption';
    console.log(`Caption generated: "${caption.substring(0,50)}..."`);


    // 3. Save initial post data (including caption) to Supabase
    console.log('Saving post to database...');
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({ business_id: businessId, caption: caption, status: 'generating' }) // Initial status
      .select('id')
      .single();

    if (postError) {
      throw new Error(`Supabase post insert failed: ${postError.message}`);
    }
    if (!postData) {
      throw new Error('Failed to insert post or retrieve post ID.');
    }
    const postId = postData.id;
    console.log(`Post saved with ID: ${postId}`);

    // 4. Add job to the image generation queue
    console.log(`Adding job to queue for post ${postId}...`);
    // Pass the final prompt (from template or custom) to the image worker
    await generateQueue.add('generate', { postId, businessId, prompt: finalPrompt }); // Pass the final prompt
    console.log(`Job added for post ${postId}`);

    // Respond immediately, the worker will handle the rest
    res.status(202).json({ message: 'Content generation started.', postId });

  } catch (err) {
    console.error('Error in /content/text route:', err);
    // Handle specific errors like 'Template not found'
    if (err instanceof Error && (err.message.includes('Template not found') || err.message.includes('required'))) {
        res.status(400).json({ error: err.message });
        return; // Explicit return after sending response
    }
    next(err); // Pass other errors to the general error handling middleware
  }
};

// POST /content/text route using the extracted handler
app.post('/content/text', validatePostRequest, createPostHandler);

// Extracted and typed handler for GET /content/posts
const getPostsHandler: RequestHandler<
  {},
  GetPostsResponseBody | { error: string }, // Response body can be data or error
  {},
  GetPostsQueryParams
> = async (req, res, next) => {
  const { businessId } = req.query;

  // Runtime check - pass error to middleware if invalid
  if (!businessId) {
    // Create an error object to pass to the error handler
    const err = new Error('businessId missing');
    // Set a status code property for the error handler to use (optional)
    (err as any).status = 400;
    return next(err);
  }

  try {
    // NOTE: Ensure RLS allows reading posts and joined generated_images
    // The join generated_images(...) might return an array.
    // If you expect only one image per post, ensure the FK relationship reflects this.
    // We select url directly assuming a single related image or null.
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        caption,
        status,
        created_at,
        generated_images ( url ) 
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error:', error);
      return next(new Error(`Supabase error: ${error.message}`));
    }

    // Process data safely
    const posts: PostForBackend[] = (data || []).map((post: any) => ({
        ...post,
        // Supabase might return an array for the join, take the first or null
        generated_images: Array.isArray(post.generated_images) 
                            ? post.generated_images[0] ?? null 
                            : post.generated_images ?? null 
    }));

    res.json(posts);

  } catch (err) {
    console.error('Error in /content/posts route:', err);
    next(err);
  }
};

// GET /content/posts route using the extracted handler
app.get('/content/posts', getPostsHandler);

// --- TEMPLATES ---
// Typed handler for GET /content/templates
const getTemplatesHandler: RequestHandler = async (req, res, next) => {
  console.log('GET /content/templates');
  try {
      const { data, error } = await supabase
          .from('templates')
          .select('id, name');

      if (error) {
          console.error("Error fetching templates:", error);
          // Create error object and pass to middleware
          const err = new Error(`Failed to fetch templates: ${error.message}`);
          (err as any).status = 500; // Optional: suggest status code
          return next(err); // Pass error to middleware
      }

      res.json(data || []); // Send response
  } catch (err) {
      console.error("Error in /content/templates route:", err);
      next(err); // Pass unexpected errors to error handler
  }
};

// Use the typed handler
app.get('/content/templates', getTemplatesHandler);

// Basic error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", err.stack || err); // Log the error details
  const statusCode = (err as any).status || 500; // Use specific status code if available, else 500
  res.status(statusCode).json({
    error: 'An unexpected error occurred.',
    message: err.message || 'Internal Server Error' // Provide message if available
  });
};

// Add error handling middleware *last*
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
}); 