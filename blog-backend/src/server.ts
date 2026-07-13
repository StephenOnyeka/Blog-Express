import app from './app';
import env from './config/env';
import prisma from './config/database';
import startJobs from './jobs/cleanup.job';

const startServer = async () => {
  try {
    // Connect to the database
    await prisma.$connect();
    
    // Verify the connection is actually working by running a simple query
    // This is more reliable than just calling $connect()
    await prisma.$queryRaw`SELECT 1 as connected;`;
    
    console.log('Database connected successfully');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      startJobs();
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
    
    // Optional: Log more details for debugging
    if (error.code) {
      console.error(`Database error code: ${error.code}`);
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

// import app from './app';
// import env from './config/env';
// import prisma from './config/database';
// import startJobs from './jobs/cleanup.job';

// const startServer = async () => {
//   try {
//     // Check database connection
//     await prisma.$connect();
//     console.log('Database connected successfully');

//     // Start server
//     app.listen(env.PORT, () => {
//       console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
//       startJobs();
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     await prisma.$disconnect();
//     process.exit(1);
//   }
// };

// startServer();
