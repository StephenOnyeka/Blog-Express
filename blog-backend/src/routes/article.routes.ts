const express = require('express');
const articleController = require('../controllers/article.controller');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { createArticleSchema, updateArticleSchema } = require('../validators/article.validator');

const router = express.Router();

router.get('/', articleController.getAll);
router.get('/:id', articleController.getById);

router.post('/', authMiddleware, validate(createArticleSchema), articleController.create);
router.put('/:id', authMiddleware, validate(updateArticleSchema), articleController.update);
router.delete('/:id', authMiddleware, articleController.delete);

module.exports = router;
