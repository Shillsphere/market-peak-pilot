import axios from 'axios';
import { z } from 'zod';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { encode } from 'gpt-tokenizer'; // Using gpt-tokenizer as suggested
import OpenAI from 'openai'; // Import OpenAI type for embedChunks
import { AbortController } from "node-abort-controller"; // Use node-abort-controller for Node < 15 compatibility if needed, or built-in
import { Embedding } from 'openai/resources/embeddings.mjs'; // Import Embedding type

// Placeholder for SERP results
const SerpResultSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string().optional(), // Add other fields as needed from your search API
});
type SerpResult = z.infer<typeof SerpResultSchema>;

// --- Tavily Web Search --- 

const TavilyResultSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  content: z.string(), // Tavily provides scraped content directly
  score: z.number(),
  raw_content: z.string().optional().nullable(),
});
type TavilyResult = z.infer<typeof TavilyResultSchema>;

const TavilyResponseSchema = z.object({
  results: z.array(TavilyResultSchema),
  // Include other fields from Tavily response if needed
});

/**
 * Performs web search using the Tavily API.
 */
export async function webSearch(prompt: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set.');
  }

  console.log(`[webSearch] Performing Tavily search for prompt: "${prompt}"`);
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: apiKey,
        query: prompt,
        search_depth: "basic", // or "advanced"
        include_answer: false, // We don't need Tavily's answer, just the sources
        include_raw_content: false,
        max_results: 7, // Get a few extra results
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsed = TavilyResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error('[webSearch] Failed to parse Tavily response:', parsed.error);
      throw new Error('Invalid response format from Tavily API.');
    }

    console.log(`[webSearch] Tavily search successful, found ${parsed.data.results.length} results.`);
    // We might not need the 'content' from Tavily if Firecrawl is used next
    return parsed.data.results;
  } catch (error: any) { // Catch specific axios errors if needed
    console.error('[webSearch] Error calling Tavily API:', error.response?.data || error.message);
    throw new Error(`Tavily API request failed: ${error.message}`);
  }
}

// --- Firecrawl Web Scraping ---

interface FirecrawlScrapeResult {
    content: string; // Cleaned text content
    markdown: string; // Content in Markdown format
    metadata: { 
        title?: string; 
        description?: string; 
        // Other metadata fields...
    }
    // Other fields like sourceURL, ogData etc.
}

/**
 * Scrapes a URL using the Firecrawl API.
 * Returns the content as clean Markdown.
 */
export async function scrapeUrl(url: string): Promise<{ markdown: string; title: string | undefined }> {
  const apiKey = process.env.FIREECRAWL_API_KEY; // Note the variable name typo in .env
  if (!apiKey) {
    throw new Error('FIREECRAWL_API_KEY environment variable is not set.');
  }

  console.log(`[scrapeUrl] Performing Firecrawl scrape for URL: ${url}`);
  try {
    const response = await axios.post<FirecrawlScrapeResult>(
      'https://api.firecrawl.dev/v0/scrape',
      {
        url: url,
        pageOptions: {
          onlyMainContent: true, // Try to get only the main article/content
          includeHtml: false // We only need markdown or text
        }
      },
      {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000 // 30 second timeout for scraping
      }
    );

    if (response.status === 200 && response.data && response.data.markdown) {
      console.log(`[scrapeUrl] Firecrawl scrape successful for ${url}. Markdown length: ${response.data.markdown.length}`);
      // Truncate markdown if it's excessively long (e.g., > 50k chars)?
      const MAX_MD_LENGTH = 50000;
      const truncatedMarkdown = response.data.markdown.length > MAX_MD_LENGTH 
                               ? response.data.markdown.substring(0, MAX_MD_LENGTH) + '... [truncated]' 
                               : response.data.markdown;
                               
      return { markdown: truncatedMarkdown, title: response.data.metadata?.title };
    } else {
      console.error(`[scrapeUrl] Firecrawl returned status ${response.status} or missing data for ${url}. Response:`, response.data);
      throw new Error(`Firecrawl scrape failed for ${url} with status ${response.status}`);
    }
  } catch (error: any) {
    console.error(`[scrapeUrl] Error calling Firecrawl API for ${url}:`, error.response?.data || error.message);
    throw new Error(`Firecrawl API request failed for ${url}: ${error.message}`);
  }
}

// Common headers including User-Agent
const commonHeaders = {
    'User-Agent': 'MarketPeakBot/0.1 (+https://marketpeak.ai)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    // Add other headers if needed
};

/**
 * Fetches search results from an unofficial DuckDuckGo API.
 * @param query The search query.
 * @param k Number of results to return.
 * @returns Array of URLs.
 */
export async function fetchSearchLinks(query: string, k = 5): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const searchUrl = `https://ddg-webapp-aagd.vercel.app/search.json?q=${encodeURIComponent(query)}`;
    console.log(`[WebUtils] Fetching search results from: ${searchUrl}`);
    const res = await fetch(searchUrl, {
        headers: commonHeaders,
        signal: controller.signal // Pass abort signal
    });

    if (!res.ok) {
        throw new Error(`Search API request failed with status ${res.status}: ${await res.text()}`);
    }

    // Assuming the response is JSON with a results array containing { url, title, body }
    const json: any = await res.json();
    if (!json || !Array.isArray(json.results)) {
         console.warn("[WebUtils] Unexpected search API response format:", json);
         return [];
    }
    
    // Extract URLs from the results
    return json.results.slice(0, k).map((r: any) => r.url).filter((url: any) => typeof url === 'string');
  } catch (error: any) {
      if (error.name === 'AbortError') {
          console.error(`[WebUtils] Search request timed out for query "${query}".`);
      } else {
          console.error(`[WebUtils] Error fetching search links for query "${query}":`, error);
      }
      return []; // Return empty array on error or timeout
  } finally {
    clearTimeout(timeoutId); // Clear the timeout watcher
  }
}

/**
 * Fetches HTML content of a URL, extracts title and body text, and splits text into chunks.
 * @param url The URL to scrape.
 * @returns Object containing title and an array of text chunks.
 */
export async function fetchAndChunk(url: string): Promise<{ title: string; chunks: string[] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  console.log(`[WebUtils] Fetching and chunking URL: ${url}`);
  try {
    const res = await fetch(url, {
        headers: commonHeaders,
        signal: controller.signal // Pass abort signal
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} with status ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text() || url; // Fallback to URL if title missing
    
    // Attempt to get main content, fallback to body
    let text = ($('main').text() || $('article').text() || $('body').text());
    text = text.replace(/\s+/g, " ").trim(); // Normalize whitespace

    if (!text) {
        console.warn(`[WebUtils] No significant text content found on ${url}`);
        return { title, chunks: [] };
    }

    // Split text into chunks based on token count (using gpt-tokenizer)
    const tokens = encode(text);
    const chunks: string[] = [];
    // Adjusted chunk size slightly smaller to be safer with limits
    const CHUNK_SIZE_TOKENS = 800; 
    
    // Naive chunking by token count - might split mid-sentence. 
    // More sophisticated chunking (e.g., RecursiveCharacterTextSplitter from langchain) is better.
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE_TOKENS) {
        const tokenSlice = tokens.slice(i, i + CHUNK_SIZE_TOKENS);
        // Note: Joining tokens directly might not perfectly reconstruct the text,
        // It's better to decode the slice if the tokenizer supports it, or map tokens back to text slices.
        // For simplicity here, we join with space - accuracy may vary.
        chunks.push(tokenSlice.join(" ")); 
    }

    console.log(`[WebUtils] Extracted title "${title.substring(0,50)}..." and created ${chunks.length} chunks from ${url}`);
    return { title, chunks };

  } catch (error: any) {
      if (error.name === 'AbortError') {
          console.error(`[WebUtils] Fetch request timed out for URL ${url}.`);
      } else {
        console.error(`[WebUtils] Error fetching/chunking URL ${url}:`, error);
      }
      return { title: url, chunks: [] };
  } finally {
      clearTimeout(timeoutId); // Clear the timeout watcher
  }
}

/**
 * Generates embeddings for text chunks using OpenAI API.
 * @param chunks Array of text chunks.
 * @param openai Initialized OpenAI client instance.
 * @returns Array of embeddings (number arrays).
 */
export async function embedChunks(
  chunks: string[],
  openai: OpenAI // Pass the initialized client
): Promise<Array<number[]>> {
    if (chunks.length === 0) {
        console.warn("[WebUtils] No chunks provided for embedding.");
        return [];
    }
    console.log(`[WebUtils] Generating embeddings for ${chunks.length} chunks...`);

    try {
        const resp = await openai.embeddings.create({
        // Using text-embedding-3-small as suggested for potential cost savings/performance
        model: "text-embedding-3-small", 
        input: chunks,
        // dimensions: 1536 // Optionally specify dimensions if using model other than ada-002
        });
        console.log(`[WebUtils] Embeddings generated successfully.`);
        return resp.data.map((r) => r.embedding);
    } catch (error: any) { 
        console.error(`[WebUtils] Error generating embeddings:`, error);
        // Return empty arrays matching the input chunk count on error
        // This allows the worker to potentially continue but without embeddings for these chunks.
        return chunks.map(() => []); 
    }
} 