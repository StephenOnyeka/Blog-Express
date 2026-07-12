import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ length: 500, nullable: true })
  subtitle: string;

  @Column('text')
  body: string;

  @Column('text', { nullable: true })
  thumbnail: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: false })
  is_member_only: boolean;

  @Column({ default: 1 })
  read_time: number;

  @Column({ default: 0 })
  claps: number;

  @Column({ default: 0 })
  comments_count: number;

  @Column({ default: true })
  is_draft: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn()
  created_at: Date;
}
