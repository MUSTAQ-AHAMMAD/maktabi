import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/audit.interceptor';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LitigationModule } from './litigation/litigation.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { ContractsModule } from './contracts/contracts.module';
import { FinancialModule } from './financial/financial.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { BrandsModule } from './brands/brands.module';
import { ContactsModule } from './contacts/contacts.module';
import { TasksModule } from './tasks/tasks.module';
import { BillingModule } from './billing/billing.module';
import { PoaModule } from './poa/poa.module';
import { LibraryModule } from './library/library.module';
import { LeavesModule } from './leaves/leaves.module';
import { MessagesModule } from './messages/messages.module';
import { SearchModule } from './search/search.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    LitigationModule,
    InvestigationsModule,
    ConsultationsModule,
    ContractsModule,
    FinancialModule,
    DashboardModule,
    AnalyticsModule,
    NotificationsModule,
    AuditModule,
    BrandsModule,
    ContactsModule,
    TasksModule,
    BillingModule,
    PoaModule,
    LibraryModule,
    LeavesModule,
    MessagesModule,
    SearchModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AppModule {}
