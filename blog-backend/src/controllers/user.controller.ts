import { Request, Response, NextFunction } from 'express';
import UserService from '../services/user.service';

class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id as string);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Users can only update their own profile
      if ((req as any).user.id !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updatedUser = await UserService.updateUser((req as any).user.id, req.body);
      res.json(updatedUser);
    } catch (error: any) {
      if (error.message === 'Username is already taken') {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  }

  static async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.followUser((req as any).user.id, req.params.id as string);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Cannot follow yourself') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async unfollow(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.unfollowUser((req as any).user.id, req.params.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
