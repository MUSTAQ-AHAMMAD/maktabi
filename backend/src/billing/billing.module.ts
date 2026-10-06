import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { EstimatesService } from './estimates.service';
import { ExpensesService } from './expenses.service';
import { TreasuryService } from './treasury.service';
import { InvoicesController, EstimatesController, ExpensesController, TreasuryController } from './billing.controller';

@Module({
  providers: [InvoicesService, EstimatesService, ExpensesService, TreasuryService],
  controllers: [InvoicesController, EstimatesController, ExpensesController, TreasuryController],
})
export class BillingModule {}
