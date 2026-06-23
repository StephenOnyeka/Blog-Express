import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailSubscription } from './email-subscription.entity';
import { EmailSubscriptionsService } from './email-subscriptions.service';
import { EmailSubscriptionsController } from './email-subscriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailSubscription])],
  providers: [EmailSubscriptionsService],
  controllers: [EmailSubscriptionsController],
  exports: [EmailSubscriptionsService],
})
export class EmailSubscriptionsModule {}
