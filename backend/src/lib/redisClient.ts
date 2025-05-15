import { Redis as IORedisClient } from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables.");
}

// ioredis will attempt to connect automatically when commands are issued.
// It also handles reconnection logic internally by default.
export const redisClient = new IORedisClient(process.env.REDIS_URL, {
  // Optional: ioredis has robust default settings, but you can configure them here
  // For example, to enable lazyConnect:
  // lazyConnect: true, 
  maxRetriesPerRequest: null, // Explicitly set to null for BullMQ compatibility
  enableReadyCheck: true, // Added based on user suggestion example
});

redisClient.on('connect', () => {
  console.log('[RedisClient Global] Connected to Redis successfully.');
});
redisClient.on('ready', () => console.log('[RedisClient Global] Redis client is ready.'));
redisClient.on('error', (err: Error) => {
  console.error('[RedisClient Global] Error', err);
  // Depending on the error, you might want to exit the process
  // if it's a critical connection failure during startup.
});

// For BullMQ, and for publisher/subscriber patterns, it's good practice
// to use separate client instances. ioredis's .duplicate() is suitable for this.
export const redisPublisher = redisClient.duplicate();
export const redisSubscriber = redisClient.duplicate();

// We don't need to explicitly call .connect() on these duplicated clients here.
// ioredis will attempt to connect when they are first used (e.g., .publish() or .subscribe())
// or if not lazy, it starts connecting upon instantiation.
redisPublisher.on('connect', () => console.log('[RedisClient Publisher] Connected.'));
redisPublisher.on('error', (err: Error) => console.error('[RedisClient Publisher] Error', err));

redisSubscriber.on('connect', () => console.log('[RedisClient Subscriber] Connected.'));
redisSubscriber.on('error', (err: Error) => console.error('[RedisClient Subscriber] Error', err));

// Commenting out the previous explicit connection block
// // No explicit connect() calls are typically needed for publisher/subscriber
// // with ioredis as they connect on first use or if lazyConnect is false.
// // If you were using lazyConnect: true, you might need to await connect() before first use.
// // (async () => {
// //   try {
// //     if (redisPublisher.status === 'wait') await redisPublisher.connect();
// //     if (redisSubscriber.status === 'wait') await redisSubscriber.connect();
// //     console.log('ioredis Publisher and Subscriber ready.');
// //   } catch (err) {
// //     console.error('Could not connect ioredis publisher/subscriber:', err);
// //   }
// // })();

// Note: BullMQ itself prefers ioredis and handles connections well.
// The main `redisClient` can be passed to BullMQ, and it often
// creates its own connections or uses the provided one effectively. 