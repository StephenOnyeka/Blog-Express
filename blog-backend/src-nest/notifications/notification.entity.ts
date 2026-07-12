import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Article } from '../articles/article.entity';

export enum NotificationType {
  NEW_ARTICLE = 'new_article',
  ANNOUNCEMENT = 'announcement',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ type: 'varchar' })
  type: NotificationType;

  @Column('text')
  message: string;

  @ManyToOne(() => Article, { nullable: true })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
