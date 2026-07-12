const subscriptionService = require('../services/subscription.service');

class SubscriptionController {
  static async subscribe(req, res, next) {
    try {
      const { email, topics, newsletter } = req.body;
      const result = await subscriptionService.subscribe({
        email,
        topics,
        newsletter,
        userId: req.user?.id,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verify(req, res, next) {
    try {
      const result = await subscriptionService.verify(req.query.token);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid token') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async unsubscribe(req, res, next) {
    try {
      const result = await subscriptionService.unsubscribe(req.query.token);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid token') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = SubscriptionController;
