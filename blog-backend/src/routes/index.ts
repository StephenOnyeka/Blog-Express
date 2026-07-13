import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import articleRoutes from './article.routes';
import notificationRoutes from './notification.routes';
import subscriptionRoutes from './subscription.routes';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
