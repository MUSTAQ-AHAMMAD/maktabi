import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConsultationsService } from './consultations.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private service: ConsultationsService) {}

  @Get() findAll(@Query() query: any) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Put(':id/status') updateStatus(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.service.updateStatus(id, body.status, user.id, body.notes);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.softDelete(id); }
}
