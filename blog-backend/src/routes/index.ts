const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const articleRoutes = require('./article.routes');
const notificationRoutes = require('./notification.routes');
const subscriptionRoutes = require('./subscription.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/subscriptions', subscriptionRoutes);

module.exports = router;

