import "dotenv/config";
import { Worker, Job } from 'bullmq';
import { supabase } from '../lib/supabase.js'; 
import { openai, isOpenAiConfigured } from '../lib/openai.js';     
import { webSearch, scrapeUrl } from '../lib/webUtils.js'; 
// import { Tiktoken } from "tiktoken/lite"; // No longer needed directly
// import cl100k_base from "tiktoken/encoders/cl100k_base.json" with { type: "json" }; // REMOVED
import { encoding_for_model } from "tiktoken"; // Use the helper function
import { researchQueue } from "../lib/queue.js";
// import { connection } from "../lib/redis.js"; // Import connection for Worker

// TODO: Ensure REDIS_URL is set in your .env file
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('REDIS_URL environment variable is not set for Research Worker!');
  process.exit(1); // Exit if Redis isn't configured
}

// --- Pricing (Update these as needed) ---
// Prices per Million tokens (as of late 2024, check current pricing)
const GPT4O_MINI_INPUT_PRICE_PER_MILLION = 0.15;
const GPT4O_MINI_OUTPUT_PRICE_PER_MILLION = 0.60;

// Initialize tokenizer using the helper
// Ensure the model name matches the one you intend to use for token counting
let encoding;
try {
    encoding = encoding_for_model("gpt-4o-mini"); 
} catch (e) {
    console.error("Failed to load tiktoken encoding:", e);
    // Handle error appropriately - maybe fall back to a default or throw
    throw new Error("Could not initialize tokenizer.");
}

interface ResearchJobData {
  jobId: string;
  prompt: string;
  businessId: string;
  userId: string;
}

interface CompetitorInfo {
    name: string;
    price?: string | null;
    usp?: string | null;
    // Add other fields as needed
}

// --- Placeholder Utilities (Implement these in e.g., ../lib/webUtils.ts) ---

async function fetchSearchLinks(query: string, count: number): Promise<string[]> {
  console.warn(`[Research Worker] TODO: Implement fetchSearchLinks for query: ${query}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return [
      `https://example.com/search?q=${encodeURIComponent(query)}&page=1`,
      `https://example.com/search?q=${encodeURIComponent(query)}&page=2`,
      `https://anotherexample.org/results?term=${encodeURIComponent(query)}`,
  ].slice(0, count);
}

async function fetchAndChunk(url: string): Promise<{ title: string; chunks: string[] }> {
  console.warn(`[Research Worker] TODO: Implement fetchAndChunk for url: ${url}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  const title = `Title for ${url}`;
  const content = `This is scraped content from ${url}. It should be much longer. Chunk 1. Chunk 2. Chunk 3.`;
  const chunks = content.match(/.{1,100}/g) || [content]; // Simple split
  return { title, chunks };
}

async function embedChunks(chunks: string[], openaiClient: any): Promise<Array<number[]>> {
    console.warn(`[Research Worker] TODO: Implement embedChunks`);
    if (!isOpenAiConfigured()) {
        console.error("[Research Worker] OpenAI API key not configured. Skipping embeddings.");
        return chunks.map(() => Array(1536).fill(0)); // text-embedding-ada-002 dim
    }
    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunks,
        });
        return response.data.map((embedding: { embedding: number[] }) => embedding.embedding);
    } catch (error) {
        console.error("[Research Worker] Error creating embeddings:", error);
        return chunks.map(() => Array(1536).fill(0));
    }
}

// Helper to update job status and add a result step
async function updateJobStatusAndAddResult(jobId: string, status: string | null, step: string, note?: string | null, payload?: any) {
    console.log(`[Research Worker Job ${jobId}] Step: ${step} - Status: ${status || 'intermediate'}`);
    const updates: { status?: string; error?: string, finished_at?: string } = {}; // Use ISO string for timestamp
    if (status) updates.status = status;
    if (status === 'error' && note) updates.error = note;
     if (status === 'done' || status === 'error') updates.finished_at = new Date().toISOString();

    if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
            .from("research_jobs")
            .update(updates)
            .eq("id", jobId);
        if (updateError) console.error(`[Research Worker Job ${jobId}] Error updating job status to ${status}:`, updateError);
    }

    // Check if research_results table exists before inserting
    // This is a temporary check; ideally schema management handles this
    const { data: tableCheck, error: checkError } = await supabase.rpc('table_exists', { schema_name: 'public', table_name: 'research_results' })
    
    if (checkError) {
        console.error(`[Research Worker Job ${jobId}] Error checking for research_results table:`, checkError);
    } else if (tableCheck) {
        const { error: resultError } = await supabase
            .from("research_results")
            .insert({
                job_id: jobId,
                step: step,
                note: note || null,
                payload: payload || null,
            });
        if (resultError) console.error(`[Research Worker Job ${jobId}] Error inserting result step ${step}:`, resultError);
    } else {
        console.warn(`[Research Worker Job ${jobId}] research_results table not found. Skipping timeline step insertion.`);
    }
}

const researchSteps = async (job: Job<ResearchJobData>) => {
  const { jobId, prompt, businessId, userId } = job.data;
  const now = () => new Date().toISOString();
  let totalCost = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  console.log(`[Research Worker] Starting job ${jobId} for prompt: "${prompt}"`);

  // Helper to write results to the database
  const writeResult = async (step: string, payload: any, note = '') => {
    console.log(`[Research Worker ${jobId}] Writing result for step: ${step}`);
    const { error } = await supabase
      .from('research_results')
      .insert({ job_id: jobId, step, payload, note });
    if (error) {
      console.error(`[Research Worker ${jobId}] Error writing result for step ${step}:`, error);
    }
  };

  // 1. Mark job as running
  console.log(`[Research Worker ${jobId}] Marking job as running...`);
  const { error: updateStartError } = await supabase
    .from('research_jobs')
    .update({ status: 'running', started_at: now() })
    .eq('id', jobId);

  if (updateStartError) {
      console.error(`[Research Worker ${jobId}] Error marking job as running:`, updateStartError);
      throw new Error(`Failed to mark job ${jobId} as running: ${updateStartError.message}`);
  }

  try {
    /* STEP A: SERP */
    console.log(`[Research Worker ${jobId}] Performing web search...`);
    const serpResults = await webSearch(prompt);
    await writeResult('raw_serp', serpResults);
    console.log(`[Research Worker ${jobId}] Found ${serpResults.length} SERP results.`);
    if (serpResults.length === 0) {
        console.warn(`[Research Worker ${jobId}] No search results found. Skipping scrape and analysis.`);
        // Mark job as done, but maybe with a note or different status?
        // For now, just proceed to finish with 0 cost
    } else {
      /* STEP B: Scrape & Excerpt Top 5 */
      const topLinks = serpResults.slice(0, 5);
      console.log(`[Research Worker ${jobId}] Scraping top ${topLinks.length} links via Firecrawl...`);
      const scrapedContents = await Promise.allSettled(
        topLinks.map(async (link) => {
          const { markdown, title } = await scrapeUrl(link.url);
          // Write individual excerpt results (now as markdown)
          await writeResult('link_excerpt', { url: link.url, title: title || link.title, markdown }, `Scraped ${link.url}`);
          return { url: link.url, title: title || link.title, markdown };
        })
      );

      const validExcerpts: { url: string; title: string; markdown: string }[] = [];
      scrapedContents.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          validExcerpts.push(result.value);
        } else {
          const linkUrl = topLinks[index].url;
          console.error(`[Research Worker ${jobId}] Error scraping ${linkUrl}:`, result.reason);
          // Write an error result for this specific scrape
          writeResult('error', { url: linkUrl, error: result.reason?.message || 'Unknown scraping error' }, `Scraping failed for ${linkUrl}`);
        }
      });
      console.log(`[Research Worker ${jobId}] Successfully scraped ${validExcerpts.length} links.`);

      if (validExcerpts.length > 0) {
        /* STEP C: Extract Competitor Meta */
        console.log(`[Research Worker ${jobId}] Extracting competitor metadata using OpenAI...`);
        const competitorPromptContent = `Analyze the following web page excerpts (in Markdown format) about potential competitors or related entities based on the initial query "${prompt}". For each relevant competitor identified, extract their name, estimated pricing (if mentioned), and unique selling proposition (USP) or key features. Return the output as a JSON array object like this: [{name: string, price?: string | null, usp?: string | null}]. If no competitors are found or the information isn't present, return an empty array []. Excerpts: ${JSON.stringify(validExcerpts.map(e => ({ url: e.url, title: e.title, markdown_excerpt: e.markdown.slice(0, 2000) /* Limit excerpt size */})))}`;
        
        const competitorCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: competitorPromptContent }],
          response_format: { type: 'json_object' },
          temperature: 0.2, // Lower temperature for more deterministic extraction
        });
        
        totalPromptTokens += competitorCompletion.usage?.prompt_tokens || 0;
        totalCompletionTokens += competitorCompletion.usage?.completion_tokens || 0;
        
        let competitors: CompetitorInfo[] = [];
        try {
            const content = competitorCompletion.choices[0]?.message?.content;
            if (content) {
                // The model should return a JSON object with a key (e.g., "competitors") containing the array
                const parsedJson = JSON.parse(content);
                // Adjust based on the actual key the model uses in its response
                competitors = parsedJson.competitors || parsedJson.results || parsedJson || []; 
                if (!Array.isArray(competitors)) {
                    console.warn(`[Research Worker ${jobId}] Competitor extraction returned non-array JSON:`, content);
                    competitors = []; // Default to empty array if format is wrong
                }
            } else {
                 console.warn(`[Research Worker ${jobId}] Competitor extraction returned no content.`);
            }
        } catch (parseError: any) {
            console.error(`[Research Worker ${jobId}] Error parsing competitor JSON:`, parseError);
            await writeResult('error', { error: parseError.message, raw_content: competitorCompletion.choices[0]?.message?.content }, 'Failed to parse competitor JSON from LLM');
        }
        
        await writeResult('competitor_meta', { competitors }); // Store the array under a 'competitors' key
        console.log(`[Research Worker ${jobId}] Extracted metadata for ${competitors.length} potential competitors.`);

        /* STEP D: Synthesis */
        console.log(`[Research Worker ${jobId}] Synthesizing report using OpenAI...`);
        const synthesisPromptContent = `You are a market analyst. Based on the initial research prompt "${prompt}" and the extracted competitor information below, write a concise market analysis summary in Markdown format. Include a table comparing the key competitors (Name, Price, USP) and follow it with bullet points highlighting key insights, opportunities, or potential threats.

Competitor Information:
${JSON.stringify(competitors)}`;
        
        const synthesisCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: synthesisPromptContent }],
          temperature: 0.5, 
        });

        totalPromptTokens += synthesisCompletion.usage?.prompt_tokens || 0;
        totalCompletionTokens += synthesisCompletion.usage?.completion_tokens || 0;

        const markdownSummary = synthesisCompletion.choices[0]?.message?.content || 'Error: Could not generate summary.';
        await writeResult('synthesis_md', { markdown: markdownSummary });
        console.log(`[Research Worker ${jobId}] Report synthesized.`);
      } else {
        console.warn(`[Research Worker ${jobId}] No valid excerpts to analyze. Skipping competitor and synthesis steps.`);
        await writeResult('synthesis_md', { markdown: "No valid web content found or scraped to generate a summary." });
      }
    } // End of else block (if serpResults.length > 0)

    /* Finish Job */
    console.log(`[Research Worker ${jobId}] Finalizing job...`);
    // Calculate cost based on token usage
    totalCost = 
        (totalPromptTokens * GPT4O_MINI_INPUT_PRICE_PER_MILLION / 1_000_000) +
        (totalCompletionTokens * GPT4O_MINI_OUTPUT_PRICE_PER_MILLION / 1_000_000);
        
    console.log(`[Research Worker ${jobId}] Total Tokens: P ${totalPromptTokens}, C ${totalCompletionTokens}. Estimated Cost: $${totalCost.toFixed(6)}`);

    const { error: updateEndError } = await supabase.from('research_jobs')
      .update({ status: 'done', finished_at: now(), cost_usd: totalCost.toFixed(4) })
      .eq('id', jobId);

     if (updateEndError) {
      console.error(`[Research Worker ${jobId}] Error marking job as done:`, updateEndError);
    }

    console.log(`[Research Worker ${jobId}] Job finished successfully.`);

  } catch (err: any) {
    console.error(`[Research Worker ${jobId}] Job failed:`, err);
    await writeResult('error', { error: err.message, stack: err.stack }, err.message);
    // Mark job as errored in the DB
    const { error: updateFailError } = await supabase.from('research_jobs')
      .update({ status: 'error', finished_at: now(), cost_usd: totalCost > 0 ? totalCost.toFixed(4) : null })
      .eq('id', jobId);
      
     if (updateFailError) {
        console.error(`[Research Worker ${jobId}] CRITICAL: Error marking job as failed after exception:`, updateFailError);
     }
    throw err;
  } finally {
    // Clean up tokenizer if it was successfully initialized
    encoding?.free(); 
  }
};

// Instantiate the worker
const connectionOpts = { connection: { url: redisUrl } };
const worker = new Worker<ResearchJobData>(
  researchQueue.name,
  async (job: Job<ResearchJobData>) => {
    const { jobId, prompt } = job.data;
    console.log(`[Research Worker] Processing job ${jobId} for prompt: "${prompt}"`);

    try {
      await updateJobStatusAndAddResult(jobId, "running", 'job_started');

      // 1. Fetch Search Links
      await updateJobStatusAndAddResult(jobId, null, 'raw_serp', 'Starting web search...');
      const links = await fetchSearchLinks(prompt, 5); // Get top 5 links
      await updateJobStatusAndAddResult(jobId, null, 'raw_serp', `Found ${links.length} links.`, { links });
      if (links.length === 0) {
          throw new Error("No search results found for the prompt.");
      }

      // 2. Scrape, Chunk, Embed, and Insert Documents
      await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', 'Starting page scraping and embedding...');
      let docsProcessed = 0;
      let allDocs: any[] = [];
      for (const link of links) {
        try {
            await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `Processing: ${link}`);
            const { title, chunks } = await fetchAndChunk(link);
            if (chunks.length === 0) {
                await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `No content extracted from ${link}, skipping.`);
                continue;
            }

            // Use imported function, passing the openai client
            const embeddings: number[][] = await embedChunks(chunks, openai);

            // Insert doc chunks + embeddings
            const dbRows = chunks.map((chunk, i) => {
                const embeddingVector: number[] | null = (embeddings && embeddings[i] && embeddings[i].length > 0) 
                                                        ? embeddings[i] 
                                                        : null;
                return {
                    job_id: jobId,
                    url: link,
                    title,
                    content: chunk,
                    embedding: embeddingVector, // Use the potentially null vector
                };
            });
            
            const { data: insertedDocs, error: insertError } = await supabase
                .from("research_docs")
                .insert(dbRows)
                .select(); // Select inserted rows to potentially use later

            if (insertError) {
                 console.error(`[Research Worker Job ${jobId}] Error inserting doc chunks for ${link}:`, insertError);
                 await updateJobStatusAndAddResult(jobId, null, 'error', `Error inserting chunks for ${link}: ${insertError.message}`);
                 // Continue to next link
            } else if (insertedDocs) {
                 docsProcessed++;
                 allDocs = allDocs.concat(insertedDocs); // Add successfully inserted docs
                 await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `Finished processing: ${link}`);
            } else {
                 // Handle case where insert succeeded but returned no data (shouldn't happen with .select())
                 console.warn(`[Research Worker Job ${jobId}] Inserted chunks for ${link} but no data returned.`);
                 await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `Processed (no data return): ${link}`);
            }

        } catch (scrapeError: any) {
             console.error(`[Research Worker Job ${jobId}] Error processing link ${link}:`, scrapeError);
             await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `Error processing ${link}: ${scrapeError.message}`);
             // Continue to next link
        }
      }
      await updateJobStatusAndAddResult(jobId, null, 'link_excerpt', `Finished scraping. Processed ${docsProcessed}/${links.length} links.`);

      // 3. TODO: Competitor Extraction (using allDocs)
       await updateJobStatusAndAddResult(jobId, null, 'competitor_meta', 'Skipping competitor extraction (TODO)');

      // 4. Synthesis (using allDocs)
      await updateJobStatusAndAddResult(jobId, null, 'synthesis_md', 'Starting summary synthesis...');
      let summaryMarkdown = 'Error: Synthesis step did not run or failed.'; // Default error message
      try {
            if (allDocs.length > 0) {
                const context = allDocs
                    .map((d) => `### ${d.title || 'Untitled Document'}\nURL: ${d.url || 'N/A'}\n${(d.content || '').substring(0, 1500)}`) // Limit content length per doc
                    .join("\n\n---\n\n");

                // Basic token check (very approximate)
                if (context.length > 80000) { // Heuristic: ~100k tokens might be around 80k chars? Adjust as needed.
                     console.warn(`[Research Worker Job ${jobId}] Synthesis context potentially too long (${context.length} chars). Truncating.`);
                     // Consider smarter truncation or summarization of individual docs first
                }

                console.log(`[Research Worker Job ${jobId}] Generating synthesis for ${allDocs.length} documents...`);
                const chat = await openai.chat.completions.create({
                    model: "gpt-4o-mini", // Use a capable model
                    messages: [
                        { role: "system", content: "You are a concise market research analyst. Synthesize the following web page excerpts into a brief competitive analysis summary, focusing on the original prompt: \"" + prompt + "\". Use Markdown for formatting." },
                        { role: "user", content: `Analyze these excerpts:\n\n${context.substring(0, 80000)}` }, // Apply truncation if needed
                    ],
                    temperature: 0.4, // Slightly creative but mostly factual
                    max_tokens: 1024, // Limit output length
                });
                summaryMarkdown = chat.choices[0]?.message?.content || 'Error: Could not generate summary from OpenAI.';
                await updateJobStatusAndAddResult(jobId, null, 'synthesis_md', 'Synthesis complete.');
            } else {
                summaryMarkdown = 'No documents were successfully processed to generate a summary.';
                 await updateJobStatusAndAddResult(jobId, null, 'synthesis_md', summaryMarkdown);
            }
      } catch (synthesisError: any) {
          console.error(`[Research Worker Job ${jobId}] Error during synthesis:`, synthesisError);
          summaryMarkdown = `Error during synthesis: ${synthesisError.message}`;
          await updateJobStatusAndAddResult(jobId, null, 'error', summaryMarkdown); // Also log step error
          // Note: The main catch block will still mark the job as 'error' globally
      }

      // 5. Mark job as done (Final Update - Replaces the last updateJobStatusAndAddResult call)
      console.log(`[Research Worker Job ${jobId}] Finalizing job with summary...`);
      const { error: updateEndError } = await supabase
        .from("research_jobs")
        .update({ 
            status: "done", 
            finished_at: new Date().toISOString(), 
            summary_md: summaryMarkdown // Add the generated summary
            // cost_usd: totalCost.toFixed(4) // TODO: Add cost calculation if needed
        })
        .eq("id", jobId);

      if (updateEndError) {
          console.error(`[Research Worker Job ${jobId}] Error marking job as done with summary:`, updateEndError);
          // If this fails, the job might remain in 'running' state
          // Consider adding a step error here too
          await updateJobStatusAndAddResult(jobId, null, 'error', `Failed to save final summary: ${updateEndError.message}`);
      }

      console.log(`[Research Worker Job ${jobId}] Job finished.`);

    } catch (error: any) {
        console.error(`[Research Worker Job ${jobId}] Failed:`, error);
        await updateJobStatusAndAddResult(jobId, "error", 'error', error.message || 'Unknown error occurred.');
        throw error; // Re-throw error to let BullMQ handle job failure
    }
  },
  connectionOpts // Pass Redis connection options
);

worker.on("failed", async (job: Job | undefined, err: Error) => {
    if (job) {
        console.error(`[Research Worker] Job ${job.id} (${job.name}) failed:`, err);
        // Ensure final error status is set if the job logic didn't catch it
         const { error: updateError } = await supabase.from("research_jobs")
            .update({ status: "error", error: err.message, finished_at: new Date().toISOString() })
            .eq("id", job.data.jobId)
            .neq('status', 'error'); // Only update if not already marked as error
         if (updateError) console.error(`[Research Worker Job ${job.data.jobId}] Fallback error status update failed:`, updateError);
    } else {
        console.error(`[Research Worker] Worker failed with no specific job info:`, err);
    }
});

worker.on("error", (err) => {
  console.error("[Research Worker] Worker encountered an error:", err);
});

console.log("🔬 Research worker listening for jobs on queue:", researchQueue.name);

// Function to check if a table exists (requires DB function)
// Run this SQL in Supabase editor once:
/*
CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text)
RETURNS boolean AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables
    WHERE  table_schema = schema_name
    AND    table_name = table_name
  ) INTO exists;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;
*/

// Ensure clean shutdown
const gracefulShutdown = () => {
  console.log('Shutting down research worker...');
  worker.close().then(() => {
    console.log('Research worker closed.');
    process.exit(0);
  });
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown); 