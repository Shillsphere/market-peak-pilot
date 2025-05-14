import { Queue } from 'bullmq';
import { redisClient } from './redisClient.js'; // Use the shared client connection options

// TODO: Ensure REDIS_URL is set in your .env file
// const redisUrl = process.env.REDIS_URL; // Commented out, using redisClient directly
// if (!redisUrl) { // Commented out
//   console.error('REDIS_URL environment variable is not set!'); // Commented out
  // Consider throwing an error or providing a default for local dev if appropriate
// } // Commented out

// const redisOpts = { connection: { url: redisUrl } }; // Commented out, new connectionOptions below

const connectionOptions = {
    connection: redisClient, // BullMQ can take an ioredis client instance or connection options
};

// Your existing queues (generateQueue, distributionQueue)
export const generateQueue = new Queue("generate", connectionOptions); // Was imageQueue
// export const researchQueue = new Queue('research', redisOpts); // Removed existing researchQueue

// Per researchplan.txt, a distributionQueue might be expected. Adding it defensively.
// If you don't have a distribution worker/logic, you can remove this.
export const distributionQueue = new Queue("distribution", connectionOptions);

// New queues for research
export const scrapeQ = new Queue("scrape", connectionOptions);
export const reasoningQ = new Queue("reasoning", connectionOptions);

console.log('[Queue] Initialized: generate, distribution, scrape, reasoning'); 