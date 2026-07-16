import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
    }
    (req as any).user = user;
    next();
  })(req, res, next);
};

export default authMiddleware;
