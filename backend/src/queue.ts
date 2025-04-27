import { Queue } from "bullmq";

// TODO: It looks like process.env.REDIS_URL might be incorrect.
// Perhaps you meant REDIS_URL?
export default new Queue("image", { connection: { url: process.env.REDIS_URL } }); 