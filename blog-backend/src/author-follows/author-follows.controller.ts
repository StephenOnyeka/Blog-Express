import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthorFollowsService } from './author-follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class AuthorFollowsController {
  constructor(private readonly followsService: AuthorFollowsService) {}

  @Post(':authorId')
  async follow(@Request() req, @Param('authorId') authorId: string) {
    return this.followsService.follow(req.user.userId, authorId);
  }

  @Delete(':authorId')
  async unfollow(@Request() req, @Param('authorId') authorId: string) {
    return this.followsService.unfollow(req.user.userId, authorId);
  }

  @Get()
  async getFollowing(@Request() req) {
    return this.followsService.getFollowing(req.user.userId);
  }
}
