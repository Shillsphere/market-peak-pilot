import { Queue } from "bullmq";

// Log the REDIS_URL before attempting to use it
console.log('[Queue] REDIS_URL from env:', process.env.REDIS_URL);

// TODO: It looks like process.env.REDIS_URL might be incorrect.
// Perhaps you meant REDIS_URL?
export default new Queue("generate", { connection: { url: process.env.REDIS_URL } }); 