import { Module } from '@nestjs/common';
import { LitigationService } from './litigation.service';
import { LitigationController } from './litigation.controller';

@Module({
  providers: [LitigationService],
  controllers: [LitigationController],
})
export class LitigationModule {}
