import express from 'express';
import UserController from '../controllers/user.controller';
import validate from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = express.Router();

router.get('/:id', UserController.getProfile);
router.put('/:id', authMiddleware, validate(updateUserSchema), UserController.updateProfile);
router.post('/:id/follow', authMiddleware, UserController.follow);
router.delete('/:id/follow', authMiddleware, UserController.unfollow);

export default router;
