import express from 'express';
import ArticleController from '../controllers/article.controller';
import validate from '../middlewares/validate.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { createArticleSchema, updateArticleSchema } from '../validators/article.validator';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { articleCreationLimiter } from '../middlewares/rate-limit.middleware';

const router = express.Router();

router.get('/', cacheMiddleware(900), ArticleController.getAll); // Cache for 15 mins
router.get('/:id', cacheMiddleware(900), ArticleController.getById); // Cache for 15 mins

router.post('/', authMiddleware, articleCreationLimiter, validate(createArticleSchema), ArticleController.create);
router.put('/:id', authMiddleware, validate(updateArticleSchema), ArticleController.update);
router.delete('/:id', authMiddleware, ArticleController.delete);

export default router;
