import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { AuthorFollow } from '../author-follows/author-follow.entity';
import { Article } from '../articles/article.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(AuthorFollow)
    private followsRepository: Repository<AuthorFollow>,
  ) {}

  async createForSubscribers(article: Article) {
    const follows = await this.followsRepository.find({
      where: { author: { id: article.author.id } },
      relations: { follower: true },
    });

    const notifications = follows.map((follow) => {
      return this.notificationsRepository.create({
        recipient: follow.follower,
        type: NotificationType.NEW_ARTICLE,
        message: `${article.author.name} published a new article: ${article.title}`,
        article: article,
      });
    });

    if (notifications.length > 0) {
      await this.notificationsRepository.save(notifications);
    }
  }

  async getMyNotifications(userId: string) {
    return this.notificationsRepository.find({
      where: { recipient: { id: userId } },
      order: { created_at: 'DESC' },
      relations: { article: { author: true } },
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepository.update(
      { id, recipient: { id: userId } },
      { is_read: true },
    );
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.update(
      { recipient: { id: userId }, is_read: false },
      { is_read: true },
    );
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { recipient: { id: userId }, is_read: false },
    });
    return { count };
  }
}
