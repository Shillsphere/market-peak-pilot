import { useQuery } from '@tanstack/react-query';

// Assuming the backend endpoint is mounted at /api
// Adjust the path if your backend proxy/setup is different
const API_BASE_URL = '/api'; 

export interface Template {
  id: string;
  name: string;
  // prompt_stub is not needed on the frontend according to checklist
}

/**
 * Fetches the list of available templates.
 */
async function getTemplates(): Promise<Template[]> {
  const url = `${API_BASE_URL}/content/templates`;
  console.log(`[useTemplates] Fetching from: ${url}`);
  try {
    const response = await fetch(url);
    console.log(`[useTemplates] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text(); // Get error text from response
      console.error(`[useTemplates] Network response not ok. Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`Network response was not ok fetching templates (Status: ${response.status})`);
    }

    const data = await response.json();
    console.log('[useTemplates] Received data:', data);
    return data;
  } catch (error) {
      console.error('[useTemplates] Fetch error:', error);
      throw error; // Re-throw the error for React Query to handle
  }
}

export function useTemplates() {
  return useQuery<Template[], Error>({ // Explicitly type query hook
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
} 