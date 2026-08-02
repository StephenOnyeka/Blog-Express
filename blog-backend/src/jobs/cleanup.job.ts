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

  // Health-check self-ping — every 6 days.
  // A true fixed 6-day cadence can't be expressed with 5-field cron (`*/6` on
  // day-of-month resets each month, giving an uneven gap at month boundaries),
  // so use a fixed interval instead.
  const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log('Running health-check ping job...');
      const result = await CronService.pingHealthCheck();
      console.log(`Health-check ping complete. Status ${result.status}.`);
    } catch (error) {
      console.error('Error running health-check ping job:', error);
    }
  }, SIX_DAYS_MS);

  // Database keep-alive — every 6 days, same fixed-interval reasoning as above.
  setInterval(async () => {
    try {
      console.log('Running database keep-alive job...');
      await CronService.pingDatabase();
      console.log('Database keep-alive complete.');
    } catch (error) {
      console.error('Error running database keep-alive job:', error);
    }
  }, SIX_DAYS_MS);

  console.log('Background jobs initialized');
};

export default startJobs;
