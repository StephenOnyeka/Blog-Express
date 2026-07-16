import prisma from '../config/database';
import NotificationService from './notification.service';
import { notificationQueue, cleanupQueue } from '../config/queue';
import { clearCache } from '../middlewares/cache.middleware';

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
      await notificationQueue.add('new_article', {
        type: 'new_article',
        articleId: article.id,
      });
    }

    return article;
  }

  static async getArticles(query: Record<string, any>) {
    const { limit = 10, author_id, tags, cursor } = query;
    const parsedLimit = Number(limit);

    const where: Record<string, any> = { is_draft: false, is_deleted: false };
    if (author_id) where.author_id = author_id;
    if (tags) where.tags = { hasSome: tags.split(',') };

    const queryOptions: any = {
      where,
      take: parsedLimit + 1, // Fetch one extra to determine nextCursor
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
      orderBy: { published_at: 'desc' },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor as string };
    }

    const articles = await prisma.article.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    if (articles.length > parsedLimit) {
      const nextItem = articles.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    return { articles, nextCursor, limit: parsedLimit };
  }

  static async getArticleById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id, is_deleted: false },
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
    const article = await prisma.article.findUnique({ where: { id, is_deleted: false } });
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
      await notificationQueue.add('new_article', {
        type: 'new_article',
        articleId: updated.id,
      });
    }

    // Bust the cache for this specific article and feeds
    await clearCache(`*/api/articles/${id}*`);
    await clearCache('*/api/articles*');

    return updated;
  }

  static async deleteArticle(id: string, authorId: string) {
    const article = await prisma.article.findUnique({ where: { id, is_deleted: false } });
    if (!article) throw new Error('Article not found');
    if (article.author_id !== authorId) throw new Error('Forbidden');

    await prisma.article.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    // Background cleanup job for comments/images
    await cleanupQueue.add('cleanup_article', { articleId: id });

    // Invalidate cache
    await clearCache(`*/api/articles/${id}*`);
    await clearCache('*/api/articles*');

    return { message: 'Article deleted successfully' };
  }
}

export default ArticleService;
