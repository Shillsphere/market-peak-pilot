import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LinearProgress from "@/components/research/LinearProgress";
import CompetitorCards from "@/components/research/CompetitorCards";
import type { ResearchJob, Competitor, StreamedData } from '../lib/types.js';

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
    const errorText = await res.text();
    console.error(`[fetchResearchJob] Failed to fetch research job ${jobId}: ${res.status} ${res.statusText}`, errorText);
    throw new Error(`Failed to fetch research job ${jobId}: ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export default function useResearchJob(jobId: string | null) {
  const queryClient = useQueryClient();
  const [streamedCompetitors, setStreamedCompetitors] = useState<Competitor[]>([]);
  const [streamedAnalysisSummary, setStreamedAnalysisSummary] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const { data: job, isLoading, error: queryError, refetch } = useQuery<ResearchJob | null, Error>({
    queryKey: ['researchJob', jobId],
    queryFn: () => {
      // fetchResearchJob already handles the undefined/null jobId check
      return fetchResearchJob(jobId!); // Assert jobId is non-null here as 'enabled' controls execution
    },
    enabled: !!jobId && jobId !== 'undefined',
    refetchInterval: (query) => {
        const jobData = query.state.data as ResearchJob | undefined;
        return (jobData && jobData.status !== 'completed' && jobData.status !== 'error' && jobData.status !== 'failed') ? 5000 : false; // Added 'failed'
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
        // If there's an existing stream, ensure it's closed if status changes from 'reasoning'
        // This cleanup will be handled by the return function when dependencies change.
        return;
    }
    
    console.log(`[useResearchJob SSE] Resetting stream state for job ${jobId} before connecting (status: ${jobStatus}).`);
    setStreamedCompetitors([]);
    setStreamedAnalysisSummary(null);
    setStreamError(null);

    console.log(`[useResearchJob SSE] Attempting to connect for jobId: ${jobId}, status: ${jobStatus}`);
    const es = new EventSource(`/api/research/${jobId}/stream`);

    es.onmessage = (e) => {
      try {
        const parsedData: StreamedData = JSON.parse(e.data);
        console.log("[useResearchJob SSE] Message received:", parsedData);

        if (parsedData.type === "data" && parsedData.payload) {
          if (parsedData.payload.competitors) {
            setStreamedCompetitors(parsedData.payload.competitors);
          }
          if (parsedData.payload.analysis_summary) {
            setStreamedAnalysisSummary(parsedData.payload.analysis_summary);
          }
        } else if (parsedData.type === "error") {
          setStreamError(parsedData.message || "An error occurred during research processing.");
          console.error("[useResearchJob SSE] Stream error:", parsedData.message, parsedData.details);
          es.close();
        } else if (parsedData.type === "done") {
          console.log("[useResearchJob SSE] Stream marked as done for job:", jobId);
          queryClient.invalidateQueries({ queryKey: ['researchJob', jobId] });
          es.close();
        } else if (parsedData.type === "test_ping") {
          // console.log("[useResearchJob SSE] Received test_ping for job:", jobId); // Optional: reduce noise
        }
      } catch (err) {
        console.error("[useResearchJob SSE] Failed to parse SSE message:", e.data, err);
        setStreamError("Received malformed data from server.");
        es.close();
      }
    };

    es.onerror = (e) => {
      console.error(`[useResearchJob SSE] EventSource failed for ${jobId}:`, e);
      setStreamError(`Connection to research stream lost for job ${jobId}. May attempt to reconnect.`);
      // EventSource typically attempts to reconnect automatically.
      // Closing it here might prevent reconnection. Consider only closing if error is fatal.
      // For now, let's keep es.close() to ensure we don't have lingering broken connections.
      es.close(); 
    };

    return () => {
      console.log(`[useResearchJob SSE] Closing stream for ${jobId} due to component unmount or dependency change (jobId: ${jobId}, jobStatus: ${jobStatus}).`);
      es.close();
    };
  }, [jobId, jobStatus, queryClient]); // queryClient is stable

  if (!jobId || jobId === 'undefined') {
    return { display: <p className="text-center my-4">Please select or start a research job.</p>, job: null, isLoading: false, error: null, refetch };
  }
  
  if (isLoading) return { display: <LinearProgress label="Loading research job details..." />, job, isLoading, error: queryError, refetch }; // Show job object even if loading
  if (queryError) return { display: <p className="text-red-500">Error loading job: {queryError.message}</p>, job, isLoading, error: queryError, refetch };
  if (!job) return { display: <p className="text-center my-4">Research job not found or not yet loaded.</p>, job, isLoading, error: null, refetch };

  // Display logic based on job status
  if (job.status === 'queued_scrape' || job.status === 'scraping') {
    return { display: <LinearProgress label={`Job '${job.id?.substring(0,8)}': Scraping websites...`} />, job, isLoading, error: null, refetch };
  }
  if (job.status === 'reasoning') {
    if (streamError) return { display: <p className="text-red-500">Stream Error: {streamError}</p>, job, isLoading, error: streamError, refetch }; // Show streamError as queryError might be null
    return {
      display: (
        <>
          <LinearProgress label={`Job '${job.id?.substring(0,8)}': Analyzing & generating insights...`} />
          {(streamedCompetitors.length > 0 || streamedAnalysisSummary) && 
            <CompetitorCards data={streamedCompetitors} analysisSummary={streamedAnalysisSummary} />
          }
          {(streamedCompetitors.length === 0 && !streamedAnalysisSummary && !streamError) && 
            <p className="text-center my-4 text-muted-foreground">Waiting for insights...</p>
          }
        </>
      ),
      job, isLoading, error: null, refetch
    };
  }
  if (job.status === 'completed') {
    const displayData = job.result?.competitors && job.result.competitors.length > 0
                        ? job.result.competitors
                        : streamedCompetitors.length > 0 ? streamedCompetitors : [];
    
    const summaryToDisplay = job.result?.analysis_summary || streamedAnalysisSummary;

    if (displayData.length === 0 && !job.result?.error && !summaryToDisplay) {
        return { display: <p className="text-center my-4">Research completed. No direct competitors found or reported.</p>, job, isLoading, error: null, refetch };
    }
    if (job.result?.error) {
        return { 
            display: <> 
                        <p className="text-orange-500">Research completed with issues: {job.result.error}</p>
                        {(displayData.length > 0 || summaryToDisplay) && <CompetitorCards data={displayData} analysisSummary={summaryToDisplay} />}
                     </>,
            job, isLoading, error: job.result.error, refetch 
        };
    }
    return { display: <CompetitorCards data={displayData} analysisSummary={summaryToDisplay} />, job, isLoading, error: null, refetch };
  }
  if (job.status === 'error' || job.status === 'failed') { // Added 'failed' status
    const errorMessage = job.result?.error || (typeof queryError?.message === 'string' ? queryError.message : "Unknown error during processing.");
    return { display: <p className="text-red-500">Research failed: {errorMessage}</p>, job, isLoading, error: queryError || new Error(errorMessage), refetch };
  }

  return { display: <p>Job '{job.id?.substring(0,8)}' status: {job.status || 'Initializing...'}</p>, job, isLoading, error: null, refetch };
} 