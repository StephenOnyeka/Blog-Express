import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes';
import errorMiddleware from './middlewares/error.middleware';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
