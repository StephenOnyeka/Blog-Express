import app from './app';
import env from './config/env';
import prisma from './config/database';
import startJobs from './jobs/cleanup.job';

const startServer = async () => {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      startJobs();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
