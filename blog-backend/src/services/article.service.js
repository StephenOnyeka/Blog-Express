const prisma = require('../config/database');

class ArticleService {
  static async createArticle(authorId, data) {
    const readTime = Math.ceil((data.body || '').split(' ').length / 200); // 200 words per min

    return prisma.article.create({
      data: {
        ...data,
        author_id: authorId,
        read_time: readTime || 1,
        published_at: data.is_draft ? null : new Date(),
      },
    });
  }

  static async getArticles(query) {
    const { page = 1, limit = 10, author_id, tags } = query;
    const skip = (page - 1) * limit;

    const where = { is_draft: false };
    if (author_id) where.author_id = author_id;
    if (tags) where.tags = { hasSome: tags.split(',') };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true },
          },
        },
        orderBy: { published_at: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total, page: Number(page), limit: Number(limit) };
  }

  static async getArticleById(id) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    if (!article) throw new Error('Article not found');
    return article;
  }

  static async updateArticle(id, authorId, data) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new Error('Article not found');
    if (article.author_id !== authorId) throw new Error('Forbidden');

    if (data.is_draft === false && article.is_draft === true) {
      data.published_at = new Date();
    }
    if (data.body) {
      data.read_time = Math.ceil(data.body.split(' ').length / 200) || 1;
    }

    return prisma.article.update({
      where: { id },
      data,
    });
  }

  static async deleteArticle(id, authorId) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new Error('Article not found');
    if (article.author_id !== authorId) throw new Error('Forbidden');

    await prisma.article.delete({ where: { id } });
    return { message: 'Article deleted successfully' };
  }
}

module.exports = ArticleService;
