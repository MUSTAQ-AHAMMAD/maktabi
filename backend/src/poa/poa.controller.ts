import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PoaService } from './poa.service';

@ApiTags('PowersOfAttorney')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('poa')
export class PoaController {
  constructor(private service: PoaService) {}

  @Get() findAll(@Query('status') status?: string, @Query('contactId') contactId?: string, @Query('search') search?: string) { return this.service.findAll({ status, contactId, search }); }
  @Get('summary') summary() { return this.service.summary(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Patch(':id/revoke') revoke(@Param('id') id: string) { return this.service.revoke(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
