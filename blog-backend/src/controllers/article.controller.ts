const articleService = require('../services/article.service');

class ArticleController {
  static async create(req, res, next) {
    try {
      const article = await articleService.createArticle(req.user.id, req.body);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await articleService.getArticles(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const article = await articleService.getArticleById(req.params.id);
      res.json(article);
    } catch (error) {
      if (error.message === 'Article not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const article = await articleService.updateArticle(req.params.id, req.user.id, req.body);
      res.json(article);
    } catch (error) {
      if (error.message === 'Article not found') return res.status(404).json({ message: error.message });
      if (error.message === 'Forbidden') return res.status(403).json({ message: error.message });
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await articleService.deleteArticle(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Article not found') return res.status(404).json({ message: error.message });
      if (error.message === 'Forbidden') return res.status(403).json({ message: error.message });
      next(error);
    }
  }
}

module.exports = ArticleController;
