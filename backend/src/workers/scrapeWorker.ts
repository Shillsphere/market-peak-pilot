// backend/src/workers/scrapeWorker.ts
import 'dotenv/config';
import { Worker, Job } from "bullmq";
import { firecrawl } from "../lib/firecrawl.js";
import { supabase } from "../lib/supabase.js"; // Your existing Supabase admin client
import { reasoningQ } from "../lib/queue.js"; // Adjusted path to use the modified queue.ts
import { redisClient } from '../lib/redisClient.js';

async function scrape(job: Job) {
  console.log(`[ScrapeWorker] Processing job ${job.id} for research ID: ${job.data.researchJobId}`);
  const { researchJobId, urls } = job.data as { researchJobId: string; urls: string[] };
  const pages_md: string[] = []; // Renamed back to pages_md to match reasoningQ expectation

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
            pages_md.push(`Error scraping ${url}: Firecrawl reported - ${(scrapeResult as any).error}`);
        } else {
            console.warn(`[ScrapeWorker] No extractable markdown or unexpected response for URL: ${url} (job ${researchJobId}). Response:`, JSON.stringify(scrapeResult, null, 2));
            pages_md.push(`Error scraping ${url}: No extractable markdown or unexpected structure.`);
        }

        if (scrapedText && scrapedText.length > 0) {
            console.log(`[ScrapeWorker] Successfully scraped markdown for ${url} (job ${researchJobId}). Length: ${scrapedText.length}`);
            pages_md.push(scrapedText);
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
        pages_md.push(`Error scraping ${url}: ${detailedErrorMessage}`);
    }
  }

  console.log(`[ScrapeWorker] Processed ${urls.length} URL(s) for job ${researchJobId}. Found ${pages_md.length} valid markdown pages. Enqueuing for reasoning.`);
  
  if (pages_md.length > 0) {
      await reasoningQ.add("reason", { researchJobId, pages_md });
      const { error: updateError } = await supabase
          .from('research_jobs')
          .update({ status: 'reasoning' })
          .eq('id', researchJobId);
      if (updateError) {
          console.error(`[ScrapeWorker] Error updating research_job ${researchJobId} status to 'reasoning':`, updateError);
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
      // Do not throw an error here to allow BullMQ to mark the job as completed (though failed in terms of outcome)
      // If we throw, BullMQ might retry if attempts are configured.
  }
}

console.log('[ScrapeWorker] Initializing...');
new Worker("scrape", scrape, {
    connection: redisClient.duplicate(),
    concurrency: parseInt(process.env.SCRAPE_CONCURRENCY || "3"),
})
.on('completed', (job, result) => console.log(`[ScrapeWorker] Job ${job.id} (research ID: ${job.data.researchJobId}) completed.`))
.on('failed', async (job, err) => {
  console.error(`[ScrapeWorker] Job ${job?.id} (research ID: ${job?.data.researchJobId}) failed:`, err.message);
  if (job?.data.researchJobId) {
    await supabase.from('research_jobs').update({ status: 'error', result: { error: `Scraping failed: ${err.message}` }, finished_at: new Date().toISOString() }).eq('id', job.data.researchJobId);
  }
});

// console.log('[ScrapeWorker] Worker started and listening for scrape jobs.'); // Redundant after initialization log
 