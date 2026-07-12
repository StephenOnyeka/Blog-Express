import { Controller, Post, Body, Get, Query, Delete } from '@nestjs/common';
import { EmailSubscriptionsService } from './email-subscriptions.service';

@Controller('email-subscriptions')
export class EmailSubscriptionsController {
  constructor(private readonly subService: EmailSubscriptionsService) {}

  @Post()
  async subscribe(
    @Body() body: { email: string; topics: string[]; newsletter: boolean },
  ) {
    return this.subService.subscribe(body.email, body.topics, body.newsletter);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.subService.verify(token);
  }

  @Delete('unsubscribe')
  async unsubscribe(@Query('token') token: string) {
    return this.subService.unsubscribe(token);
  }
}
