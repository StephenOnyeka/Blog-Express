import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async findAll(userId?: string): Promise<Article[]> {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.is_draft = :isDraft', { isDraft: false });

    if (userId) {
      qb.orWhere('article.author_id = :userId', { userId });
    }

    qb.orderBy('article.published_at', 'DESC').addOrderBy(
      'article.created_at',
      'DESC',
    );

    return qb.getMany();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(userId: string, data: Partial<Article>): Promise<Article> {
    const article = this.articlesRepository.create({
      ...data,
      author: { id: userId } as User,
    });
    return this.articlesRepository.save(article);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Article>,
  ): Promise<Article> {
    const article = await this.findOne(id);
    if (article.author.id !== userId) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    // Auto-calculate read time if body provided
    if (data.body) {
      const text = data.body.replace(/<[^>]+>/g, ' ').trim();
      const words = text.split(/\\s+/).filter(Boolean).length;
      data.read_time = Math.max(1, Math.ceil(words / 200));
    }

    Object.assign(article, data);
    return this.articlesRepository.save(article);
  }

  async publish(id: string, userId: string): Promise<Article> {
    const article = await this.findOne(id);
    if (article.author.id !== userId) {
      throw new ForbiddenException('You can only publish your own articles');
    }

    article.is_draft = false;
    if (!article.published_at) {
      article.published_at = new Date();
    }

    const saved = await this.articlesRepository.save(article);
    // TODO: Trigger notifications / emails here
    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const article = await this.findOne(id);
    if (article.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.articlesRepository.remove(article);
  }

  async clap(id: string): Promise<Article> {
    const article = await this.findOne(id);
    article.claps += 1;
    return this.articlesRepository.save(article);
  }
}
