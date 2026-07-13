import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/database';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub?: string; id?: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub || decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default authMiddleware;
