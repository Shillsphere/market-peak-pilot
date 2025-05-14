import https from 'https';
import { URL } from 'url'; // URL constructor is part of 'url' module in ESM

// Manually load .env variables for this standalone script if needed
// For simplicity in this test, we assume SUPABASE_URL is directly set or handled by --env-file
// If --env-file is not consistently picking up, you might need:
// import dotenv from 'dotenv';
// dotenv.config(); // This would require `npm install dotenv` if not already a direct dependency

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error("ERROR: SUPABASE_URL environment variable is not set or not accessible via --env-file for this script.");
  process.exit(1);
}

let url;
try {
  url = new URL(supabaseUrl);
} catch (e) {
  console.error(`ERROR: Invalid SUPABASE_URL: ${supabaseUrl}`, e);
  process.exit(1);
}

const options = {
  hostname: url.hostname,
  port: 443,
  path: '/', // Just hit the base path
  method: 'HEAD' // Similar to curl -I
};

console.log(`Attempting direct HTTPS HEAD request to: ${url.hostname}...`);

const req = https.request(options, (res) => {
  console.log(`Direct Test Status Code: ${res.statusCode}`);
  console.log("Direct Test Headers:", res.headers);

  res.on('data', (d) => {
    // We don't expect body for HEAD, but just in case
    // process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error("Direct Test Error:", error);
  if (error.cause) {
    console.error("Direct Test Error Cause:", error.cause);
  }
});

req.end(); 