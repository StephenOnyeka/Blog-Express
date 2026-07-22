import { Redis } from 'ioredis';
import env from './env';

const redisClient = new Redis(env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

// Dedicated connection for BullMQ (queues + workers). BullMQ uses blocking
// commands and therefore requires `maxRetriesPerRequest: null`; it also throws
// if that option is anything else. The middleware caches/rate-limiters must NOT
// use this option (they'd retry forever instead of falling back), so BullMQ
// gets its own connection separate from `redisClient`.
export const bullConnection = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

bullConnection.on('error', (err) => {
  console.error('❌ BullMQ Redis Connection Error:', err);
});

export default redisClient;
