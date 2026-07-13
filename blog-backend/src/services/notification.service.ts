const prisma = require('../config/database');

class NotificationService {
  static async createForFollowers(article) {
    const follows = await prisma.authorFollow.findMany({
      where: { author_id: article.author_id },
      select: { follower_id: true },
    });

    if (follows.length === 0) return;

    const authorName = article.author?.name || 'An author you follow';

    await prisma.notification.createMany({
      data: follows.map((f) => ({
        recipient_id: f.follower_id,
        type: 'new_article',
        message: `${authorName} published a new article: ${article.title}`,
        article_id: article.id,
      })),
    });
  }

  static async getMyNotifications(userId) {
    return prisma.notification.findMany({
      where: { recipient_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        article: {
          include: {
            author: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
      },
    });
  }

  static async markAsRead(id, userId) {
    await prisma.notification.updateMany({
      where: { id, recipient_id: userId },
      data: { is_read: true },
    });
    return { success: true };
  }

  static async markAllRead(userId) {
    await prisma.notification.updateMany({
      where: { recipient_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }

  static async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: { recipient_id: userId, is_read: false },
    });
    return { count };
  }
}

module.exports = NotificationService;
