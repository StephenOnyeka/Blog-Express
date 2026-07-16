import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import env from '../config/env';

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: AuthService.excludePassword((req as any).user) });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth callback: issue a JWT and redirect back to the frontend
  static googleCallback(req: Request, res: Response) {
    const user = (req as any).user;
    const token = AuthService.generateToken(user.id);
    const redirectUrl = new URL('/auth/callback', env.FRONTEND_URL);
    redirectUrl.searchParams.set('token', token);
    res.redirect(redirectUrl.toString());
  }
}

export default AuthController;
