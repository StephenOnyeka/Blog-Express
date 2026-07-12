import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    // If using Resend, you can use SMTP with Host: smtp.resend.com, Port: 465, User: resend, Pass: API_KEY
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: this.configService.get<string>(
          'RESEND_API_KEY',
          're_placeholder',
        ),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:5173/verify-email?token=${token}`;
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM', 'noreply@blognest.app'),
      to: email,
      subject: 'Verify your BlogNest Subscription',
      html: `
        <h1>Welcome to BlogNest Updates!</h1>
        <p>Please click the link below to verify your email subscription:</p>
        <a href="${url}">${url}</a>
      `,
    };

    try {
      if (
        this.configService.get<string>('RESEND_API_KEY') ===
          're_your_resend_api_key' ||
        !this.configService.get<string>('RESEND_API_KEY')
      ) {
        this.logger.warn(
          `Mail mock send to ${email}: Verification token: ${token}`,
        );
        return;
      }
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error('Error sending email', error);
    }
  }

  async sendTopicDigest(email: string, articles: any[]) {
    // In a real app we'd construct a nice HTML template for articles
    const articleList = articles
      .map(
        (a) =>
          `<li><a href="http://localhost:5173/article/${a.id}">${a.title}</a> by ${a.author.name}</li>`,
      )
      .join('');
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM', 'noreply@blognest.app'),
      to: email,
      subject: 'Your Weekly BlogNest Digest',
      html: `
        <h1>Here are your top articles for the week</h1>
        <ul>${articleList}</ul>
      `,
    };

    try {
      if (
        this.configService.get<string>('RESEND_API_KEY') ===
          're_your_resend_api_key' ||
        !this.configService.get<string>('RESEND_API_KEY')
      ) {
        this.logger.warn(`Mail mock send digest to ${email}`);
        return;
      }
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error('Error sending digest', error);
    }
  }
}
