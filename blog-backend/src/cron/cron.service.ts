import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Article } from '../articles/article.entity';
import { EmailSubscription } from '../email-subscriptions/email-subscription.entity';
import { User } from '../users/user.entity';
import { AuthorFollow } from '../author-follows/author-follow.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(EmailSubscription)
    private subscriptionsRepository: Repository<EmailSubscription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AuthorFollow)
    private followsRepository: Repository<AuthorFollow>,
    private mailService: MailService,
  ) {}

  @Cron('0 8 * * 1') // Every Monday at 8:00 AM
  async handleWeeklyDigest() {
    this.logger.debug('Running weekly digest cron job');

    // Find articles published in last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentArticles = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.is_draft = :isDraft', { isDraft: false })
      .andWhere('article.published_at >= :date', { date: lastWeek })
      .getMany();

    if (recentArticles.length === 0) return;

    const subscribers = await this.subscriptionsRepository.find({
      where: { is_verified: true, subscribe_newsletter: true },
    });

    for (const sub of subscribers) {
      // Filter by topics if needed
      let userArticles = recentArticles;
      if (sub.topics && sub.topics.length > 0) {
        userArticles = recentArticles.filter(
          (a) => a.tags && a.tags.some((tag) => sub.topics.includes(tag)),
        );
      }

      if (userArticles.length > 0) {
        await this.mailService.sendTopicDigest(sub.email, userArticles);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Every Sunday at midnight in the plan but daily is safer for stale drafts
  async cleanupStaleDrafts() {
    this.logger.debug('Cleaning up stale drafts');
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    await this.articlesRepository.delete({
      is_draft: true,
      title: '',
      body: '<p><br></p>', // Empty quill
      created_at: LessThan(fourteenDaysAgo),
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncFollowerCounts() {
    this.logger.debug('Syncing follower counts');
    // For large scale, do this with raw queries. Here we'll do a simple iteration or subquery update.
    // PostgreSQL specific raw query to update all:
    await this.usersRepository.query(`
      UPDATE users 
      SET "followersCount" = (SELECT count(*) FROM author_follows WHERE author_id = users.id),
          "followingCount" = (SELECT count(*) FROM author_follows WHERE follower_id = users.id)
    `);
  }
}
