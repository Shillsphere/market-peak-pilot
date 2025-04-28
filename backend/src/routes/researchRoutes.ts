import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { supabase } from '../lib/supabase.js'; // Adjust path as needed
import { researchQueue } from '../lib/queue.js'; // Adjust path as needed
import { z } from 'zod';
import { authMiddleware, AuthedRequest } from '../middleware/auth.js'; // Import AuthedRequest type

// Remove Session and AuthenticatedRequest if authMiddleware handles it
// import { Session } from '@supabase/supabase-js';
// interface AuthenticatedRequest extends Request {
//   user?: Session['user'];
// }

// Remove getUserContext and attachUserContext if authMiddleware handles it
/*
async function getUserContext(req: Request): Promise<{ userId: string | null; session: Session | null }> {
  // ... existing code ...
}
const attachUserContext = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // ... existing code ...
};
*/

const router = Router();

// --- Zod Schemas for Validation ---
const CreateResearchSchema = z.object({
  prompt: z.string().min(5, { message: "Prompt must be at least 5 characters long." }),
  businessId: z.string().uuid(), // Expect businessId from client
});

const GetResearchParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid Job ID format." }),
});

// --- Routes (Inline Handlers with Promise<void> and explicit returns) --- 

/**
 * POST /research
 * body: { prompt: string, businessId: uuid }
 * Creates a job and enqueues it
 */
router.post('/', authMiddleware as RequestHandler, async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request body
    const validationResult = CreateResearchSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
      return; // Explicit return after res
    }
    const { prompt, businessId } = validationResult.data;

    // Access user directly from AuthedRequest
    const userId = req.user?.id;

    if (!userId) {
        console.error('[API /research POST] Missing userId after auth context middleware');
        res.status(401).json({ error: 'User authentication failed.' });
        return; // Explicit return after res
    }
    // --- End Get User ID ---

    console.log(`[API /research POST] Creating job for user ${userId}, business ${businessId}, prompt: "${prompt}"`);

    // Insert job into the database
    // RLS will check if the authenticated user (userId) is part of the provided businessId
    const { data: jobRow, error: insertError } = await supabase
      .from('research_jobs')
      .insert({ prompt, user_id: userId, business_id: businessId })
      .select('id') // Select only ID initially
      .single();

    if (insertError) {
      console.error('[API /research POST] Error inserting job:', insertError);
      // Check for RLS violation error specifically if possible
      if (insertError.message.includes('violates row-level security policy')) {
        res.status(403).json({ error: 'Forbidden: User does not have permission for this business.' });
        return; // Explicit return after res
      } else {
        next(insertError); // Pass other errors to handler
        return; // Explicit return after next
      }
    }

     if (!jobRow || !jobRow.id) {
        console.error('[API /research POST] Failed to retrieve job ID after insert.');
        res.status(500).json({ error: 'Failed to create research job.' });
        return; // Explicit return after res
    }
    const jobId = jobRow.id;

    // Add job to the queue
    try {
      await researchQueue.add('run', {
        jobId: jobId,
        // Pass necessary data to worker if needed beyond jobId
        prompt,
        businessId,
        userId,
      });
      console.log(`[API /research POST] Job ${jobId} added to research queue.`);
    } catch (queueError: any) {
        console.error(`[API /research POST] Error adding job ${jobId} to queue:`, queueError);
        // Optionally: try to delete the DB job entry or mark it as failed
        await supabase.from('research_jobs').update({ status: 'error', error: 'Failed to queue' }).eq('id', jobId);
        next(new Error('Failed to queue research job after creation.'));
        return; // Explicit return after next
    }

    // Respond with Accepted status and Job ID
    res.status(202).json({ jobId: jobId, status: 'queued' });
    // No return needed here; end of try block implies void.
  } catch (error) {
    next(error); // Pass any unexpected errors to the error handler
    return; // Explicit return after next in catch block
  }
});

/**
 * GET /research/:id
 * Returns job status + docs
 */
router.get('/:id', authMiddleware as RequestHandler, async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate params
    const paramsValidation = GetResearchParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        res.status(400).json({ error: 'Invalid Job ID', details: paramsValidation.error.errors });
        return; // Explicit return after res
    }
    const { id: jobId } = paramsValidation.data;

    // Access user directly from AuthedRequest
    const userId = req.user?.id;
    console.log(`[API /research GET] User ${userId} fetching job ${jobId}`);
    // --- End Get User ID ---

    // Fetch job details and related documents
    // RLS policy should handle authorization implicitly based on authMiddleware's user
    const { data: job, error: jobError } = await supabase
        .from('research_jobs')
        .select('*, docs:research_docs(*)') // Fetch related docs using the relationship
        .eq('id', jobId)
        .single();

    if (jobError) {
      // Handle not found (potentially RLS denial)
      if (jobError.code === 'PGRST116') { // PostgREST code for no rows found
        res.status(404).json({ error: 'Research job not found or access denied.' });
        return; // Explicit return after res
      } else {
        console.error(`[API /research GET] Error fetching job ${jobId}:`, jobError);
        next(jobError); // Pass other errors to handler
        return; // Explicit return after next
      }
    }

    // No need to fetch results separately anymore if using the relationship select
    /*
    const { data: results, error: resultsError } = await supabase
        .from('research_results') // This table might be deprecated by the blueprint
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

    if (resultsError) {
        console.error(`[API /research GET] Error fetching results for job ${jobId}:`, resultsError);
        res.json({ job, results: [] }); // Return job even if results fail
        return;
    }
    */

    // Job object now contains a 'docs' array if the relationship is set up correctly
    res.json(job);
    // No return needed here; end of try block implies void.
  } catch (error) {
    next(error);
    return; // Explicit return after next in catch block
  }
});

export default router; 