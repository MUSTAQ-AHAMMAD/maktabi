import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { EstimatesService } from './estimates.service';
import { ExpensesService } from './expenses.service';
import { TreasuryService } from './treasury.service';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}
  @Get() findAll(@Query('status') status?: string, @Query('contactId') contactId?: string, @Query('search') search?: string) { return this.service.findAll({ status, contactId, search }); }
  @Get('summary') summary() { return this.service.summary(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Post(':id/payments') addPayment(@Param('id') id: string, @Body() body: any) { return this.service.addPayment(id, body); }
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.service.updateStatus(id, status); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@ApiTags('Estimates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estimates')
export class EstimatesController {
  constructor(private service: EstimatesService) {}
  @Get() findAll(@Query('status') status?: string, @Query('contactId') contactId?: string) { return this.service.findAll({ status, contactId }); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Post(':id/convert') convert(@Param('id') id: string, @CurrentUser() user: any) { return this.service.convertToInvoice(id, user.id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private service: ExpensesService) {}
  @Get() findAll(@Query('category') category?: string, @Query('brandId') brandId?: string, @Query('search') search?: string) { return this.service.findAll({ category, brandId, search }); }
  @Get('summary') summary() { return this.service.summary(); }
  @Post() create(@Body() body: any, @CurrentUser() user: any) { return this.service.create(body, user.id); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@ApiTags('Treasury')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('treasury')
export class TreasuryController {
  constructor(private service: TreasuryService) {}
  @Get('accounts') accounts() { return this.service.accounts(); }
  @Post('accounts') createAccount(@Body() body: any) { return this.service.createAccount(body); }
  @Get('transactions') transactions(@Query('accountId') accountId?: string) { return this.service.transactions(accountId); }
  @Post('transactions') addTransaction(@Body() body: any) { return this.service.addTransaction(body); }
}
