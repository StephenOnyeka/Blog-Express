import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/notification.service';

class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getMyNotifications((req as any).user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  static async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.getUnreadCount((req as any).user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async readAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.markAllRead((req as any).user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async readOne(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.markAsRead(req.params.id as string, (req as any).user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
