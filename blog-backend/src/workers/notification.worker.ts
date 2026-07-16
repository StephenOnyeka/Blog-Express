import { Worker } from 'bullmq';
import redisClient from '../config/redis';
import NotificationService from '../services/notification.service';
import prisma from '../config/database';

export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { type, articleId } = job.data;

    if (type === 'new_article' && articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
        },
      });

      if (article) {
        // Run notification creation in the background worker
        await NotificationService.createForFollowers(article);
        console.log(`✅ Processed notifications for new article: ${articleId}`);
      }
    }
  },
  { connection: redisClient }
);

notificationWorker.on('completed', (job) => {
  console.log(`[Job ${job.id}] has completed!`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[Job ${job?.id}] has failed with ${err.message}`);
});
