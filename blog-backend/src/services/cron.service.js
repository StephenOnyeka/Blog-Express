const prisma = require('../config/database');
const { sendMail } = require('../utils/mailer');
const env = require('../config/env');

class CronService {
  // Weekly digest: email verified newsletter subscribers the last 7 days of articles.
  static async sendWeeklyDigest() {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentArticles = await prisma.article.findMany({
      where: { is_draft: false, published_at: { gte: lastWeek } },
      include: { author: { select: { name: true } } },
      orderBy: { published_at: 'desc' },
    });

    if (recentArticles.length === 0) {
      return { sent: 0, articles: 0 };
    }

    const subscribers = await prisma.emailSubscription.findMany({
      where: { is_verified: true, subscribe_newsletter: true },
    });

    let sent = 0;
    for (const sub of subscribers) {
      let articles = recentArticles;
      if (sub.topics && sub.topics.length > 0) {
        articles = recentArticles.filter(
          (a) => a.tags && a.tags.some((tag) => sub.topics.includes(tag))
        );
      }
      if (articles.length === 0) continue;

      try {
        await sendMail({
          to: sub.email,
          subject: 'Your weekly BlogNest digest',
          html: this.buildDigestHtml(articles),
        });
        sent += 1;
      } catch (error) {
        console.error(`Digest send failed for ${sub.email}:`, error.message);
      }
    }

    return { sent, articles: recentArticles.length };
  }

  static buildDigestHtml(articles) {
    const items = articles
      .map(
        (a) =>
          `<li><a href="${env.FRONTEND_URL}/article/${a.id}">${a.title}</a> by ${a.author?.name || 'Unknown'}</li>`
      )
      .join('');
    return `
      <h1>Here are your top articles for the week</h1>
      <ul>${items}</ul>
      <p style="color:#888;font-size:12px">You are receiving this because you subscribed to BlogNest.</p>
    `;
  }

  // Reconcile denormalized follower/following counts from the source of truth.
  static async syncFollowerCounts() {
    await prisma.$executeRawUnsafe(`
      UPDATE "users"
      SET "followersCount" = (SELECT count(*) FROM "author_follows" WHERE "author_id" = "users"."id"),
          "followingCount" = (SELECT count(*) FROM "author_follows" WHERE "follower_id" = "users"."id")
    `);
    return { success: true };
  }

  // Delete empty drafts left untouched for 14+ days.
  static async cleanupStaleDrafts() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const result = await prisma.article.deleteMany({
      where: {
        is_draft: true,
        title: '',
        body: { in: ['', '<p><br></p>'] },
        created_at: { lt: fourteenDaysAgo },
      },
    });
    return { deleted: result.count };
  }
}

module.exports = CronService;
