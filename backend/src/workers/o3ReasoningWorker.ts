// backend/src/workers/o3ReasoningWorker.ts
import 'dotenv/config';
import { Worker, Job } from "bullmq";
import { z } from "zod";
import OpenAI from "openai";
import Bottleneck from 'bottleneck';
import { supabase } from '../lib/supabase.js';
// import { reasoningQ } from "../lib/queue.js"; // Not used directly in this worker, only receives jobs
import { redisClient } from '../lib/redisClient.js';
import { zodToJsonSchema } from 'zod-to-json-schema'; // Import the new package

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const O3_MAX_TOKENS = parseInt(process.env.O3_MAX_TOKENS || "2000", 10); // Default to 2000 if not set
const MAX_CONTENT_LENGTH = parseInt(process.env.MAX_REASONING_CONTENT_LENGTH || "15000", 10); // Max chars to send to OpenAI, roughly 4k tokens

const TOKEN_PRICE_INPUT = 0.00005 / 1000; // Example price for gpt-4o-mini input
const TOKEN_PRICE_OUTPUT = 0.00015 / 1000; // Example price for gpt-4o-mini output

if (!OPENAI_API_KEY) {
  console.error("[ReasoningWorker] OPENAI_API_KEY is not set. Worker will not process jobs.");
  // Not throwing an error to allow worker to initialize but jobs will fail until key is set.
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const redisPublisher = redisClient.duplicate(); // For publishing updates
redisPublisher.connect().catch(console.error); // Connect publisher

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 3000, // Roughly 20 RPM, adjust as needed based on OpenAI rate limits
});

const competitorSchema = z.object({
    id: z.string().describe("A unique identifier for the competitor, e.g., their main URL or a generated slug."),
    name: z.string().describe("The name of the competitor business."),
    description: z.string().optional().describe("A brief description of the competitor, their focus, or unique selling proposition."),
    strengths: z.array(z.string()).optional().describe("Observed strengths or advantages."),
    weaknesses: z.array(z.string()).optional().describe("Observed weaknesses or disadvantages."),
    website: z.string().url().optional().describe("The competitor's primary website URL."),
    key_offerings: z.array(z.string()).optional().describe("Key products, services, or solutions offered.")
});

const outputSchema = z.object({
    competitors: z.array(competitorSchema).describe("A list of direct competitors identified from the text."),
    analysis_summary: z.string().optional().describe("A brief overall summary of the competitive landscape if apparent from the text.")
});


async function reason(job: Job) {
  const { researchJobId, pages_md } = job.data as { researchJobId: string, pages_md: string[] };
  console.log(`[ReasoningWorker] Processing job ${job.id} for research ID: ${researchJobId}`);

  if (!openai) {
    console.error(`[ReasoningWorker] OpenAI client not initialized for job ${researchJobId}. API key missing?`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "Reasoning engine not configured on server." }));
    await supabase.from('research_jobs').update({ status: 'error', result: { error: 'Reasoning engine (OpenAI) not configured.' }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("OpenAI client not initialized");
  }

  if (!pages_md || pages_md.length === 0) {
    console.warn(`[ReasoningWorker] No pages_md content provided for job ${researchJobId}. Marking as completed with no data.`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "done" })); // Signal done, but result will be empty
    await supabase.from('research_jobs').update({ status: 'completed', result: { competitors: [], analysis_summary: "No content provided for analysis." }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    return; // Successfully processed (by doing nothing)
  }

  const content = pages_md.join("\n\n---\n\n").slice(0, MAX_CONTENT_LENGTH);
  
  // --- Added console.log for content --- 
  console.log(`[ReasoningWorker] Content being sent to OpenAI for job ${researchJobId} (length: ${content.length}):\n${content.substring(0, 1000)}...\n`);

  // --- Updated systemPrompt to use zodToJsonSchema and provide more instructions ---
  const systemPrompt = `You are a senior market-research analyst. Your task is to analyze the provided text scraped from one or more company websites. 
Identify direct competitors based on the content. Direct competitors are companies offering similar products or services, targeting the same customer segments, or solving the same customer problems. 
Analyze sections like 'About Us', 'Products', 'Services', and blog posts if present in the scraped text for mentions, comparisons, or clues about market positioning. 
Focus on information explicitly present in the text. Do not invent competitors or infer beyond the provided content.
Return the information in JSON format according to the following JSON Schema. Ensure your output strictly adheres to this schema. 

JSON Schema:
${JSON.stringify(zodToJsonSchema(outputSchema, "competitorAnalysisSchema"), null, 2)}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Here is the scraped website content to analyze:\n\n${content}` },
  ];

  console.log(`[ReasoningWorker] Sending request to OpenAI for researchJobId: ${researchJobId}. Prompt text (user part) length: ${content.length}.`);
  
  let stream;
  try {
    stream = await limiter.schedule(() =>
        openai.chat.completions.create({
            model: "gpt-4o-mini", 
            stream: false, 
            response_format: { type: "json_object" },
            messages: messages as any, 
            max_tokens: O3_MAX_TOKENS,
            temperature: 0.2, // Lower temperature for more deterministic, schema-following output
        })
    );
  } catch (error: any) {
    console.error(`[ReasoningWorker] OpenAI API call failed for ${researchJobId}:`, error.message, error.response?.data);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "AI analysis failed due to API error.", details: error.message }));
    await supabase.from('research_jobs').update({ status: 'error', result: { error: `OpenAI API error: ${error.message}` }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw error; // Rethrow to mark job as failed in BullMQ
  }
  
  const rawJsonString = stream.choices[0].message?.content;
  if (!rawJsonString) {
    console.error(`[ReasoningWorker] OpenAI returned empty content for ${researchJobId}.`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "AI returned empty analysis."}) );
    await supabase.from('research_jobs').update({ status: 'error', result: { error: 'OpenAI returned empty content.' }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("OpenAI returned empty content.");
  }

  console.log(`[ReasoningWorker] OpenAI raw response for ${researchJobId}: ${rawJsonString.substring(0, 200)}...`);

  const parsed = outputSchema.safeParse(JSON.parse(rawJsonString));
  if (!parsed.success) {
    console.error(`[ReasoningWorker] Schema mismatch for ${researchJobId}:`, parsed.error.errors);
    console.error(`[ReasoningWorker] Failed JSON from OpenAI: ${rawJsonString}`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "AI failed to generate valid competitor data structure.", details: parsed.error.toString() }));
    await supabase.from('research_jobs').update({ status: 'error', result: { error: `OpenAI schema mismatch: ${parsed.error.toString()}`, raw_ai_response: rawJsonString }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("schema-mismatch: " + parsed.error.toString());
  }
  
  const resultData = parsed.data;
  console.log(`[ReasoningWorker] Parsed AI response for ${researchJobId}:`, resultData);

  if (resultData.competitors && resultData.competitors.length > 0) {
    for (let i = 0; i < resultData.competitors.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200)); 
      const partialResult = { competitors: resultData.competitors.slice(0, i + 1), analysis_summary: resultData.analysis_summary }; // Include summary if available
      console.log(`[ReasoningWorker] Publishing partial result for ${researchJobId}: Competitor ${i+1}`);
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "data", payload: partialResult }));
    }
  } else {
     console.log(`[ReasoningWorker] No competitors identified by AI for ${researchJobId}. Publishing empty data payload.`);
     await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "data", payload: { competitors: [], analysis_summary: resultData.analysis_summary || "No direct competitors identified in the provided text." } }));
  }

  const inputTokens = stream.usage?.prompt_tokens ?? 0;
  const outputTokens = stream.usage?.completion_tokens ?? 0;
  const cost = (inputTokens * TOKEN_PRICE_INPUT) + (outputTokens * TOKEN_PRICE_OUTPUT);

  console.log(`[ReasoningWorker] Storing final result for ${researchJobId}. Cost: $${cost.toFixed(6)}. Tokens (In/Out): ${inputTokens}/${outputTokens}`);
  const { error: updateError } = await supabase
    .from('research_jobs')
    .update({
      status: 'completed',
      result: resultData, 
      finished_at: new Date().toISOString(),
      credits_used: cost 
    })
    .eq('id', researchJobId);

  if (updateError) {
    console.error(`[ReasoningWorker] Error updating research_job ${researchJobId} to 'completed':`, updateError);
    // Don't throw here, main task is done. Log and publish done.
  }
  await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "done" }));
  console.log(`[ReasoningWorker] Job ${job.id} for research ID ${researchJobId} finished processing.`);
}

console.log('[ReasoningWorker] Initializing...');
if (OPENAI_API_KEY && openai) {
    new Worker("reasoning", reason, {
        concurrency: parseInt(process.env.REASONING_CONCURRENCY ?? "2", 10),
        connection: redisClient.duplicate(),
    })
    .on('completed', (job) => console.log(`[ReasoningWorker] BullMQ Job ${job.id} (research ID: ${job.data.researchJobId}) completed.`))
    .on('failed', async (job, err) => {
      console.error(`[ReasoningWorker] BullMQ Job ${job?.id} (research ID: ${job?.data.researchJobId}) failed:`, err.message);
      // Note: Specific error update to Supabase and Redis publish for error is handled within the 'reason' function now.
      // This handler is more for BullMQ level job failures if the 'reason' function itself throws an unhandled critical error early.
      if (job?.data.researchJobId && !(err.message.startsWith("OpenAI client not initialized") || err.message.startsWith("schema-mismatch") || err.message.startsWith("OpenAI returned empty content"))) {
        // Avoid double-updating if the error was already handled and published by `reason` function.
        await supabase.from('research_jobs').update({ status: 'error', result: { error: `Reasoning worker failed unexpectedly: ${err.message}` }, finished_at: new Date().toISOString() }).eq('id', job.data.researchJobId);
      }
    });
    console.log('[ReasoningWorker] Worker started and listening for reasoning jobs.');
} else {
    console.warn('[ReasoningWorker] OPENAI_API_KEY is not set. Worker will not start. Jobs sent to reasoning queue will stall.');
} 