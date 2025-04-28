// The dotenv import is now in the entry files
import { createClient } from "@supabase/supabase-js";

// Reverted: Removed manual checks, rely on preloading.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

// Keep logs for verification
console.log(`[Supabase Lib] Trying to init client. URL loaded: ${!!supabaseUrl}, Service Role loaded: ${!!supabaseServiceRole}`); 
console.log(`[Supabase Lib] URL: ${supabaseUrl?.substring(0, 20)}...`); // Log part of URL if present

// Client creation will now throw if vars are undefined AFTER preloading fails
export const supabase = createClient(supabaseUrl!, supabaseServiceRole!); 