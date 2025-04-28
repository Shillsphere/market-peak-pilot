// The dotenv import is now in the entry files
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

// Keep log for verification
console.log(`[OpenAI Lib] Trying to init client. API Key loaded: ${!!apiKey}`);

// Initialize OpenAI client
// Client creation will throw if API key is missing after preloading fails
export const openai = new OpenAI({
  apiKey: apiKey! // Assert non-null, preloading should handle it
});

// Verification function still useful
export const isOpenAiConfigured = (): boolean => !!apiKey; 