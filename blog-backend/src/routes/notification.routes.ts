const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getAll);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all', notificationController.readAll);
router.patch('/:id/read', notificationController.readOne);

module.exports = router;
