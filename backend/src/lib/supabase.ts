// The dotenv import is now in the entry files
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("---- Supabase Client Initialization Details ----");
console.log(`[Supabase Lib] Raw SUPABASE_URL: ${process.env.SUPABASE_URL}`);
console.log(`[Supabase Lib] Raw SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4) : 'NOT SET'}`);
console.log(`[Supabase Lib] Parsed supabaseUrl type: ${typeof supabaseUrl}, value: ${supabaseUrl}`);
console.log(`[Supabase Lib] Parsed supabaseServiceRoleKey type: ${typeof supabaseServiceRoleKey}, value (first 10/last 4 chars): ${supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 10) + '...' + supabaseServiceRoleKey.slice(-4) : 'NOT SET'}`);
console.log("----------------------------------------------");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("[Supabase Lib] CRITICAL: Supabase URL or Service Role Key is missing after attempting to load from environment variables.");
  // Optionally throw an error here to prevent client creation with undefined values,
  // though the non-null assertion operator (!) below will also cause a runtime error if they are null/undefined.
  throw new Error("Supabase URL or Service Role Key not found in environment."); 
}

export const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!); 