import express from 'express';
import NotificationController from '../controllers/notification.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', NotificationController.getAll);
router.get('/unread-count', NotificationController.unreadCount);
router.patch('/read-all', NotificationController.readAll);
router.patch('/:id/read', NotificationController.readOne);

export default router;
