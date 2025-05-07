import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { RunPanel } from "@/components/research/RunPanel";
import { StatusBadge } from "@/components/research/StatusBadge";
import { TimelineStepper } from "@/components/research/TimelineStepper";
import { SummaryViewer } from "@/components/research/SummaryViewer";
import { CompetitorTable } from "@/components/research/CompetitorTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

// Define types for the API response
interface ResearchJob {
  id: string;
  prompt: string;
  status: 'queued' | 'running' | 'done' | 'error';
  started_at: string | null;
  finished_at: string | null;
  cost_usd: number | null;
  created_at: string;
  // Add other job fields as needed
}

interface ResearchResult {
  id: number;
  job_id: string;
  step: string; // Adjust based on research_step enum if needed elsewhere
  payload: any;
  note: string | null;
  created_at: string;
}

interface ResearchData {
  job: ResearchJob;
  results: ResearchResult[];
}

// API fetch function
const fetchResearchData = async (jobId: string): Promise<ResearchData> => {
  const { data } = await axios.get<ResearchData>(`/api/research/${jobId}`);
  return data;
};

export const ResearchPage = () => {
  const { jobId: routeJobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<string | undefined>(routeJobId);

  // Effect to update jobId if route changes (e.g., after creation)
  useEffect(() => {
    setCurrentJobId(routeJobId);
  }, [routeJobId]);

  const handleJobStart = (newJobId: string) => {
    navigate(`/dashboard/research/${newJobId}`); // Navigate to the specific job page
  };

  // Fetch data using TanStack Query
  const { data, isLoading, error, isRefetching } = useQuery<ResearchData, Error>({
    queryKey: ['research', currentJobId],
    queryFn: () => {
        if (!currentJobId) {
            // This should ideally not happen if navigated correctly, but handle defensively
            return Promise.reject(new Error('No job ID specified.'));
        }
        return fetchResearchData(currentJobId);
    },
    enabled: !!currentJobId, // Only run query if jobId exists
    refetchInterval: (query) => {
        // Stop refetching if the job is done or errored
        const jobStatus = query.state.data?.job?.status;
        return (jobStatus === 'queued' || jobStatus === 'running') ? 3000 : false; // Refetch every 3s if active
    },
    refetchIntervalInBackground: false,
    retry: 1, // Retry once on error
    staleTime: 1000 * 5, // Consider data stale after 5 seconds
  });

  // Helper function to extract competitors
  const getCompetitorData = (): any[] | null => {
      const compResult = data?.results.find(r => r.step === 'competitor_meta');
      // Assuming the payload is { competitors: [...] } based on worker
      return compResult?.payload?.competitors || null;
  }

  const getSummaryMarkdown = (): string | null => {
    const summaryResult = data?.results.find(r => r.step === 'synthesis_md');
    return summaryResult?.payload?.markdown || null;
  }

  const getLastErrorNote = (): string | null => {
      if (data?.job?.status !== 'error') return null;
      const errorResult = data?.results.find(r => r.step === 'error');
      return errorResult?.note || 'An unknown error occurred during processing.';
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Market Research Agent</h1>
        
        {/* Panel to start a new research job */} 
        <RunPanel onJobStart={handleJobStart} currentJobId={currentJobId} />

        {/* Display area for the current/selected job */} 
        {currentJobId && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Research Details (Job: {currentJobId.substring(0, 8)}...)</h2>
            
            {/* Loading State */} 
            {(isLoading || (isRefetching && !data)) && <LoadingState message="Loading research data..." />}
            
            {/* Error State */} 
            {error && !isLoading && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Research Job</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {/* Data Display */} 
            {data && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 p-4 border rounded-md bg-card">
                  <span className="font-medium">Status:</span>
                  <StatusBadge status={data.job.status} />
                  {data.job.status === 'error' && getLastErrorNote() && (
                      <span className="text-xs text-destructive">({getLastErrorNote()})</span>
                  )}
                  <span className="text-sm text-muted-foreground ml-auto">Created: {new Date(data.job.created_at).toLocaleString()}</span>
                  {data.job.finished_at && (
                      <span className="text-sm text-muted-foreground">Finished: {new Date(data.job.finished_at).toLocaleString()}</span>
                  )}
                </div>
                <div className="p-4 border rounded-md bg-card">
                  <p className="text-sm font-medium mb-1">Prompt:</p>
                  <p className="text-muted-foreground italic">{data.job.prompt}</p>
                </div>

                {/* Results Sections */} 
                <TimelineStepper jobId={currentJobId} /> 
                <CompetitorTable competitors={getCompetitorData()} /> 
                <SummaryViewer markdown={getSummaryMarkdown()} /> 
                
                {/* Display cost if job is done */} 
                {data.job.status === 'done' && data.job.cost_usd && (
                  <p className="text-sm text-muted-foreground text-right">Estimated Cost: ${data.job.cost_usd.toFixed(4)}</p>
                )}
              </div>
            )}
          </div>
        )}

        {!currentJobId && !isLoading && (
            <p className="text-center text-muted-foreground">Enter a prompt above to start a new research job.</p>
        )}
      </div>
    </DashboardLayout>
  );
};
