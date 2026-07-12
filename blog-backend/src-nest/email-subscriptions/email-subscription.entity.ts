import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('email_subscriptions')
export class EmailSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { array: true, default: [] })
  topics: string[];

  @Column({ default: true })
  subscribe_newsletter: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verify_token: string;

  @Column({ nullable: true })
  unsubscribe_token: string;

  @CreateDateColumn()
  created_at: Date;
}
