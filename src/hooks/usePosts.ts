import { useQuery } from '@tanstack/react-query';

// Define the expected shape of a Post
// Adjust according to your actual data structure from the API
export interface Post {
  id: string;
  caption: string;
  status: 'pending' | 'generating' | 'ready' | 'failed'; // Example statuses
  created_at: string;
  generated_images?: { // FK relationship - Supabase returns as object or null
    url: string | null;
  } | null;
}

// Define the fetch function
const fetchPosts = async (businessId: string): Promise<Post[]> => {
  const response = await fetch(`/api/content/posts?businessId=${businessId}`); // Use proxy path
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data as Post[]; // Cast to Post[]
};

// Create the custom hook
export function usePosts(businessId: string | undefined) {
  return useQuery<Post[], Error>({ // Explicitly type query data and error
    queryKey: ['posts', businessId], // Query key includes businessId
    queryFn: () => {
      if (!businessId) {
        // Or return Promise.resolve([]) if you prefer empty array over throwing
        return Promise.reject(new Error('businessId is required'));
      }
      return fetchPosts(businessId);
    },
    // Fetch only if businessId is present
    enabled: !!businessId,
    // Refetch every 4 seconds
    refetchInterval: 4000,
    // Optional: Configure stale time, cache time, etc.
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });
} 