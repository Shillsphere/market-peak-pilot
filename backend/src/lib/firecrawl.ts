// backend/src/lib/firecrawl.ts
import FirecrawlApp from "@mendable/firecrawl-js"; // Adjusted import based on successful installation

if (!process.env.FIRECRAWL_API_KEY) {
  console.warn("FIRECRAWL_API_KEY is not set. Firecrawl functionality will be disabled.");
}

export const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
}); 