// Purpose: Provide the Supabase project URL, primarily for constructing public storage URLs.
// Loaded from Vite environment variables (prefixed with VITE_).

// Ensure VITE_SUPABASE_URL is defined in your .env file (e.g., .env.local)
// Example: VITE_SUPABASE_URL=https://your-project-ref.supabase.co

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  console.warn(
    'VITE_SUPABASE_URL is not defined in environment variables. \n' +
    'Image URLs might not work correctly. Please define it in your .env file.'
  );
} 