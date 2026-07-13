import crypto from 'crypto';
import prisma from '../config/database';
import env from '../config/env';
import { sendMail } from '../utils/mailer';

class SubscriptionService {
  static async subscribe({
    email,
    topics = [],
    newsletter = true,
    userId,
  }: {
    email: string;
    topics?: string[];
    newsletter?: boolean;
    userId?: string;
  }) {
    const existing = await prisma.emailSubscription.findFirst({ where: { email } });

    if (existing) {
      const updated = await prisma.emailSubscription.update({
        where: { id: existing.id },
        data: {
          topics,
          subscribe_newsletter: newsletter,
          ...(userId && !existing.user_id ? { user_id: userId } : {}),
        },
      });
      return { success: true, verified: updated.is_verified };
    }

    const verify_token = crypto.randomBytes(16).toString('hex');
    const unsubscribe_token = crypto.randomBytes(24).toString('hex');

    await prisma.emailSubscription.create({
      data: {
        email,
        topics,
        subscribe_newsletter: newsletter,
        verify_token,
        unsubscribe_token,
        ...(userId ? { user_id: userId } : {}),
      },
    });

    await this.sendVerificationEmail(email, verify_token);

    return { success: true, verified: false };
  }

  static async verify(token: string) {
    const sub = await prisma.emailSubscription.findFirst({ where: { verify_token: token } });
    if (!sub) throw new Error('Invalid token');

    await prisma.emailSubscription.update({
      where: { id: sub.id },
      data: { is_verified: true, verify_token: null },
    });

    return { success: true };
  }

  static async unsubscribe(token: string) {
    const sub = await prisma.emailSubscription.findFirst({ where: { unsubscribe_token: token } });
    if (!sub) throw new Error('Invalid token');

    await prisma.emailSubscription.delete({ where: { id: sub.id } });
    return { success: true };
  }

  static async sendVerificationEmail(email: string, token: string) {
    const url = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    try {
      await sendMail({
        to: email,
        subject: 'Verify your BlogNest subscription',
        html: `
          <h1>Welcome to BlogNest updates!</h1>
          <p>Please confirm your subscription by clicking the link below:</p>
          <a href="${url}">${url}</a>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', (error as Error).message);
    }
  }
}

export default SubscriptionService;
