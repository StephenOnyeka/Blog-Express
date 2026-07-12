const authService = require('../services/auth.service');

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      res.json({ user: authService.excludePassword(req.user) });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
