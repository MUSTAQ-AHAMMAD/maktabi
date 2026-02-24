import { Module } from '@nestjs/common';
import { InvestigationsService } from './investigations.service';
import { InvestigationsController } from './investigations.controller';

@Module({ providers: [InvestigationsService], controllers: [InvestigationsController] })
export class InvestigationsModule {}
