import { useQuery } from "@tanstack/react-query";
import { getResearch } from "../lib/api/research";

// Define a type for the job data returned by the API
// Adjust based on the actual structure in research_jobs and research_docs
interface ResearchDoc {
    id: string;
    job_id: string;
    url?: string | null;
    title?: string | null;
    content?: string | null;
    // embedding is likely large and not needed in UI, omit?
    created_at: string;
}

export interface ResearchJob {
    id: string;
    business_id: string;
    user_id: string;
    prompt: string;
    status: 'queued' | 'running' | 'done' | 'error';
    error?: string | null;
    created_at: string;
    finished_at?: string | null;
    summary_md?: string | null;
    docs: ResearchDoc[]; // Assuming the API returns docs nested like this
    // Add research_results if your worker still uses it
    results?: { id: number; step: string; note: string | null; created_at: string; payload?: any }[];
}

const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

export const useResearchJob = (jobId?: string | null) =>
  useQuery<ResearchJob, Error>({
    queryKey: ["researchJob", jobId],
    queryFn: async () => {
        if (!jobId) throw new Error("Job ID is required");
        return getResearch(jobId!);
    },
    enabled: !!jobId,
    // Correct signature for TanStack Query v5+
    refetchInterval: (query) => {
      // Get the latest data from the query cache
      const data = query.state.data;
      // Stop polling if the job is done or errored
      if (data?.status === "done" || data?.status === "error") {
        return false; // Stop polling
      }
      return POLLING_INTERVAL_MS; // Continue polling
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  }); 