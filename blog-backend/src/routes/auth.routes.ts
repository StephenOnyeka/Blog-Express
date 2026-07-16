import express, { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth.controller';
import validate from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import passport from '../config/passport';
import AuthService from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);

// Local (form-fill) login via passport
router.post('/login', validate(loginSchema), (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid email or password' });
    }
    const token = AuthService.generateToken(user.id);
    res.json({ user: AuthService.excludePassword(user), token });
  })(req, res, next);
});

router.get('/me', authMiddleware, AuthController.getMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=google_auth_failed`,
  }),
  AuthController.googleCallback
);

export default router;
