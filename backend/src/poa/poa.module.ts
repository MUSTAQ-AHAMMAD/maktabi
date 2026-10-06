import { Module } from '@nestjs/common';
import { PoaService } from './poa.service';
import { PoaController } from './poa.controller';

@Module({ providers: [PoaService], controllers: [PoaController] })
export class PoaModule {}
