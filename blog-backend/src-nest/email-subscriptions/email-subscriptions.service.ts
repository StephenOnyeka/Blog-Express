import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSubscription } from './email-subscription.entity';
import * as crypto from 'crypto';

@Injectable()
export class EmailSubscriptionsService {
  constructor(
    @InjectRepository(EmailSubscription)
    private subscriptionsRepository: Repository<EmailSubscription>,
  ) {}

  async subscribe(
    email: string,
    topics: string[],
    newsletter: boolean,
    userId?: string,
  ) {
    let sub = await this.subscriptionsRepository.findOne({ where: { email } });

    if (!sub) {
      sub = this.subscriptionsRepository.create({
        email,
        topics,
        subscribe_newsletter: newsletter,
        verify_token: crypto.randomBytes(16).toString('hex'),
        unsubscribe_token: crypto.randomBytes(24).toString('hex'),
      });
      if (userId) {
        sub.user = { id: userId } as any;
      }
      await this.subscriptionsRepository.save(sub);

      // TODO: Send verification email
    } else {
      // Update existing
      sub.topics = topics;
      sub.subscribe_newsletter = newsletter;
      if (userId && !sub.user) {
        sub.user = { id: userId } as any;
      }
      await this.subscriptionsRepository.save(sub);
    }

    return { success: true };
  }

  async verify(token: string) {
    const sub = await this.subscriptionsRepository.findOne({
      where: { verify_token: token },
    });
    if (!sub) throw new NotFoundException('Invalid token');

    sub.is_verified = true;
    sub.verify_token = null as any;
    await this.subscriptionsRepository.save(sub);

    return { success: true };
  }

  async unsubscribe(token: string) {
    const sub = await this.subscriptionsRepository.findOne({
      where: { unsubscribe_token: token },
    });
    if (!sub) throw new NotFoundException('Invalid token');

    await this.subscriptionsRepository.remove(sub);
    return { success: true };
  }
}
