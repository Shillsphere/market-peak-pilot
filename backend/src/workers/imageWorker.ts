import "dotenv/config";
// import 'dotenv/config'; // No longer needed with --env-file flag
import { Worker, Job } from 'bullmq';
import fetch from 'node-fetch';
import { supabase } from '../lib/supabase.js'; // Added .js back
import { openai } from '../lib/openai.js';   // Added .js back

console.log('Worker starting...');

// Log the REDIS_URL before attempting to use it for the worker connection
console.log('[Worker] REDIS_URL from env:', process.env.REDIS_URL);

type JobData = { postId: string; businessId: string; prompt: string };

// TODO: It looks like process.env.REDIS_URL! might be incorrect.
// Perhaps you meant REDIS_URL?
const worker = new Worker<JobData>(
  'generate',
  async (job: Job<JobData>) => {
    const { postId, businessId, prompt } = job.data;

    console.log(`Processing job: ${job.id}, PostID: ${postId}`);

    try {
      // ── 1. credit check ────────────────────────────────────────────────
      console.log(`Checking credits for business ${businessId}...`);
      // NOTE: Ensure 'check_and_decrement_credits' function exists in Supabase
      const { data: checkData, error: checkError } = await supabase.rpc('check_and_decrement_credits', {
        bid: businessId
      });

      if (checkError) {
        throw new Error(`Credit check failed: ${checkError.message}`);
      }
      if (!checkData) {
        throw new Error('No image credits left or credit check failed.');
      }
      console.log(`Credits check passed for business ${businessId}.`);

      // ── 2. call OpenAI Image API ────────────────────────────────────────────
      console.log(`Generating image for prompt: "${prompt}"...`);
      const gen = await openai.images.generate({
        // Ensure the model name is correct for your OpenAI access
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        n: 1,
        response_format: 'url' // Signed URL valid for a short time
      });

      // Add check for gen.data existence
      if (!gen.data || gen.data.length === 0) {
          throw new Error('OpenAI image generation failed to return data.');
      }

      const signedUrl = gen.data[0]?.url;
      if (!signedUrl) {
        throw new Error('OpenAI image generation failed to return a URL.');
      }
      console.log(`Image generated, URL: ${signedUrl.substring(0, 50)}...`);

      // ── 3. download and upload to Supabase Storage ─────────────────────
      console.log('Downloading image...');
      const imageResponse = await fetch(signedUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      console.log('Image downloaded, uploading to Supabase Storage...');

      const filePath = `public/${businessId}/${postId}.png`; // Adjusted path to be within 'public' bucket
      // NOTE: Ensure 'public-images' bucket exists and RLS allows uploads/updates
      const { error: uploadError } = await supabase.storage
        .from('public-images') // Use the bucket name here
        .upload(filePath, buffer, {
          upsert: true,
          contentType: 'image/png'
          // Removed metadata, Supabase adds defaults. Add if needed.
        });

      if (uploadError) {
        throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
      }
      console.log(`Image uploaded to ${filePath}`);

      // ── 4. Update DB rows ─────────────────────────────────────────────────────
      console.log(`Updating database records for post ${postId}...`);
      // Insert into generated_images table
      // NOTE: Ensure 'generated_images' table exists and schema matches
      const { data: imgRow, error: imgInsertError } = await supabase
        .from('generated_images')
        .insert({
          business_id: businessId,
          prompt,
          // format: 'instagram', // Ensure this column exists if uncommented
          size: '1024x1024',
          url: filePath, // Store the relative path
          status: 'ready'
        })
        .select('id') // Select only the ID
        .single();

      if (imgInsertError) {
        throw new Error(`Failed to insert into generated_images: ${imgInsertError.message}`);
      }
      if (!imgRow || !imgRow.id) {
          throw new Error('Failed to get ID from generated_images insert.');
      }
      console.log(`Generated image record created with ID: ${imgRow.id}`);

      // Update posts table
      // NOTE: Ensure 'image_id' column and 'status' column exist in 'posts' table
      const { error: postUpdateError } = await supabase
        .from('posts')
        .update({ image_id: imgRow.id, status: 'ready' })
        .eq('id', postId);

      if (postUpdateError) {
        throw new Error(`Failed to update post ${postId}: ${postUpdateError.message}`);
      }

      console.log(`✅ Image ready and DB updated for post ${postId}`);

    } catch (error) {
      console.error(`Job ${job.id} failed for post ${postId}:`, error);
      // Throw the error so BullMQ marks the job as failed
      throw error;
    }
  },
  {
    connection: { url: process.env.REDIS_URL! },
    // Optional: Increase concurrency if needed
    // concurrency: 5
  }
);

worker.on('completed', (job: Job<JobData>) => {
  console.log(`Job ${job.id} (Post ${job.data.postId}) completed successfully.`);
});

worker.on('failed', (job: Job<JobData> | undefined, err: Error) => {
  console.error(`Job ${job?.id} (Post ${job?.data?.postId}) failed with error: ${err.message}`);
});

worker.on('error', (err: Error) => {
  console.error('Worker encountered an error:', err);
});

console.log('Worker started and waiting for jobs on queue \'generate\'...');

// Graceful shutdown
const shutdown = async () => {
  console.log('Closing worker...');
  await worker.close();
  console.log('Worker closed.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); 