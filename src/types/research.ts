export interface InputCompanyAnalysis {
  source_url: string;
  company_name?: string;
  analysis_against_prompt: string;
  key_findings?: string[];
  website_summary?: string;
}

export interface IdentifiedCompetitor {
  name: string;
  website: string;
  description?: string;
  analysis_against_prompt: string;
  strengths?: string[];
  weaknesses?: string[];
  key_offerings?: string[];
}

export interface FinalOutputData {
  input_company_analyses: InputCompanyAnalysis[];
  identified_competitors?: IdentifiedCompetitor[];
  overall_analysis_summary?: string;
}

export interface ResearchJob {
  id: string;
  status: 'queued_scrape' | 'scraping' | 'reasoning' | 'completed' | 'error' | 'pending';
  result?: FinalOutputData | { error?: string }; // result can be the full output or an error object
  prompt_text?: string; // This is the researchTopic
  credits_used?: number;
  finished_at?: string;
  created_at: string; // Assuming this is always present
  // ... any other fields from your research_jobs table
}

// For SSE messages
export interface StreamedPayloadInputAnalysis {
  type: "partial_input_analysis";
  payload: InputCompanyAnalysis;
}

export interface StreamedPayloadIdentifiedCompetitors {
  type: "identified_competitors_batch";
  payload: IdentifiedCompetitor[]; // Assuming a full batch of identified competitors
}

export interface StreamedPayloadOverallSummary {
  type: "overall_summary";
  payload: { overall_analysis_summary: string };
}

export interface StreamedPayloadError {
  type: "error";
  message: string;
  details?: string;
}

export interface StreamedPayloadDone {
  type: "done";
}

export type StreamedData =
  | StreamedPayloadInputAnalysis
  | StreamedPayloadIdentifiedCompetitors
  | StreamedPayloadOverallSummary
  | StreamedPayloadError
  | StreamedPayloadDone; 