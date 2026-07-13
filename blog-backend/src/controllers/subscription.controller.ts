import { Request, Response, NextFunction } from 'express';
import SubscriptionService from '../services/subscription.service';

class SubscriptionController {
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, topics, newsletter } = req.body;
      const result = await SubscriptionService.subscribe({
        email,
        topics,
        newsletter,
        userId: (req as any).user?.id,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SubscriptionService.verify(req.query.token as string);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SubscriptionService.unsubscribe(req.query.token as string);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default SubscriptionController;
