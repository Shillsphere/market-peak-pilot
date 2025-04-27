// import 'dotenv/config'; // No longer needed with --env-file flag
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { supabase } from './lib/supabase.js';
import queue from './queue.js';
import { openai } from './lib/openai.js';
import { z } from 'zod';

// Define interfaces for request and response bodies for clarity
interface CreatePostRequestBody {
  businessId: string;
  prompt: string;
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

// Interface for the POST request body
interface PostRequestBody {
  businessId: string;
  prompt: string; // Added prompt field
}

// Validation middleware using zod (example)
const postRequestSchema = z.object({
  businessId: z.string().uuid(),
  prompt: z.string().min(10), // Added validation for prompt
});

// Basic error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

// Input validation middleware - Typed with RequestHandler
const validatePostRequest: RequestHandler<{}, {}, CreatePostRequestBody> = (req, res, next) => {
  const { businessId, prompt } = req.body;
  if (!businessId || typeof businessId !== 'string' || !prompt || typeof prompt !== 'string') {
    // Send response without returning it
    res.status(400).json({ error: 'Missing or invalid businessId or prompt' });
    return; // Add explicit return to stop execution after sending response
  }
  // Call next without returning it
  next();
};


const app = express();
const port = process.env.PORT || 4000; // Use environment variable or default

app.use(express.json()); // Middleware to parse JSON bodies

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Extracted and typed handler for POST /content/text
const createPostHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.body is already validated by middleware if you use express-validator or zod middleware
    const { businessId, prompt } = req.body as PostRequestBody; // Destructure prompt

    console.log(`Received POST /content/text for business ${businessId} with prompt: "${prompt}"`);

    // 1. Generate caption using OpenAI (gpt-4o-mini)
    console.log('Generating caption...');
    const captionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use the smaller model for captions
      messages: [{ role: 'user', content: `Generate a short, engaging social media caption for the following idea: ${prompt}` }],
      max_tokens: 100,
    });
    const caption = captionResponse.choices[0]?.message?.content?.trim() ?? 'Placeholder caption';
    console.log(`Caption generated: "${caption.substring(0,50)}..."`);


    // 2. Save initial post data (including caption) to Supabase
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

    // 3. Add job to the image generation queue
    console.log(`Adding job to queue for post ${postId}...`);
    // Pass the original user prompt to the image worker
    await queue.add('generate', { postId, businessId, prompt }); // Pass the received prompt
    console.log(`Job added for post ${postId}`);

    // Respond immediately, the worker will handle the rest
    // Send back the post ID so the frontend can potentially track it
    res.status(202).json({ message: 'Content generation started.', postId });

  } catch (err) {
    console.error('Error in /content/text route:', err);
    next(err); // Pass error to the error handling middleware
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
// TODO: Replace with database query later
const templates = [
  { id: 'spring_sale', name: 'Spring Sale', prompt: 'Vibrant illustration for a spring sale event, featuring blooming flowers and bright colors.' },
  { id: 'product_drop', name: 'New Product Drop', prompt: 'Sleek product shot style image for a new product launch announcement. Minimalist background, focused on the product.' },
  { id: 'event_flyer', name: 'Local Event Flyer', prompt: 'Eye-catching flyer design for a local community event. Include space for text details.' },
  { id: 'testimonial_quote', name: 'Customer Testimonial', prompt: 'Professional graphic to accompany a customer testimonial quote. Clean design, perhaps with abstract shapes.' },
  { id: 'behind_the_scenes', name: 'Behind the Scenes', prompt: 'Candid photo style image showing a behind-the-scenes look at the business or team.' },
];

app.get('/content/templates', (req, res) => {
  console.log('GET /content/templates');
  res.json(templates);
});

// Add error handling middleware *last*
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
}); 