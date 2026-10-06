import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LeavesService } from './leaves.service';

@ApiTags('Leaves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private service: LeavesService) {}
  @Get() findAll(@CurrentUser() user: any, @Query('status') status?: string, @Query('mine') mine?: string) { return this.service.findAll({ status, mine }, user.id, user.role); }
  @Get('balance') balance(@CurrentUser() user: any) { return this.service.balance(user.id); }
  @Get('summary') summary() { return this.service.summary(); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Patch(':id/approve') approve(@Param('id') id: string, @CurrentUser() user: any) { return this.service.decide(id, 'APPROVED', user.id); }
  @Patch(':id/reject') reject(@Param('id') id: string, @CurrentUser() user: any) { return this.service.decide(id, 'REJECTED', user.id); }
  @Delete(':id') cancel(@Param('id') id: string) { return this.service.cancel(id); }
}
