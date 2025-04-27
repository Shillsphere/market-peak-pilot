import { createClient } from "@supabase/supabase-js";

// Debugging: Log environment variables before creating the client
console.log('[Supabase Lib] SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('[Supabase Lib] SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE);

// TODO: It looks like process.env.SUPABASE_SERVICE_ROLE! might be incorrect.
// Perhaps you meant SUPABASE_SERVICE_ROLE_KEY?
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!); 