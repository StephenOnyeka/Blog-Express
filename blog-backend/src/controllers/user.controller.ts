const userService = require('../services/user.service');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      // Users can only update their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updatedUser = await userService.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error.message === 'Username is already taken') {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  }

  static async follow(req, res, next) {
    try {
      const result = await userService.followUser(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Cannot follow yourself') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async unfollow(req, res, next) {
    try {
      const result = await userService.unfollowUser(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
