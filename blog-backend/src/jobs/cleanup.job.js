const cron = require('node-cron');
const prisma = require('../config/database');

const startJobs = () => {
  // Example cleanup job running every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running cleanup job...');
      
      // E.g., delete unverified email subscriptions older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.emailSubscription.deleteMany({
        where: {
          is_verified: false,
          created_at: { lt: thirtyDaysAgo },
        },
      });

      console.log(`Cleanup job completed. Deleted ${result.count} unverified subscriptions.`);
    } catch (error) {
      console.error('Error running cleanup job:', error);
    }
  });

  console.log('Background jobs initialized');
};

module.exports = startJobs;
