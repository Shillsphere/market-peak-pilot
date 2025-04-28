import { Queue } from 'bullmq';

// TODO: Ensure REDIS_URL is set in your .env file
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('REDIS_URL environment variable is not set!');
  // Consider throwing an error or providing a default for local dev if appropriate
}

const redisOpts = { connection: { url: redisUrl } };

export const imageQueue = new Queue('generate', redisOpts);
export const researchQueue = new Queue('research', redisOpts); 