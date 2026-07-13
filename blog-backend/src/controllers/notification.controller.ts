const notificationService = require('../services/notification.service');

class NotificationController {
  static async getAll(req, res, next) {
    try {
      const notifications = await notificationService.getMyNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  static async unreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async readAll(req, res, next) {
    try {
      const result = await notificationService.markAllRead(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async readOne(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
