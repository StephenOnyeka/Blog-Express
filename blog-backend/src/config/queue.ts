import { Queue } from 'bullmq';
import { bullConnection } from './redis';

// Export queue instances
export const notificationQueue = new Queue('notifications', {
  connection: bullConnection,
});

export const cleanupQueue = new Queue('cleanup', {
  connection: bullConnection,
});
