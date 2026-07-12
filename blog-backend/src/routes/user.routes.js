const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

router.get('/:id', userController.getProfile);
router.put('/:id', authMiddleware, validate(updateUserSchema), userController.updateProfile);
router.post('/:id/follow', authMiddleware, userController.follow);
router.delete('/:id/follow', authMiddleware, userController.unfollow);

module.exports = router;
