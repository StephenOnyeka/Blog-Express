import express from 'express';
import AuthController from '../controllers/auth.controller';
import validate from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
