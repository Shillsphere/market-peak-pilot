export interface Competitor {
  id: string;
  name: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  website: string;
  key_offerings?: string[];
}

export interface ResearchJob {
  id: string;
  business_id?: string;
  user_id?: string;
  status: 'queued_scrape' | 'scraping' | 'reasoning' | 'completed' | 'error' | 'failed' | 'pending' | 'db_inserted_test';
  prompt_text?: string;
  result?: {
    competitors?: Competitor[];
    error?: string;
    analysis_summary?: string;
  } | null;
  credits_used?: number;
  created_at?: string;
  finished_at?: string;
  urls?: string[];
  research_topic?: string;
}

export interface StreamedDataPayload {
  competitors?: Competitor[];
  analysis_summary?: string;
}

export interface StreamedData {
  type: "data" | "error" | "done" | "test_ping";
  payload?: StreamedDataPayload;
  message?: string;
  details?: any;
}