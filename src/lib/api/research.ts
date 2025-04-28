import { supabase } from "../supabase";          // Corrected export name

// Determine API base URL (adjust if your backend is hosted elsewhere)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

/**
 * Starts a new research job.
 * @param prompt The research prompt.
 * @param businessId The ID of the associated business.
 * @returns Promise resolving to the initial job status ({ jobId: string; status: string }).
 */
export async function runResearch(prompt: string, businessId: string): Promise<{ jobId: string; status: string }> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, businessId })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Error running research:", errorBody);
    throw new Error(res.statusText || "Failed to start research job");
  }
  return res.json();
}

/**
 * Fetches the status and results of a specific research job.
 * @param jobId The ID of the job to fetch.
 * @returns Promise resolving to the job object (including status and docs array).
 */
export async function getResearch(jobId: string): Promise<any> { // Add a proper type later
 const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/research/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
     if (res.status === 404) {
        // Handle not found specifically if needed, or let caller handle
        console.warn(`Research job ${jobId} not found.`);
     }
     const errorBody = await res.text();
     console.error(`Error fetching research job ${jobId}:`, errorBody);
    throw new Error(res.statusText || `Failed to fetch research job ${jobId}`);
  }
  return res.json();
} 