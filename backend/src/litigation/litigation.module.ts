import { Module } from '@nestjs/common';
import { LitigationService } from './litigation.service';
import { LitigationController } from './litigation.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [LitigationService],
  controllers: [LitigationController],
})
export class LitigationModule {}
