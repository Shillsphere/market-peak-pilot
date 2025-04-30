import { Queue } from "bullmq";

// Log the REDIS_URL before attempting to use it
console.log('[Queue] REDIS_URL from env:', process.env.REDIS_URL);

// Image generation queue
export const generateQueue = new Queue("generate", { 
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 }
  }
});

// Distribution queue for content publishing to various channels
export const distributionQueue = new Queue("distribution", { 
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 }
  }
});

// For backward compatibility with existing code
export default generateQueue; 