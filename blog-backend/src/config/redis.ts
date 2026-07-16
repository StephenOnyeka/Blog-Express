import { Redis } from 'ioredis';
import env from './env';

const redisClient = new Redis(env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redisClient;
