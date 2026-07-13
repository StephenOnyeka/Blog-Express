import cron from 'node-cron';
import CronService from '../services/cron.service';

const startJobs = () => {
  // Weekly topic digest — every Monday at 08:00
  cron.schedule('0 8 * * 1', async () => {
    try {
      console.log('Running weekly digest job...');
      const result = await CronService.sendWeeklyDigest();
      console.log(`Weekly digest complete. Sent ${result.sent} emails for ${result.articles} articles.`);
    } catch (error) {
      console.error('Error running weekly digest job:', error);
    }
  });

  // Follower-count sync — hourly
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running follower-count sync job...');
      await CronService.syncFollowerCounts();
      console.log('Follower-count sync complete.');
    } catch (error) {
      console.error('Error running follower-count sync job:', error);
    }
  });

  // Stale-draft cleanup — daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running stale-draft cleanup job...');
      const result = await CronService.cleanupStaleDrafts();
      console.log(`Stale-draft cleanup complete. Deleted ${result.deleted} drafts.`);
    } catch (error) {
      console.error('Error running stale-draft cleanup job:', error);
    }
  });

  console.log('Background jobs initialized');
};

export default startJobs;
