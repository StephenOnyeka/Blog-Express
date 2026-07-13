import { Request, Response, NextFunction } from 'express';
import ArticleService from '../services/article.service';

class ArticleController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.createArticle((req as any).user.id, req.body);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ArticleService.getArticles(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.getArticleById(req.params.id as string);
      res.json(article);
    } catch (error: any) {
      if (error.message === 'Article not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.updateArticle(req.params.id as string, (req as any).user.id, req.body);
      res.json(article);
    } catch (error: any) {
      if (error.message === 'Article not found') return res.status(404).json({ message: error.message });
      if (error.message === 'Forbidden') return res.status(403).json({ message: error.message });
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ArticleService.deleteArticle(req.params.id as string, (req as any).user.id);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Article not found') return res.status(404).json({ message: error.message });
      if (error.message === 'Forbidden') return res.status(403).json({ message: error.message });
      next(error);
    }
  }
}

export default ArticleController;
