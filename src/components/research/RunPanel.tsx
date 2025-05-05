
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/providers/BusinessProvider';
import { useRunResearch } from '@/hooks/useRunResearch';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast exists
import { Loader2 } from 'lucide-react'; // For loading spinner

interface RunPanelProps {
  onJobStart: (jobId: string) => void; // Callback to pass the new job ID up
  currentJobId?: string | null; // Optional: pass current job ID to potentially disable while running
  initialPrompt?: string; // Optional initial prompt value
}

export const RunPanel: React.FC<RunPanelProps> = ({ onJobStart, currentJobId, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const { mutate: runResearchMutation, isPending, error, reset } = useRunResearch();

  // Reset error state when component unmounts or dependencies change
  useEffect(() => {
      return () => reset();
  }, [reset]);

  const handleRunResearch = async () => {
    if (!currentBusiness) {
      toast({
        title: "No Business Selected",
        description: "Please select a business before running research.",
        variant: "destructive",
      });
      return;
    }
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a research prompt.",
        variant: "destructive",
      });
      return;
    }

    runResearchMutation(prompt.trim(), {
      onSuccess: (data) => {
        onJobStart(data.jobId); // Pass the job ID up
        setPrompt(''); // Clear prompt on success
      },
      // onError is handled by the hook itself using toast
    });
  };

  const isButtonDisabled = !currentBusiness || isPending || !!currentJobId; // Disable if no business, pending, or a job is already active

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h3 className="text-lg font-semibold mb-3">Start New Research</h3>
      <Textarea
        placeholder="Enter your research prompt (e.g., 'latest trends in AI marketing', 'competitors for a SaaS billing platform')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="mb-3 min-h-[100px]"
        disabled={isPending || !!currentJobId} // Disable textarea while running
      />
      {error && (
          <p className="text-sm text-red-500 mb-3">Error: {error.message}</p>
      )}
      <Button
        onClick={handleRunResearch}
        disabled={isButtonDisabled}
        className="w-full"
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Research...</>
        ) : (
          'Run Research'
        )}
      </Button>
      {!currentBusiness && (
        <p className="text-xs text-muted-foreground mt-2">Select a business from the sidebar to enable research.</p>
      )}
       {!!currentJobId && !isPending && (
          <p className="text-xs text-muted-foreground mt-2">A research job is currently running. Please wait for it to complete.</p>
      )}
    </div>
  );
};
