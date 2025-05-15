// test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file from the root

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`[Standalone Test] Loaded SUPABASE_URL: ${supabaseUrl ? supabaseUrl.substring(0,20) + "..." : "NOT LOADED"}`);
console.log(`[Standalone Test] SUPABASE_SERVICE_ROLE_KEY is ${supabaseKey ? "LOADED" : "NOT LOADED"}`);
if (supabaseKey) {
    console.log(`[Standalone Test] Key starts with: ${supabaseKey.substring(0,10)}...`);
}


if (!supabaseUrl || !supabaseKey) {
  console.error('[Standalone Test] Supabase URL or Key is missing from .env! Ensure .env is in the same directory as this script or properly configured.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('[Standalone Test] Attempting to connect and fetch data from "businesses" table...');
  try {
    const { data, error, status } = await supabase
      .from('businesses') // Make sure this table exists and is accessible
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Standalone Test] Error during fetch:', error.message);
      console.error(`[Standalone Test] Status: ${status}`);
      if (error.cause) console.error('[Standalone Test] Underlying cause:', error.cause);
      else if (error.stack) console.error('[Standalone Test] Error stack for more context:', error.stack);
    } else {
      console.log('[Standalone Test] Successfully fetched data (or empty array if table empty):', data);
    }
  } catch (e) {
    console.error('[Standalone Test] CRITICAL Exception caught:', e.message);
    if (e.cause) { 
        console.error('[Standalone Test] Exception cause:', e.cause);
    } else {
        console.error('[Standalone Test] Exception stack:', e.stack);
    }
  }
}

main();