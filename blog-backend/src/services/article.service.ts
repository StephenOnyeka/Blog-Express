import prisma from '../config/database';
import NotificationService from './notification.service';

class ArticleService {
  static async createArticle(authorId: string, data: Record<string, any>) {
    const readTime = Math.ceil((data.body || '').split(' ').length / 200); // 200 words per min

    const article = await prisma.article.create({
      data: {
        ...data,
        author: { connect: { id: authorId } },
        read_time: readTime || 1,
        published_at: data.is_draft ? null : new Date(),
      } as any,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    if (!article.is_draft) {
      await NotificationService.createForFollowers(article);
    }

    return article;
  }

  static async getArticles(query: Record<string, any>) {
    const { page = 1, limit = 10, author_id, tags } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { is_draft: false };
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

  static async getArticleById(id: string) {
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

  static async updateArticle(id: string, authorId: string, data: Record<string, any>) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new Error('Article not found');
    if (article.author_id !== authorId) throw new Error('Forbidden');

    const isPublishing = data.is_draft === false && article.is_draft === true;
    if (isPublishing) {
      data.published_at = new Date();
    }
    if (data.body) {
      data.read_time = Math.ceil(data.body.split(' ').length / 200) || 1;
    }

    const updated = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    if (isPublishing) {
      await NotificationService.createForFollowers(updated);
    }

    return updated;
  }

  static async deleteArticle(id: string, authorId: string) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new Error('Article not found');
    if (article.author_id !== authorId) throw new Error('Forbidden');

    await prisma.article.delete({ where: { id } });
    return { message: 'Article deleted successfully' };
  }
}

export default ArticleService;
