import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness } from "@/providers/BusinessProvider"; // Use BusinessProvider for currentBusiness

// Type for the mutation function arguments
interface GeneratePostArgs {
  prompt: string;
}

// Type expected from the backend on successful post creation
interface GeneratePostResponse {
    message: string;
    postId: string; // Expecting postId back
}

// Define the function that performs the API call using fetch
const generatePostRequest = async (payload: { businessId: string; prompt: string }) => {
  // Use the relative path, assuming the Vite proxy handles it
  const response = await fetch('/api/content/text', { // Keep /api prefix if using proxy
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // Attempt to parse error response from backend
    const errorData = await response.json().catch(() => ({})); // Default to empty object on JSON parse error
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json(); // Returns { postId: string }
};

// Create the custom hook using useMutation
export function useGeneratePost() {
  const { currentBusiness } = useBusiness(); // Get business context here
  const queryClient = useQueryClient();

  return useMutation<GeneratePostResponse, Error, GeneratePostArgs>({
    mutationFn: async ({ prompt }: GeneratePostArgs): Promise<GeneratePostResponse> => {
      if (!currentBusiness?.id) {
        throw new Error('Business ID is required to generate content.');
      }

      const response = await fetch('/api/content/text', { // Keep /api prefix if using proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            businessId: currentBusiness.id,
            prompt // Include the prompt in the request body
        }),
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
    },
    onError: (error) => {
      console.error('Error generating post:', error);
      // Error handled globally or via component using the hook
    },
  });
} 