// backend/src/workers/scrapeWorker.ts
import 'dotenv/config';
import { Worker, Job } from "bullmq";
import { firecrawl } from "../lib/firecrawl.js";
import { supabase } from "../lib/supabase.js"; // Your existing Supabase admin client
import { reasoningQ } from "../lib/queue.js"; // Adjusted path to use the modified queue.ts
import { redisClient } from '../lib/redisClient.js';

// Define interfaces for job data structure
interface ScrapeJobData {
  researchJobId: string;
  urls: string[];
}

// Define interface for what is sent to reasoningWorker
interface ReasoningJobPayload {
  researchJobId: string;
  detailed_pages_data: { url: string; markdown: string | null; error?: string }[];
  researchTopic: string; // Crucial: ensure this is included
}

async function scrape(job: Job<ScrapeJobData>) {
  console.log(`[ScrapeWorker] Processing job ${job.id} for research ID: ${job.data.researchJobId}`);
  const { researchJobId, urls } = job.data;
  const detailed_pages_data: { url: string; markdown: string | null; error?: string }[] = [];

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error("[ScrapeWorker] FIRECRAWL_API_KEY not set. Cannot scrape.");
    await supabase.from('research_jobs').update({ status: 'error', result: { error: 'Firecrawl API key not configured' }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("Firecrawl API key not configured"); // Let BullMQ handle job failure
  }

  for (const url of urls) {
    let scrapedText: string | null = null;
    try {
        console.log(`[ScrapeWorker] Scraping URL: ${url} for job ${researchJobId}`);
        const scrapeResult = await firecrawl.scrapeUrl(url, { 
            formats: ["markdown"] // Changed back to formats: ["markdown"] as per TS error suggestion
        });

        if (scrapeResult && (scrapeResult as any).success === true && (scrapeResult as any).data && typeof (scrapeResult as any).data.markdown === 'string') {
            scrapedText = (scrapeResult as any).data.markdown;
        } else if (scrapeResult && typeof (scrapeResult as any).markdown === 'string') {
            scrapedText = (scrapeResult as any).markdown;
        } else if (scrapeResult && (scrapeResult as any).success === false && (scrapeResult as any).error) { 
            console.warn(`[ScrapeWorker] Firecrawl API returned failure for URL ${url} (job ${researchJobId}): ${(scrapeResult as any).error}`);
            detailed_pages_data.push({ url, markdown: null, error: `Firecrawl reported - ${(scrapeResult as any).error}` });
        } else {
            console.warn(`[ScrapeWorker] No extractable markdown or unexpected response for URL: ${url} (job ${researchJobId}). Response:`, JSON.stringify(scrapeResult, null, 2));
            detailed_pages_data.push({ url, markdown: null, error: 'No extractable markdown or unexpected structure.' });
        }

        if (scrapedText && scrapedText.length > 0) {
            console.log(`[ScrapeWorker] Successfully scraped markdown for ${url} (job ${researchJobId}). Length: ${scrapedText.length}`);
            detailed_pages_data.push({ url, markdown: scrapedText });
        } else if (!(scrapeResult && (scrapeResult as any).success === false)) {
            console.warn(`[ScrapeWorker] Markdown text was null for ${url} (job ${researchJobId}), though no explicit Firecrawl error was reported in the response object.`);
        }

    } catch (error: any) {
        console.error(`[ScrapeWorker] Exception during scrape of URL ${url} (job ${researchJobId}):`, error.message, error.details || error.statusCode || error);
        let detailedErrorMessage = error.message;
        if (error.data && typeof error.data.message === 'string') {
            detailedErrorMessage = `Firecrawl Error (from exception data): ${error.data.message}`;
        } else if (error.response && error.response.data && typeof error.response.data.message === 'string') { 
            detailedErrorMessage = `Firecrawl Error (from exception response data): ${error.response.data.message}`;
        }
        detailed_pages_data.push({ url, markdown: null, error: detailedErrorMessage });
    }
  }

  console.log(`[ScrapeWorker] Processed ${urls.length} URL(s) for job ${researchJobId}. Found ${detailed_pages_data.filter(p => p.markdown).length} valid markdown pages.`);
  
  // **** FETCH researchTopic (prompt_text) from the database ****
  console.log(`[ScrapeWorker] Fetching researchTopic for research ID ${researchJobId}`);
  const { data: jobDetails, error: jobDetailsError } = await supabase
    .from('research_jobs')
    .select('prompt_text') // This column stores your researchTopic
    .eq('id', researchJobId)
    .single();

  if (jobDetailsError || !jobDetails) {
    console.error(`[ScrapeWorker] CRITICAL: Could not fetch job details (prompt_text) for research ID ${researchJobId}:`, jobDetailsError);
    // This is a critical failure, the reasoning worker needs the topic. Mark job as error.
    await supabase.from('research_jobs').update({ 
        status: 'error', 
        result: { error: 'Failed to retrieve research topic for analysis.' },
        finished_at: new Date().toISOString()
    }).eq('id', researchJobId);
    throw new Error(`Failed to retrieve job details for ${researchJobId}`); // Fail the BullMQ job
  }
  
  const researchTopic = jobDetails.prompt_text; // This is the user's original research focus
  console.log(`[ScrapeWorker] researchTopic fetched for ${researchJobId}: "${researchTopic}"`);
  
  if (detailed_pages_data.filter(p => p.markdown).length > 0) {
    // Only enqueue for reasoning if there's actual content AND we have a research topic
    if (researchTopic !== null && researchTopic !== undefined) {
      const payloadForReasoning: ReasoningJobPayload = { // Use the defined interface
        researchJobId,
        detailed_pages_data,
        researchTopic // Pass the fetched topic
      };
      await reasoningQ.add("reason", payloadForReasoning);
      console.log(`[ScrapeWorker] Enqueued job for reasoning for research ID ${researchJobId} with topic "${researchTopic}"`);

      const { error: updateError } = await supabase
          .from('research_jobs')
          .update({ status: 'reasoning' })
          .eq('id', researchJobId);
      if (updateError) {
          console.error(`[ScrapeWorker] Error updating research_job ${researchJobId} status to 'reasoning':`, updateError);
      }
    } else {
      console.error(`[ScrapeWorker] Research topic was missing for job ${researchJobId}. Cannot proceed to reasoning.`);
      await supabase
        .from('research_jobs')
        .update({ 
          status: 'error', 
          result: { error: 'Research topic was missing, cannot proceed to reasoning.' }, 
          finished_at: new Date().toISOString() 
        })
        .eq('id', researchJobId);
    }
  } else {
      console.warn(`[ScrapeWorker] No pages scraped successfully for job ${researchJobId}. Marking as error.`);
      const { error: updateError } = await supabase
          .from('research_jobs')
          .update({ status: 'error', result: { error: 'No content could be scraped from the provided URLs.' }, finished_at: new Date().toISOString() })
          .eq('id', researchJobId);
      if (updateError) {
          console.error(`[ScrapeWorker] Error updating research_job ${researchJobId} status to 'error' (no content):`, updateError);
      }
  }
}

console.log('[ScrapeWorker] Initializing...');
new Worker<ScrapeJobData>("scrape", scrape, {
    connection: redisClient.duplicate(),
    concurrency: parseInt(process.env.SCRAPE_CONCURRENCY || "3"),
})
.on('completed', (job) => console.log(`[ScrapeWorker] Job ${job.id} (research ID: ${job.data.researchJobId}) completed.`))
.on('failed', async (job, err) => {
  console.error(`[ScrapeWorker] Job ${job?.id} (research ID: ${job?.data.researchJobId}) failed:`, err.message);
  if (job?.data.researchJobId) {
    await supabase.from('research_jobs').update({ status: 'error', result: { error: `Scraping failed: ${err.message}` }, finished_at: new Date().toISOString() }).eq('id', job.data.researchJobId);
  }
});

console.log('[ScrapeWorker] Worker started and listening for scrape jobs.');
 