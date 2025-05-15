import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LinearProgress from "@/components/research/LinearProgress";
import CompetitorCards from "@/components/research/CompetitorCards";
import InputCompanyAnalysisDisplay from "@/components/research/InputCompanyAnalysisDisplay";
import type {
  ResearchJob,
  InputCompanyAnalysis,
  IdentifiedCompetitor,
  StreamedData,
  FinalOutputData
} from '@/types/research';

// Helper function to fetch research job details
async function fetchResearchJob(jobId: string): Promise<ResearchJob | null> {
  if (!jobId || jobId === 'undefined') {
    console.warn("[fetchResearchJob] Invalid jobId provided:", jobId);
    return null;
  }
  console.log("[fetchResearchJob] Fetching for jobId:", jobId);
  const res = await fetch(`/api/research/${jobId}`);
  if (!res.ok) {
    if (res.status === 404) {
      console.log("[fetchResearchJob] Job not found (404):", jobId);
      return null;
    }
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Failed to fetch research job ${jobId}: ${errorData.message || res.statusText}`);
  }
  return res.json();
}

export default function useResearchJob(jobId: string | null) {
  const queryClient = useQueryClient();
  const [streamedInputAnalyses, setStreamedInputAnalyses] = useState<InputCompanyAnalysis[]>([]);
  const [streamedIdentifiedCompetitors, setStreamedIdentifiedCompetitors] = useState<IdentifiedCompetitor[]>([]);
  const [streamedOverallSummary, setStreamedOverallSummary] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const { data: job, isLoading, error: queryError, refetch } = useQuery<ResearchJob | null, Error>({
    queryKey: ['researchJob', jobId],
    queryFn: () => {
      if (!jobId || jobId === 'undefined') {
        console.warn("[useResearchJob queryFn] Invalid jobId, not fetching:", jobId);
        return Promise.resolve(null);
      }
      return fetchResearchJob(jobId);
    },
    enabled: !!jobId && jobId !== 'undefined',
    refetchInterval: (query) => {
        const jobData = query.state.data as ResearchJob | undefined;
        return (jobData && jobData.status !== 'completed' && jobData.status !== 'error') ? 5000 : false;
    },
    refetchOnWindowFocus: true, 
  });

  const jobStatus = job?.status;

  useEffect(() => {
    if (!jobId || jobId === 'undefined' || !jobStatus) {
      console.log(`[useResearchJob SSE] Skipping EventSource setup: jobId=${jobId}, jobStatus=${jobStatus}`);
      return;
    }

    if (jobStatus !== 'reasoning') {
        console.log(`[useResearchJob SSE] Skipping EventSource for jobId ${jobId} because status is '${jobStatus}', not 'reasoning'.`);
        return;
    }
    
    console.log(`[useResearchJob SSE] Resetting ALL stream states for job ${jobId} before connecting (status: ${jobStatus}).`);
    setStreamedInputAnalyses([]);
    setStreamedIdentifiedCompetitors([]);
    setStreamedOverallSummary(null);
    setStreamError(null);

    console.log(`[useResearchJob SSE] Attempting to connect for jobId: ${jobId}, status: ${jobStatus}`);
    const es = new EventSource(`/api/research/${jobId}/stream`);

    es.onmessage = (e) => {
      try {
        const parsedData: StreamedData = JSON.parse(e.data);
        console.log("[useResearchJob SSE] Message received:", parsedData);

        if (parsedData.type === "partial_input_analysis" && parsedData.payload) {
          setStreamedInputAnalyses(prev => [...prev, parsedData.payload as InputCompanyAnalysis]);
        } else if (parsedData.type === "identified_competitors_batch" && parsedData.payload) {
          // Assuming payload is the full array of identified competitors each time, or append if it's incremental
          setStreamedIdentifiedCompetitors(parsedData.payload as IdentifiedCompetitor[]);
        } else if (parsedData.type === "overall_summary" && parsedData.payload?.overall_analysis_summary) {
          setStreamedOverallSummary(parsedData.payload.overall_analysis_summary);
        } else if (parsedData.type === "error") {
          setStreamError(parsedData.message || "An error occurred during research processing.");
          console.error("[useResearchJob SSE] Stream error:", parsedData.message, parsedData.details);
          es.close();
        } else if (parsedData.type === "done") {
          console.log("[useResearchJob SSE] Stream marked as done for job:", jobId);
          queryClient.invalidateQueries({ queryKey: ['researchJob', jobId] }); // Refetch final job state
          es.close();
        }
      } catch (err) {
        console.error("[useResearchJob SSE] Failed to parse SSE message:", e.data, err);
        setStreamError("Received malformed data from server.");
        es.close();
      }
    };

    es.onerror = (e) => {
      console.error(`[useResearchJob SSE] EventSource failed for ${jobId}:`, e);
      setStreamError(`Connection to research stream lost for job ${jobId}.`);
      es.close(); 
    };

    return () => {
      console.log(`[useResearchJob SSE] Closing stream for ${jobId} due to component unmount or dependency change (jobId, jobStatus).`);
      es.close();
    };
  }, [jobId, jobStatus, queryClient]); // queryClient is stable

  if (!jobId || jobId === 'undefined') {
    return { display: <p className="text-center my-4">Please select or start a research job.</p>, job: null, isLoading: false, error: null, refetch };
  }
  
  if (isLoading && !job) return { display: <LinearProgress label="Loading research job details..." />, job, isLoading, error: queryError, refetch };
  if (queryError) return { display: <p className="text-red-500">Error loading job: {queryError.message}</p>, job, isLoading, error: queryError, refetch };
  if (!job) return { display: <p>Research job not found or still loading...</p>, job, isLoading, error: null, refetch };

  // Display based on status
  if (job.status === 'queued_scrape' || job.status === 'scraping') {
    return { display: <LinearProgress label="Scraping websites..." />, job, isLoading, error: null, refetch };
  }

  if (job.status === 'reasoning') {
    if (streamError) return { display: <p className="text-red-500">Stream Error: {streamError}</p>, job, isLoading, error: streamError, refetch };
    return {
      display: (
        <div className="space-y-6">
          <LinearProgress label="Analyzing & Generating Insights..." />
          {streamedInputAnalyses.length > 0 && (
            <InputCompanyAnalysisDisplay analyses={streamedInputAnalyses} />
          )}
          {streamedIdentifiedCompetitors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Identified Competitors:</h3>
              <CompetitorCards data={streamedIdentifiedCompetitors} />
            </div>
          )}
          {streamedOverallSummary && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Overall Analysis Summary:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{streamedOverallSummary}</p>
            </div>
          )}
          {streamedInputAnalyses.length === 0 && streamedIdentifiedCompetitors.length === 0 && !streamedOverallSummary && !streamError && (
            <p className="text-center my-4 text-muted-foreground">Waiting for insights...</p>
          )}
        </div>
      ),
      job, isLoading, error: null, refetch
    };
  }

  if (job.status === 'completed') {
    const resultData = job.result as FinalOutputData; // Assuming if completed, result is FinalOutputData
        return { 
      display: (
        <div className="space-y-6">
          {resultData?.input_company_analyses && resultData.input_company_analyses.length > 0 && (
            <InputCompanyAnalysisDisplay analyses={resultData.input_company_analyses} />
          )}
          {resultData?.identified_competitors && resultData.identified_competitors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Identified Competitors:</h3>
              <CompetitorCards data={resultData.identified_competitors} />
            </div>
          )}
          {resultData?.overall_analysis_summary && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Overall Analysis Summary:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{resultData.overall_analysis_summary}</p>
            </div>
          )}
          {(!resultData?.input_company_analyses?.length && !resultData?.identified_competitors?.length && !resultData?.overall_analysis_summary) && (
             <p className="text-center my-4">Research completed. No specific insights generated.</p>
          )}
        </div>
      ),
      job, isLoading, error: null, refetch
    };
  }

  if (job.status === 'error') {
    const errorMessage = (job.result as { error?: string })?.error || "Unknown error during processing.";
    return { display: <p className="text-red-500">Research failed: {errorMessage}</p>, job, isLoading, error: errorMessage, refetch };
  }

  return { display: <p>Job status: {job.status || 'Initializing...'}</p>, job, isLoading, error: null, refetch };
} 