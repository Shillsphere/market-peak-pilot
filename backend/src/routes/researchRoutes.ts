import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { z } from 'zod';
import { scrapeQ } from '../lib/queue.js'; // Uncommented queue import
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../lib/redisClient.js'; // Corrected import path

const router = express.Router();

const createResearchJobSchema = z.object({
  businessId: z.string().uuid(),
  urls: z.array(z.string().url()).min(1, "At least one URL is required."),
  researchTopic: z.string().optional(),
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('[ResearchRoute POST] Received request:', req.body);
  try {
    const validation = createResearchJobSchema.safeParse(req.body);
    if (!validation.success) {
      console.error('[ResearchRoute POST] Validation failed:', validation.error.format());
      res.status(400).json({ error: "Invalid request body", details: validation.error.format() });
      return;
    }

    const { businessId, urls, researchTopic } = validation.data;
    const researchJobId = uuidv4(); 

    console.log(`[ResearchRoute POST] Attempting to insert research job for businessId: ${businessId}, researchJobId: ${researchJobId}`);

    const { data: newJob, error: insertError, status } = await supabase
      .from('research_jobs')
      .insert({
        id: researchJobId, 
        business_id: businessId,
        status: 'queued_scrape', // Changed status for queueing
        prompt_text: researchTopic || `Test Research for URLs: ${urls.join(', ')}`,
        user_id: (req as any).user?.id, 
      })
      .select('id, status, created_at') 
      .single();

    if (insertError) {
      console.error(`[ResearchRoute POST] Supabase insert error (Status: ${status}):`, insertError.message);
      if ((insertError as any).details) console.error('[ResearchRoute POST] Insert error details:', (insertError as any).details);
      if ((insertError as any).hint) console.error('[ResearchRoute POST] Insert error hint:', (insertError as any).hint);
      res.status(500).json({ error: "Could not create research job in DB.", details: insertError.message });
      return;
    }

    if (!newJob) {
      console.error('[ResearchRoute POST] Supabase insert returned no data, but no error.');
      res.status(500).json({ error: "DB insert succeeded but returned no data." });
      return;
    }

    console.log(`[ResearchRoute POST] Successfully inserted research job:`, newJob);
    
    // --- Re-enable queueing ---
    console.log(`[ResearchRoute POST] Queuing job ${newJob.id} for scraping. URLs: ${urls.join(', ')}`);
    await scrapeQ.add('scrape_urls', { researchJobId: newJob.id, urls }); 
    
    res.status(202).json({ message: 'Research job accepted and queued for scraping.', researchJobId: newJob.id });

  } catch (error: any) {
    console.error('[ResearchRoute POST] CATCH BLOCK - Unexpected error:', error.message, error.stack);
    res.status(500).json({ error: "Unexpected server error.", details: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // For this test, you can just return a simpler message if the job doesn't involve queues yet
    try {
        const { id } = req.params;
        console.log(`[ResearchRoute GET /${id}] Received request for job details (test mode).`);
        const { data: job, error } = await supabase
          .from('research_jobs')
          .select('id, status, result, finished_at, created_at, credits_used, prompt_text')
          .eq('id', id)
          .single();

        if (error) {
            console.error(`[ResearchRoute GET /${id}] Supabase error:`, error.message);
            res.status(500).json({ error: "Error fetching job details.", details: error.message});
            return;
        };
        if (!job) {
            console.log(`[ResearchRoute GET /${id}] Job not found.`);
            res.status(404).json({ error: "Research job not found." });
            return;
        }
        console.log(`[ResearchRoute GET /${id}] Successfully fetched job details:`, job);
        res.json(job);
      } catch (error: any) {
        console.error(`[ResearchRoute GET /${req.params.id}] CATCH BLOCK - Unexpected error:`, error.message);
        // next(error);
        res.status(500).json({ error: "Unexpected server error fetching job.", details: error.message });
      }
});

router.get('/:id/stream', async (req: Request, res: Response): Promise<void> => {
    const { id: researchJobId } = req.params;
    console.log(`[API-SSE] Client connected for research stream: ${researchJobId}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 
    
    const channel = `research:${researchJobId}`;
    const subscriber = redisClient.duplicate();

    subscriber.on('message', (channelName: string, message: string) => {
        if (channelName === channel) {
            console.log(`[API-SSE] Relaying message from Redis channel '${channelName}' to client for job ${researchJobId}: ${message.substring(0,100)}...`);
            res.write(`data: ${message}\n\n`);
        }
    });

    await subscriber.subscribe(channel, (err, count) => { 
        if (err) {
            console.error(`[API-SSE] Failed to subscribe to Redis channel ${channel}:`, err);
            res.end();
            return;
        }
        console.log(`[API-SSE] Subscribed to Redis channel ${channel}. Count: ${count}`);
    });

    const heartbeatInterval = setInterval(() => {
        res.write(':heartbeat\n\n'); 
    }, 15000);

    req.on('close', async () => {
      console.log(`[API-SSE] Client disconnected from research stream: ${researchJobId}`);
      clearInterval(heartbeatInterval);
      if (subscriber.status === 'ready') { 
        try {
            await subscriber.unsubscribe(channel);
            console.log(`[API-SSE] Unsubscribed from Redis channel: ${channel}`);
            await subscriber.quit();
            console.log(`[API-SSE] Redis subscriber quit for channel: ${channel}`);
        } catch (unsubError) {
            console.error(`[API-SSE] Error during unsubscribe/quit for channel ${channel}:`, unsubError);
        }
      } else {
        console.log(`[API-SSE] Subscriber for channel ${channel} status is '${subscriber.status}', no unsubscribe/quit needed or already disconnected.`);
      }
    });
});

export default router;