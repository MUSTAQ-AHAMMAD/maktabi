import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancialService } from './financial.service';

@ApiTags('Financial Execution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private service: FinancialService) {}

  @Get() findAll(@Query() query: any) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Post(':id/payments') addPayment(@Param('id') id: string, @Body() body: any) { return this.service.addPayment(id, body); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.softDelete(id); }
}
