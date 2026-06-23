import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const count = await this.articlesRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded');
      return;
    }

    this.logger.log('Seeding initial data...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create authors
    const author1 = this.usersRepository.create({
      name: 'Stephen Onyeka',
      username: 'stephen',
      email: 'stephen@example.com',
      password_hash: hashedPassword,
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stephen',
      bio: 'Software Engineer & Writer',
    });
    const author2 = this.usersRepository.create({
      name: 'Sarah Chen',
      username: 'sarah',
      email: 'sarah@example.com',
      password_hash: hashedPassword,
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah',
      bio: 'Design & UX Enthusiast',
    });

    await this.usersRepository.save([author1, author2]);

    // Create articles
    const articles = [
      this.articlesRepository.create({
        title: 'The Future of Web Development',
        subtitle: 'Why SSR is making a huge comeback',
        body: '<p>Server-side rendering is the future...</p>',
        tags: ['Technology', 'Programming'],
        is_draft: false,
        published_at: new Date(),
        author: author1,
        read_time: 5,
      }),
      this.articlesRepository.create({
        title: 'Designing for Accessibility',
        subtitle: 'Small changes that make a huge impact',
        body: '<p>Accessibility should not be an afterthought...</p>',
        tags: ['Design'],
        is_draft: false,
        published_at: new Date(),
        author: author2,
        read_time: 4,
      }),
    ];

    await this.articlesRepository.save(articles);
    this.logger.log('Seeding completed');
  }
}
