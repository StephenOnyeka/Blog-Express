import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorFollow } from './author-follow.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AuthorFollowsService {
  constructor(
    @InjectRepository(AuthorFollow)
    private followsRepository: Repository<AuthorFollow>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async follow(followerId: string, authorId: string) {
    if (followerId === authorId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existing = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, author: { id: authorId } },
    });

    if (!existing) {
      const follow = this.followsRepository.create({
        follower: { id: followerId } as User,
        author: { id: authorId } as User,
      });
      await this.followsRepository.save(follow);

      // Update counts
      await this.usersRepository.increment(
        { id: authorId },
        'followersCount',
        1,
      );
      await this.usersRepository.increment(
        { id: followerId },
        'followingCount',
        1,
      );
    }
    return { success: true };
  }

  async unfollow(followerId: string, authorId: string) {
    const existing = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, author: { id: authorId } },
    });

    if (existing) {
      await this.followsRepository.remove(existing);

      // Update counts
      await this.usersRepository.decrement(
        { id: authorId },
        'followersCount',
        1,
      );
      await this.usersRepository.decrement(
        { id: followerId },
        'followingCount',
        1,
      );
    }
    return { success: true };
  }

  async getFollowing(followerId: string) {
    return this.followsRepository.find({
      where: { follower: { id: followerId } },
      relations: { author: true },
    });
  }
}
