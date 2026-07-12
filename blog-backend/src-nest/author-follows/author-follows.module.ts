import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorFollow } from './author-follow.entity';
import { AuthorFollowsService } from './author-follows.service';
import { AuthorFollowsController } from './author-follows.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorFollow, User])],
  providers: [AuthorFollowsService],
  controllers: [AuthorFollowsController],
  exports: [AuthorFollowsService],
})
export class AuthorFollowsModule {}
