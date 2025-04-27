import { useQuery } from '@tanstack/react-query';

// Define the expected shape of a Post
// Adjust according to your actual data structure from the API
export interface Post {
  id: string;
  caption: string | null; // Caption can be null initially
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

const POLLING_INTERVAL = 5000; // Use constant for interval

// Create the custom hook
export function usePosts(businessId: string | undefined) {
  return useQuery<Post[], Error>({ 
    queryKey: ['posts', businessId],
    queryFn: () => {
      if (!businessId) {
        // Or return Promise.resolve([]) if you prefer empty array over throwing
        return Promise.reject(new Error('businessId is required'));
      }
      return fetchPosts(businessId);
    },
    // Fetch only if businessId is present
    enabled: !!businessId,
    // Refetch based on post statuses
    refetchInterval: (query) => {
      // query.state.data contains the current data
      const posts = query.state.data;
      // Check if any post is still in a 'generating' or 'pending' state
      const isAnyPostProcessing = posts?.some(post => 
        post.status === 'generating' || post.status === 'pending'
      );

      // If any post is processing, continue polling
      if (isAnyPostProcessing) {
        console.log("Polling posts..."); // Optional: log polling activity
        return POLLING_INTERVAL;
      }

      // Otherwise, stop polling
      console.log("All posts settled, stopping polling."); // Optional: log stop
      return false; // Returning false stops the interval
    },
    // Only refetch when the window is focused, to avoid background polling when idle
    refetchIntervalInBackground: false, 
    // Optional: Configure stale time, cache time, etc.
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });
} 