import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Search, Link as LinkIcon, FileText, BrainCircuit, Clock } from 'lucide-react';
import { useResearchJob, ResearchJob } from '@/hooks/useResearchJob'; // Import hook and type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Keep alert for errors

interface TimelineStepperProps {
  jobId?: string | null;
}

// Configuration for each step (icon and label)
const stepConfig: { [key: string]: { icon: React.ElementType, label: string } } = {
  job_started: { icon: Clock, label: 'Job Started' },
  raw_serp: { icon: Search, label: 'Web Search' },
  link_excerpt: { icon: LinkIcon, label: 'Scraping & Embedding' },
  competitor_meta: { icon: BrainCircuit, label: 'Competitor Analysis (TODO)' }, // TODO
  synthesis_md: { icon: FileText, label: 'Synthesis (TODO)' }, // TODO
  job_finished: { icon: CheckCircle2, label: 'Finished' },
  error: { icon: AlertCircle, label: 'Error Occurred' },
};

// Define the expected order of steps based on worker logic
const stepOrder = ['job_started', 'raw_serp', 'link_excerpt', 'competitor_meta', 'synthesis_md', 'job_finished'];

// Simple component to represent the timeline using icons and labels
export const TimelineStepper: React.FC<TimelineStepperProps> = ({ jobId }) => {
  const { data: job, isLoading, error, isFetching } = useResearchJob(jobId);

  const renderStep = (stepKey: string, index: number) => {
    const config = stepConfig[stepKey];
    if (!config) return null; // Should not happen if stepOrder is correct

    const results = job?.results || [];
    const completedSteps = new Set(results.map(r => r.step));
    const isCompleted = completedSteps.has(stepKey) || (job?.status === 'done' && stepKey === 'job_finished');
    const currentActiveStepIndex = stepOrder.findIndex(step => !completedSteps.has(step) && step !== 'job_finished');
    const isActive = job?.status === 'running' && index === currentActiveStepIndex;
    const isError = job?.status === 'error' && index === currentActiveStepIndex; // Show error on the step that was likely running

    let Icon = config.icon;
    let iconColor = 'text-muted-foreground'; // Default gray
    let statusText = 'Pending';
    let noteText = results.find(r => r.step === stepKey)?.note || '';

    if (isCompleted) {
      Icon = CheckCircle2;
      iconColor = 'text-green-500';
      statusText = 'Completed';
    }
    if (isActive) {
      Icon = Loader2;
      iconColor = 'text-blue-500 animate-spin';
      statusText = 'Running';
    }
    if (isError) {
      Icon = AlertCircle;
      iconColor = 'text-red-500';
      statusText = 'Error';
      noteText = job?.error || 'An error occurred.';
    }

    // Special case for the final error step display
    const errorResult = results?.find(r => r.step === 'error');
    if (stepKey === 'error' && errorResult) {
        Icon = AlertCircle;
        iconColor = 'text-red-500';
        statusText = 'Error';
        noteText = errorResult.note || job?.error || 'Error details unavailable';
    }

    return (
      <div key={stepKey} className={`flex items-start gap-3 p-2 ${isActive ? 'bg-muted/50 rounded' : ''}`}>
        <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <span className={`text-sm font-medium ${isCompleted ? '' : isActive ? 'text-blue-600' : isError ? 'text-red-600' : 'text-muted-foreground'}`}>
            {config.label}
          </span>
          {noteText && <p className={`text-xs ${isError ? 'text-red-500' : 'text-muted-foreground'}`}>{noteText}</p>}
        </div>
        {/* <span className={`text-xs font-mono ml-auto ${iconColor}`}>{statusText}</span> */}
      </div>
    );
  };

  if (isLoading && !job) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg shadow-sm bg-card min-h-[150px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Research Job</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!job && !isLoading) {
     return (
      <div className="flex items-center justify-center p-6 border rounded-lg shadow-sm bg-card min-h-[150px]">
        <span className="text-muted-foreground text-sm">No research job selected.</span>
      </div>
    );
  }

  // Determine which steps to display
  const displaySteps = job?.status === 'error' ? [...stepOrder.slice(0, stepOrder.findIndex(s => s === 'error') + 1), 'error'] : stepOrder;
  // Remove duplicates if error occurred early
  const uniqueDisplaySteps = [...new Set(displaySteps)]; 

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex items-center mb-3">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />}
           {!isFetching && job?.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
           {!isFetching && job?.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />}
           {!isFetching && job?.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
           {!isFetching && job?.status === 'queued' && <Clock className="h-4 w-4 text-muted-foreground mr-2" />}
        <h3 className="text-base font-semibold">Research Progress</h3>
        {job && <span className="ml-auto text-xs text-muted-foreground">ID: {job.id.substring(0, 8)}</span>}
      </div>
      <div className="space-y-1">
        {uniqueDisplaySteps.map((stepKey, index) => renderStep(stepKey, index))}
        {/* Explicit error display if job status is error but no error step was logged */} 
         {job?.status === 'error' && !job.results?.some(r => r.step === 'error') && (
              <div className="flex items-start gap-3 p-2 text-red-600">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                   <div className="flex-1">
                      <span className="text-sm font-medium">Processing Error</span>
                       {job.error && <p className="text-xs text-red-500">{job.error}</p>}
                   </div>
              </div>
          )}
      </div>
    </div>
  );
}; 