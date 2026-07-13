import express from 'express';
import ArticleController from '../controllers/article.controller';
import validate from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { createArticleSchema, updateArticleSchema } from '../validators/article.validator';

const router = express.Router();

router.get('/', ArticleController.getAll);
router.get('/:id', ArticleController.getById);

router.post('/', authMiddleware, validate(createArticleSchema), ArticleController.create);
router.put('/:id', authMiddleware, validate(updateArticleSchema), ArticleController.update);
router.delete('/:id', authMiddleware, ArticleController.delete);

export default router;
