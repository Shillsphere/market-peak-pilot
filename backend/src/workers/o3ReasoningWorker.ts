// backend/src/workers/o3ReasoningWorker.ts
import 'dotenv/config';
import { Worker, Job } from "bullmq";
import { z } from "zod";
import OpenAI from "openai";
import Bottleneck from 'bottleneck';
import { supabase } from '../lib/supabase.js';
import { redisClient } from '../lib/redisClient.js'; // Ensure redisClient is the one for ioredis
import { zodToJsonSchema } from 'zod-to-json-schema';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Increased O3_MAX_TOKENS for more comprehensive analysis, especially for Stage 2
const O3_MAX_TOKENS_STAGE1 = parseInt(process.env.O3_MAX_TOKENS_STAGE1 || "1500", 10); 
const O3_MAX_TOKENS_STAGE2 = parseInt(process.env.O3_MAX_TOKENS_STAGE2 || "3000", 10);

// More generous content length for slicing, ensure it's within practical limits for your models
const MAX_CONTENT_LENGTH_PER_URL = parseInt(process.env.MAX_REASONING_CONTENT_LENGTH_PER_URL || "20000", 10); 
const MAX_OVERALL_CONTENT_LENGTH = parseInt(process.env.MAX_REASONING_OVERALL_CONTENT_LENGTH || "60000", 10); 

// Ensure these are appropriate for the model you use (e.g., gpt-4o-mini)
const TOKEN_PRICE_INPUT = parseFloat(process.env.TOKEN_PRICE_INPUT || "0.00000005"); // e.g., $0.05 / 1M tokens for gpt-4o-mini input
const TOKEN_PRICE_OUTPUT = parseFloat(process.env.TOKEN_PRICE_OUTPUT || "0.00000015"); // e.g., $0.15 / 1M tokens for gpt-4o-mini output


if (!OPENAI_API_KEY) {
  console.error("[ReasoningWorker] FATAL: OPENAI_API_KEY is not set. Worker cannot function.");
  // To prevent the worker from even trying to start without a key, you might exit or not initialize BullMQ worker
  // For now, it will initialize but jobs will fail immediately in the `reason` function.
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const redisPublisher = redisClient.duplicate();

const limiter = new Bottleneck({
    maxConcurrent: parseInt(process.env.REASONING_CONCURRENCY ?? "1", 10), // Lower concurrency for safety with multi-stage
    minTime: 3000, // At least 3 seconds between OpenAI calls
});

// --- Zod Schemas (as defined previously, ensure they are accurate) ---
const inputCompanyAnalysisSchema = z.object({
  source_url: z.string().url().describe("The specific URL of the company website that was analyzed."),
  company_name: z.string().optional().describe("The name of the company derived from the content of the source_url."),
  website_summary: z.string().min(10).optional().describe("A brief summary (2-3 sentences) of what the company at source_url does or its main purpose, based on the provided text."),
  analysis_against_prompt: z.string().min(20).describe("The detailed analysis of this specific company/URL against the user's research prompt/topic. This should be comprehensive and directly address the prompt."),
  key_findings: z.array(z.string().min(5)).min(1).optional().describe("A list of 2-5 specific, bullet-point style key findings or takeaways directly relevant to the research topic for this company."),
});

const identifiedCompetitorSchema = z.object({
  name: z.string().min(1).describe("The name of the competitor business identified from the combined text."),
  website: z.string().url().optional().describe("The competitor's primary website URL, if found or inferred."),
  description: z.string().min(10).optional().describe("A brief description (2-3 sentences) of the competitor, their focus, or unique selling proposition."),
  analysis_against_prompt: z.string().min(20).describe("A brief analysis of how this competitor relates to or compares against the original research prompt/topic."),
  strengths: z.array(z.string().min(3)).optional().describe("Observed strengths or advantages of this competitor (2-3 points)."),
  weaknesses: z.array(z.string().min(3)).optional().describe("Observed weaknesses or disadvantages of this competitor (2-3 points)."),
  key_offerings: z.array(z.string().min(3)).optional().describe("Key products, services, or solutions offered by this competitor (2-3 points).")
});

const finalOutputSchema = z.object({
  input_company_analyses: z.array(inputCompanyAnalysisSchema).describe("Analysis for each of the user-provided input URLs."),
  identified_competitors: z.array(identifiedCompetitorSchema).optional().describe("A list of other direct competitors identified from the combined text of input URLs."),
  overall_analysis_summary: z.string().min(20).optional().describe("A concluding summary (3-5 sentences) of the overall market landscape, trends, or insights based on all analyses, specifically related to the user's research topic."),
});

interface ReasoningJobData {
  researchJobId: string;
  detailed_pages_data: Array<{url: string; markdown: string | null; error?: string; /* title?: string; */ }>; // title is optional
  researchTopic: string;
}

async function reason(job: Job<ReasoningJobData>) {
  const { researchJobId, researchTopic, detailed_pages_data } = job.data;
  
  console.log(`[ReasoningWorker] ---- START JOB ${job.id} (Research ID: ${researchJobId}) ----`);
  console.log(`[ReasoningWorker] Received researchTopic: "${researchTopic}" (type: ${typeof researchTopic})`);
  console.log(`[ReasoningWorker] Received detailed_pages_data:`, detailed_pages_data ? `Array with ${detailed_pages_data.length} items` : detailed_pages_data);
  if (detailed_pages_data && detailed_pages_data.length > 0) {
    detailed_pages_data.forEach((pg, idx) => {
        console.log(`[ReasoningWorker] PageData[${idx}]: URL: ${pg.url}, HasMarkdown: ${!!pg.markdown}, MarkdownLength: ${pg.markdown?.length || 0}, Error: ${pg.error || 'N/A'}`);
    });
  }

  if (!openai) {
    console.error(`[ReasoningWorker] EXIT_REASON: OpenAI client not initialized for job ${researchJobId}. API key missing?`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "Reasoning engine not configured on server." }));
    await supabase.from('research_jobs').update({ status: 'error', result: { error: 'Reasoning engine (OpenAI) not configured.' }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("OpenAI client not initialized");
  }
  console.log("[ReasoningWorker] CHECKPOINT: OpenAI client OK.");

  if (!researchTopic || researchTopic.trim() === "") {
    console.error(`[ReasoningWorker] EXIT_REASON: Research topic is missing or empty for job ${researchJobId}. Topic was: "${researchTopic}"`);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "Research topic is missing or empty." }));
    await supabase.from('research_jobs').update({ status: 'error', result: { error: 'Research topic was missing or empty for AI analysis.' }, finished_at: new Date().toISOString() }).eq('id', researchJobId);
    throw new Error("Research topic is missing or empty");
  }
  console.log("[ReasoningWorker] CHECKPOINT: Research topic OK.");

  if (!detailed_pages_data || detailed_pages_data.length === 0 || !detailed_pages_data.some(p => p.markdown && p.markdown.trim() !== "")) {
    console.warn(`[ReasoningWorker] EXIT_REASON: No processable markdown content in detailed_pages_data for job ${researchJobId}.`);
    const resultWithError: z.infer<typeof finalOutputSchema> = {
        input_company_analyses: detailed_pages_data ? detailed_pages_data.map(p => ({ source_url: p.url, company_name: new URL(p.url).hostname, analysis_against_prompt: p.error || "No content to analyze for this URL.", website_summary: p.error ? `Scraping error: ${p.error}` : "No content available." })) : [],
        identified_competitors: [],
        overall_analysis_summary: "No content was available from the provided URLs to perform analysis."
    };
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "done" })); // Publish done so frontend stops waiting
    await supabase.from('research_jobs').update({ 
        status: 'completed', // Or 'error' - 'completed' with empty/error results might be better UX
        result: resultWithError, 
        finished_at: new Date().toISOString() 
    }).eq('id', researchJobId);
    console.log(`[ReasoningWorker] Job ${job.id} (Research ID: ${researchJobId}) finished early due to no processable content.`);
    return; 
  }
  console.log("[ReasoningWorker] CHECKPOINT: detailed_pages_data OK and has processable content.");

  const finalResult: z.infer<typeof finalOutputSchema> = {
    input_company_analyses: [],
    identified_competitors: [],
    overall_analysis_summary: "", // Initialize as empty string
  };

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // --- Stage 1: Analyze each user-provided URL against the researchTopic ---
  console.log(`[ReasoningWorker] STARTING STAGE 1: Individual company analysis for ${detailed_pages_data.length} URLs. Job ID: ${researchJobId}`);
  for (const pageData of detailed_pages_data) {
    if (!pageData.markdown || pageData.markdown.trim() === "") {
      console.warn(`[ReasoningWorker] STAGE 1: No markdown content for URL: ${pageData.url} (Job ID: ${researchJobId}). Skipping analysis for this URL.`);
      const skippedAnalysis: z.infer<typeof inputCompanyAnalysisSchema> = {
        source_url: pageData.url,
        company_name: new URL(pageData.url).hostname, // Use hostname if title not available
        analysis_against_prompt: "Skipped: No content available from this URL to analyze.",
        website_summary: pageData.error ? `Could not retrieve content: ${pageData.error}` : "No content available or content was empty.",
      };
      finalResult.input_company_analyses.push(skippedAnalysis);
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
          type: "partial_input_analysis",
          payload: skippedAnalysis
      }));
      continue;
    }

    const truncatedMarkdown = pageData.markdown.slice(0, MAX_CONTENT_LENGTH_PER_URL);
    const selfAnalysisSystemPrompt = `You are a specialized market research analyst. Your task is to analyze the provided text scraped from a single company website (URL: ${pageData.url}). 
Focus strictly on how this specific company and its content relate to the following research topic: "${researchTopic}".
Provide a concise summary of the website's main purpose or offerings (2-3 sentences). 
Then, give a detailed analysis of the company concerning the research topic. 
Finally, list 2-5 specific, bullet-point style key findings directly relevant to the research topic for this company.
Avoid mentioning competitors or making broad market statements; focus solely on this one company's information as it pertains to the research topic.
Return the information in JSON format according to the following JSON Schema. Ensure your output strictly adheres to this schema.

JSON Schema:
${JSON.stringify(zodToJsonSchema(inputCompanyAnalysisSchema, "inputCompanyAnalysisSchema"), null, 2)}`;

    const messages = [
      { role: "system", content: selfAnalysisSystemPrompt },
      { role: "user", content: `Here is the scraped website content for ${pageData.url} to analyze against the research topic "${researchTopic}":\n\n${truncatedMarkdown}` },
    ];

    console.log(`[ReasoningWorker] STAGE 1 PRE-CALL: About to call OpenAI for self-analysis of ${pageData.url}. Content length: ${truncatedMarkdown.length}. Prompt (first 300 chars): ${selfAnalysisSystemPrompt.substring(0,300)}... Job ID: ${researchJobId}`);
    try {
      const selfAnalysisResponse = await limiter.schedule(() => openai!.chat.completions.create({ // Added non-null assertion as openai is checked above
        model: "gpt-4o-mini",
        stream: false,
        response_format: { type: "json_object" },
        messages: messages as any,
        max_tokens: O3_MAX_TOKENS_STAGE1,
        temperature: 0.2,
      }));

      totalInputTokens += selfAnalysisResponse.usage?.prompt_tokens ?? 0;
      totalOutputTokens += selfAnalysisResponse.usage?.completion_tokens ?? 0;
      console.log(`[ReasoningWorker] STAGE 1 POST-CALL: OpenAI response received for ${pageData.url}. Tokens (P/C): ${selfAnalysisResponse.usage?.prompt_tokens}/${selfAnalysisResponse.usage?.completion_tokens}. Job ID: ${researchJobId}`);
      const rawSelfAnalysisJson = selfAnalysisResponse.choices[0].message?.content;

      if (!rawSelfAnalysisJson) {
        console.error(`[ReasoningWorker] STAGE 1: OpenAI returned empty content for self-analysis of ${pageData.url}. Job ID: ${researchJobId}`);
        const errorAnalysis: z.infer<typeof inputCompanyAnalysisSchema> = {
          source_url: pageData.url,
          company_name: new URL(pageData.url).hostname,
          analysis_against_prompt: "Error: AI returned empty analysis for this URL.",
          website_summary: "N/A due to AI error.",
        };
        finalResult.input_company_analyses.push(errorAnalysis);
      } else {
        console.log(`[ReasoningWorker] STAGE 1 RAW JSON for ${pageData.url} (first 500 chars): ${rawSelfAnalysisJson.substring(0,500)}... Job ID: ${researchJobId}`);
        const parsedSelfAnalysis = inputCompanyAnalysisSchema.safeParse(JSON.parse(rawSelfAnalysisJson)); // Ensure JSON.parse is within try-catch if needed
        if (parsedSelfAnalysis.success) {
          console.log(`[ReasoningWorker] STAGE 1 ZOD SUCCESS for ${pageData.url}. Job ID: ${researchJobId}`);
          finalResult.input_company_analyses.push(parsedSelfAnalysis.data);
        } else {
          console.error(`[ReasoningWorker] STAGE 1 ZOD FAIL for ${pageData.url}: `, parsedSelfAnalysis.error.format(), `. Job ID: ${researchJobId}`);
          console.error(`[ReasoningWorker] STAGE 1: Failed JSON from OpenAI for ${pageData.url}: ${rawSelfAnalysisJson}`);
          const schemaErrorAnalysis: z.infer<typeof inputCompanyAnalysisSchema> = {
            source_url: pageData.url,
            company_name: new URL(pageData.url).hostname,
            analysis_against_prompt: `Error: AI analysis for this URL did not match expected structure. Details: ${parsedSelfAnalysis.error.toString().substring(0,200)}`,
            website_summary: "N/A due to AI schema error.",
          };
          finalResult.input_company_analyses.push(schemaErrorAnalysis);
        }
      }
      // Publish after each analysis (success or handled error)
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
        type: "partial_input_analysis",
        payload: finalResult.input_company_analyses[finalResult.input_company_analyses.length - 1]
      }));

    } catch (e: any) {
      console.error(`[ReasoningWorker] STAGE 1: Exception during self-analysis of ${pageData.url}: `, e.message, e.stack, `. Job ID: ${researchJobId}`);
      const exceptionAnalysis: z.infer<typeof inputCompanyAnalysisSchema> = {
        source_url: pageData.url,
        company_name: new URL(pageData.url).hostname,
        analysis_against_prompt: `Exception during AI analysis for this URL: ${e.message.substring(0,200)}`,
        website_summary: "N/A due to AI exception.",
      };
      finalResult.input_company_analyses.push(exceptionAnalysis);
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
        type: "partial_input_analysis",
        payload: exceptionAnalysis
      }));
    }
  } // End of Stage 1 loop
  console.log(`[ReasoningWorker] COMPLETED STAGE 1. Analyzed ${finalResult.input_company_analyses.length} URLs. Job ID: ${researchJobId}`);

  // --- Stage 2: Identify other competitors and provide overall summary ---
  console.log(`[ReasoningWorker] STARTING STAGE 2: Competitor identification and overall summary. Job ID: ${researchJobId}`);
  
  const validMarkdowns = detailed_pages_data
      .map(p => p.markdown)
      .filter((md): md is string => typeof md === 'string' && md.trim() !== ""); // Type guard

  let combinedMarkdownForStage2 = "";
  if (validMarkdowns.length > 0) {
    combinedMarkdownForStage2 = validMarkdowns.join("\n\n---\n\n").slice(0, MAX_OVERALL_CONTENT_LENGTH);
    console.log(`[ReasoningWorker] Combined ${validMarkdowns.length} markdown documents for Stage 2. Total length (sliced): ${combinedMarkdownForStage2.length}. Job ID: ${researchJobId}`);
  }


  if (!combinedMarkdownForStage2 || combinedMarkdownForStage2.trim() === "") {
    console.warn(`[ReasoningWorker] STAGE 2: No combined markdown content available for competitor analysis. Skipping. Job ID: ${researchJobId}`);
    finalResult.overall_analysis_summary = "No content was available from input URLs to identify other competitors or create an overall summary.";
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
      type: "overall_summary",
      payload: { overall_analysis_summary: finalResult.overall_analysis_summary }
    }));
  } else {
    const competitorIdSystemPrompt = `You are a senior market-research analyst. 
Your first task is to analyze the COMBINED text scraped from one or more company websites. 
Based SOLELY on this combined text, identify up to 3-5 other companies that appear to be DIRECT COMPETITORS to the company/companies whose websites were scraped. 
Direct competitors offer similar products/services or target similar customer segments in relation to the original research topic: "${researchTopic}".
For each identified competitor, provide its name, website (if found/inferable), a brief description, an analysis of how it relates to the research topic, and optionally its strengths, weaknesses, and key offerings. 
Your second task is to provide an "overall_analysis_summary". This summary should synthesize insights from all provided content and your analyses, focusing on the broader implications related to "${researchTopic}".
Do NOT include the originally scraped companies (whose content is provided) in the "identified_competitors" list. Only list *other* companies found within the text. If no other competitors are evident in the text, return an empty list for "identified_competitors".
Return all information in JSON format according to the following JSON Schema. Ensure your output strictly adheres to this schema.

JSON Schema for "identified_competitors" and "overall_analysis_summary" part:
${JSON.stringify(zodToJsonSchema(z.object({ identified_competitors: z.array(identifiedCompetitorSchema).optional(), overall_analysis_summary: z.string().optional() }), "competitorIdSchema"), null, 2)}`;

    const messagesStage2 = [
      { role: "system", content: competitorIdSystemPrompt },
      { role: "user", content: `Here is the COMBINED scraped website content to analyze for other competitors and an overall summary, based on the research topic "${researchTopic}":\n\n${combinedMarkdownForStage2}` },
    ];

    console.log(`[ReasoningWorker] STAGE 2 PRE-CALL: About to call OpenAI for competitor ID/summary. Content length: ${combinedMarkdownForStage2.length}. Prompt (first 300 chars): ${competitorIdSystemPrompt.substring(0,300)}... Job ID: ${researchJobId}`);
    try {
      const stage2Response = await limiter.schedule(() => openai!.chat.completions.create({ // Added non-null assertion
        model: "gpt-4o-mini",
        stream: false,
        response_format: { type: "json_object" },
        messages: messagesStage2 as any,
        max_tokens: O3_MAX_TOKENS_STAGE2, 
        temperature: 0.3,
      }));

      totalInputTokens += stage2Response.usage?.prompt_tokens ?? 0;
      totalOutputTokens += stage2Response.usage?.completion_tokens ?? 0;
      console.log(`[ReasoningWorker] STAGE 2 POST-CALL: OpenAI response received. Tokens (P/C): ${stage2Response.usage?.prompt_tokens}/${stage2Response.usage?.completion_tokens}. Job ID: ${researchJobId}`);
      const rawStage2Json = stage2Response.choices[0].message?.content;

      if (!rawStage2Json) {
        console.error(`[ReasoningWorker] STAGE 2: OpenAI returned empty content. Job ID: ${researchJobId}`);
        finalResult.overall_analysis_summary = "Error: AI returned empty content for competitor identification and summary.";
      } else {
        console.log(`[ReasoningWorker] STAGE 2 RAW JSON (first 500 chars): ${rawStage2Json.substring(0,500)}... Job ID: ${researchJobId}`);
        const parsedStage2Data = z.object({ identified_competitors: z.array(identifiedCompetitorSchema).optional(), overall_analysis_summary: z.string().optional() }).safeParse(JSON.parse(rawStage2Json));
        
        if (parsedStage2Data.success) {
          console.log(`[ReasoningWorker] STAGE 2 ZOD SUCCESS. Job ID: ${researchJobId}`);
          finalResult.identified_competitors = parsedStage2Data.data.identified_competitors || [];
          finalResult.overall_analysis_summary = parsedStage2Data.data.overall_analysis_summary || "No overall summary provided by AI for Stage 2.";
            console.log(`[ReasoningWorker] STAGE 2: Found ${finalResult.identified_competitors.length} competitors. Job ID: ${researchJobId}`);

          if (finalResult.identified_competitors.length > 0) {
            await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
              type: "identified_competitors_batch",
              payload: finalResult.identified_competitors
            }));
          }
        } else {
          console.error(`[ReasoningWorker] STAGE 2 ZOD FAIL: `, parsedStage2Data.error.format(), `. Job ID: ${researchJobId}`);
          console.error(`[ReasoningWorker] STAGE 2: Failed JSON from OpenAI: ${rawStage2Json}`);
          finalResult.overall_analysis_summary = `Error: AI output for competitors/summary did not match expected structure. Details: ${parsedStage2Data.error.toString().substring(0,200)}`;
        }
      }
      // Always publish overall_summary event, even if it's an error message or default
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
        type: "overall_summary",
        payload: { overall_analysis_summary: finalResult.overall_analysis_summary || "Summary processing encountered an issue." }
      }));

    } catch (e: any) {
      console.error(`[ReasoningWorker] STAGE 2: Exception during competitor/summary analysis: `, e.message, e.stack, `. Job ID: ${researchJobId}`);
      finalResult.overall_analysis_summary = `Exception during AI competitor/summary analysis: ${e.message.substring(0,200)}`;
      await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({
        type: "overall_summary", // Publish the error as the summary
        payload: { overall_analysis_summary: finalResult.overall_analysis_summary }
      }));
    }
  } 
  console.log(`[ReasoningWorker] COMPLETED STAGE 2. Job ID: ${researchJobId}`);

  // --- Finalize and Save ---
  const calculatedTotalCost = (totalInputTokens * TOKEN_PRICE_INPUT) + (totalOutputTokens * TOKEN_PRICE_OUTPUT);
  console.log(`[ReasoningWorker] FINAL STATS - Total Input Tokens: ${totalInputTokens}, Total Output Tokens: ${totalOutputTokens}, Calculated Total Cost: $${calculatedTotalCost.toFixed(6)}`);
  console.log(`[ReasoningWorker] Storing final result for ${researchJobId}. input_company_analyses: ${finalResult.input_company_analyses.length}, identified_competitors: ${finalResult.identified_competitors?.length}, overall_analysis_summary present: ${!!finalResult.overall_analysis_summary}`);
  
  const { error: updateError } = await supabase
    .from('research_jobs')
    .update({
      status: 'completed',
      result: finalResult, 
      finished_at: new Date().toISOString(),
      credits_used: calculatedTotalCost 
    })
    .eq('id', researchJobId);

  if (updateError) {
    console.error(`[ReasoningWorker] Error updating research_job ${researchJobId} to 'completed':`, updateError);
    await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "error", message: "Failed to save final results to database.", details: updateError.message }));
  } else {
     await redisPublisher.publish(`research:${researchJobId}`, JSON.stringify({ type: "done" }));
  }
  console.log(`[ReasoningWorker] Job ${job.id} (Research ID: ${researchJobId}) finished processing.`);
}

// --- Worker Initialization ---
console.log('[ReasoningWorker] Initializing...');
if (OPENAI_API_KEY && openai) { // Check if openai client was successfully initialized
    const reasoningWorker = new Worker<ReasoningJobData>("reasoning", reason, {
        concurrency: parseInt(process.env.REASONING_CONCURRENCY ?? "1", 10), // Lowered default concurrency for multi-stage
        connection: redisClient.duplicate(), // Ensure this uses ioredis if redisClient does
    });
    
    reasoningWorker.on('completed', (job: Job<ReasoningJobData>) => { // Added type for job
        console.log(`[ReasoningWorker] BullMQ Job ${job.id} (research ID: ${job.data.researchJobId}) completed.`);
    });
    
    reasoningWorker.on('failed', async (job: Job<ReasoningJobData> | undefined, err: Error) => {
      console.error(`[ReasoningWorker] BullMQ Job ${job?.id} (research ID: ${job?.data.researchJobId}) FAILED IN BULLMQ HANDLER:`, err.message, err.stack);
      if (job?.data.researchJobId) {
        // Avoid double-updating if specific errors were already handled and status set in `reason`
        const handledErrorMessages = [
            "OpenAI client not initialized",
            "Research topic is missing or empty",
            // Add other specific error messages that already update Supabase within `reason`
        ];
        if (!handledErrorMessages.some(handledErr => err.message.includes(handledErr))) {
            try {
                await supabase.from('research_jobs').update({ 
                    status: 'error', 
                    result: { error: `Reasoning worker failed critically: ${err.message}` },
                    finished_at: new Date().toISOString() 
                }).eq('id', job.data.researchJobId);
                // Also publish a generic error via SSE if it's a critical failure not caught inside reason
                await redisPublisher.publish(`research:${job.data.researchJobId}`, JSON.stringify({ type: "error", message: `Reasoning process encountered a critical failure: ${err.message}` }));
            } catch (dbError) {
                console.error(`[ReasoningWorker] Failed to update Supabase for job ${job.data.researchJobId} after BullMQ failure:`, dbError);
            }
        }
      }
    });
    console.log('[ReasoningWorker] Worker started and listening for reasoning jobs.');
} else {
    console.warn('[ReasoningWorker] OPENAI_API_KEY is not set or OpenAI client failed to initialize. Worker will NOT start. Jobs sent to reasoning queue will stall.');
} 