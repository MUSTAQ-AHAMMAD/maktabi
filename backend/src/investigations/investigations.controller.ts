import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvestigationsService } from './investigations.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Investigations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investigations')
export class InvestigationsController {
  constructor(private service: InvestigationsService) {}

  @Get() findAll(@Query() query: any) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Put(':id/status') updateStatus(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.service.updateStatus(id, body.status, user.id, body.notes);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.softDelete(id); }
}
