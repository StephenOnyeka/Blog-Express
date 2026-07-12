import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(@Request() req) {
    // If we want to extract user id from token (optional auth)
    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Decode JWT here manually or use a custom decorator to get userId if available
      // For simplicity, we just return published articles if not using guard
    }
    return this.articlesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body) {
    return this.articlesService.create(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.articlesService.update(id, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@Request() req, @Param('id') id: string) {
    return this.articlesService.publish(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.articlesService.remove(id, req.user.userId);
  }

  @Post(':id/clap')
  async clap(@Param('id') id: string) {
    return this.articlesService.clap(id);
  }
}
