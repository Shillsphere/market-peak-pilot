import { useMutation } from "@tanstack/react-query";
import { runResearch } from "../lib/api/research";
import { useBusiness } from "../providers/BusinessProvider";
import { useToast } from "./use-toast"; // Assuming useToast hook exists

export const useRunResearch = () => {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();

  return useMutation<{
     jobId: string; status: string 
    }, // Success type
    Error, // Error type
    string // Variables type (prompt)
  >({ 
    mutationFn: (prompt: string) => {
      if (!currentBusiness?.id) {
          // This should ideally be caught before calling mutate,
          // but double-check here.
          return Promise.reject(new Error("No business selected."));
      }
      return runResearch(prompt, currentBusiness.id);
    },
    onSuccess: (data) => {
      toast({ 
        title: "Research Started", 
        description: `Job ${data.jobId} has been queued.` 
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Research",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    },
  });
}; 