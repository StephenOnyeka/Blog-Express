import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/article.entity';
import { EmailSubscription } from '../email-subscriptions/email-subscription.entity';
import { User } from '../users/user.entity';
import { AuthorFollow } from '../author-follows/author-follow.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, EmailSubscription, User, AuthorFollow]),
    MailModule,
  ],
  providers: [CronService],
})
export class CronModule {}
