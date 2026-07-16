import { Queue } from 'bullmq';
import redisClient from './redis';

// Export queue instances
export const notificationQueue = new Queue('notifications', {
  connection: redisClient,
});

export const cleanupQueue = new Queue('cleanup', {
  connection: redisClient,
});
