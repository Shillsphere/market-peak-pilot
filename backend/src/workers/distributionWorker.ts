// import 'dotenv/config'; // No longer needed with --env-file flag
import { Worker, Job } from 'bullmq';
import { supabase } from '../lib/supabase.js';
import { distributionQueue } from '../queue.js';

console.log('Distribution Worker starting...');

// Log the REDIS_URL before attempting to use it
console.log('[Distribution Worker] REDIS_URL from env:', process.env.REDIS_URL);

// Define job data type
interface DistributionJobData {
  jobId: string;
  businessId: string;
  contentId: string;
  channel: 'twitter' | 'gmb' | 'sms' | 'email' | 'fb_group';
  text: string;
  imageUrl?: string;
  credentials: any;
  payload: any;
}

// Define job result type
interface JobResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

// Worker that will process distribution jobs
const worker = new Worker<DistributionJobData>(
  'distribution',
  async (job: Job<DistributionJobData>) => {
    const { jobId, channel, businessId, contentId } = job.data;

    console.log(`Processing ${channel} distribution job: ${job.id}, JobID: ${jobId}`);

    try {
      // Update job status to running
      await updateJobStatus(jobId, 'running');
      
      // Process job based on channel
      let result: JobResult;
      
      switch(channel) {
        case 'twitter':
          // Will implement in upcoming days
          result = await mockChannelResult(channel);
          break;
        case 'gmb':
          // Will implement in upcoming days
          result = await mockChannelResult(channel);
          break;
        case 'sms':
          // Will implement in upcoming days
          result = await mockChannelResult(channel);
          break;
        case 'email':
          // Will implement in upcoming days
          result = await mockChannelResult(channel);
          break;
        case 'fb_group':
          // Will implement in upcoming days
          result = await mockChannelResult(channel);
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
      
      // Update job status based on result
      if (result.success) {
        await updateJobStatus(jobId, 'success', result.externalId);
      } else {
        await updateJobStatus(jobId, 'error', undefined, result.error);
      }
      
      return result;
    } catch (error: any) { // Use any to handle unknown error type
      console.error(`Job ${job.id} failed for ${channel} distribution:`, error);
      
      // Update job status to error
      await updateJobStatus(jobId, 'error', undefined, error.message);
      
      // Throw the error so BullMQ marks the job as failed
      throw error;
    }
  },
  {
    connection: { url: process.env.REDIS_URL! },
    // Increase concurrency for parallel processing
    concurrency: 5
  }
);

// Helper function to update job status in database
async function updateJobStatus(
  jobId: string, 
  status: 'running' | 'success' | 'error',
  externalId?: string,
  errorMessage?: string
) {
  const updates: any = { status };
  
  if (externalId) updates.external_id = externalId;
  if (errorMessage) updates.error_message = errorMessage;
  
  const { error } = await supabase
    .from('distribution_jobs')
    .update(updates)
    .eq('id', jobId);
    
  if (error) {
    console.error(`Failed to update job status for ${jobId}:`, error);
  }
}

// Mock function for channels not yet implemented
async function mockChannelResult(channel: string): Promise<JobResult> {
  return {
    success: true,
    externalId: `mock-${channel}-${Date.now()}`
  };
}

// Event listeners
worker.on('completed', (job: Job<DistributionJobData>) => {
  console.log(`Job ${job.id} (${job.data.channel} for ${job.data.jobId}) completed successfully.`);
});

worker.on('failed', (job: Job<DistributionJobData> | undefined, err: Error) => {
  console.error(`Job ${job?.id} (${job?.data.channel} for ${job?.data.jobId}) failed with error: ${err.message}`);
});

worker.on('error', (err: Error) => {
  console.error('Distribution worker encountered an error:', err);
});

console.log('Distribution worker started and waiting for jobs on queue \'distribution\'...');

// Graceful shutdown
const shutdown = async () => {
  console.log('Closing distribution worker...');
  await worker.close();
  console.log('Distribution worker closed.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); 