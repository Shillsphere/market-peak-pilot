import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from "@/providers/BusinessProvider"; // Use BusinessProvider for currentBusiness

// Type for the mutation function arguments - Updated
interface GeneratePostArgs {
  templateId?: string;
  customPrompt?: string;
}

// Type expected from the backend on successful post creation
interface GeneratePostResponse {
    message: string;
    postId: string; // Expecting postId back
}

// Define the function that performs the API call using fetch - REMOVED (logic moved into mutationFn)
// const generatePostRequest = async (payload: { businessId: string; prompt: string }) => { ... };

// Create the custom hook using useMutation
export function useGeneratePost() {
  const { currentBusiness } = useBusiness(); // Get business context here
  const queryClient = useQueryClient();

  return useMutation<GeneratePostResponse, Error, GeneratePostArgs>({
    mutationFn: async ({ templateId, customPrompt }: GeneratePostArgs): Promise<GeneratePostResponse> => {
      if (!currentBusiness?.id) {
        throw new Error('Business ID is required to generate content.');
      }
      // Basic validation: Ensure at least one identifier is present
      if (!templateId && !customPrompt) {
        throw new Error('Either templateId or customPrompt is required.');
      }

      const payload = {
        businessId: currentBusiness.id,
        // Only include templateId if it has a value
        ...(templateId && { templateId }),
        // Only include customPrompt if it has a value
        ...(customPrompt && { customPrompt }),
      };

      console.log("Sending payload to /api/content/text:", payload);

      const response = await fetch('/api/content/text', { // Keep /api prefix if using proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json(); // Return the response including postId
    },
    onSuccess: (data) => {
      console.log('Post generation initiated successfully:', data);
      // Invalidate the posts query to refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Optionally invalidate templates if credits changed?
      // queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error) => {
      console.error('Error generating post:', error);
      // Error handled globally or via component using the hook
    },
  });
} 