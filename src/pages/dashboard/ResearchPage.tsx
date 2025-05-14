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
import useResearchJob from '@/hooks/useResearchJob.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBusiness } from '@/providers/BusinessProvider';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
  const { jobId: jobIdFromParams } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();

  const [inputUrls, setInputUrls] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(jobIdFromParams || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { display: researchJobDisplay, job: currentJobDetails, isLoading: jobIsLoading, refetch: refetchJob } = useResearchJob(currentJobId);

  const handleStartResearch = async () => {
    if (!currentBusiness?.id) {
      toast({ title: "Error", description: "No active business selected.", variant: "destructive" });
      return;
    }
    const urls = inputUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    if (urls.length === 0) {
      toast({ title: "Error", description: "Please enter at least one URL.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          urls,
          researchTopic,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      toast({ title: "Success", description: "Research job started!" });
      setCurrentJobId(data.researchJobId);
      navigate(`/dashboard/research/${data.researchJobId}`, { replace: true });
    } catch (error) {
      console.error("Failed to start research job:", error);
      toast({ title: "Error", description: `Failed to start research: ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (jobIdFromParams && jobIdFromParams !== 'undefined') {
      setCurrentJobId(jobIdFromParams);
    } else {
      setCurrentJobId(null);
    }
  }, [jobIdFromParams]);

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
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Market & Competitor Research</h1>
        
        {!currentJobId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start New Research</CardTitle>
              <CardDescription>Enter competitor URLs (one per line) to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="research-urls">Competitor URLs (one per line)</Label>
                <Textarea
                  id="research-urls"
                  placeholder="https://competitor1.com\nhttps://competitor2.com"
                  value={inputUrls}
                  onChange={(e) => setInputUrls(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="research-topic">Research Focus (Optional)</Label>
                <Input
                  id="research-topic"
                  placeholder="e.g., their pricing strategy, main product features"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleStartResearch} disabled={isSubmitting || !inputUrls.trim()}>
                {isSubmitting ? 'Starting Research...' : 'Start Research'}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentJobId && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Research Job: {currentJobId.substring(0,8)}...</h2>
              <Button onClick={() => { setCurrentJobId(null); navigate('/dashboard/research'); }} variant="outline" size="sm">
                Start New Research
              </Button>
            </div>
            {currentJobDetails?.prompt_text && <p className="mb-2 text-sm text-muted-foreground">Focus: {currentJobDetails.prompt_text}</p>}
            {researchJobDisplay}
            {currentJobDetails && (currentJobDetails.status === 'completed' || currentJobDetails.status === 'error') && (
              <Button onClick={() => refetchJob()} className="mt-4" variant="ghost" disabled={jobIsLoading}>
                {jobIsLoading ? "Refreshing..." : "Refresh Job"}
              </Button>
            )}
          </div>
        )}
        
      </div>
    </DashboardLayout>
  );
};
