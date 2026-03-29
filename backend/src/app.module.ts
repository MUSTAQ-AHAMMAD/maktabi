import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LitigationModule } from './litigation/litigation.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { ContractsModule } from './contracts/contracts.module';
import { FinancialModule } from './financial/financial.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { BrandsModule } from './brands/brands.module';

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
    NotificationsModule,
    AuditModule,
    BrandsModule,
  ],
})
export class AppModule {}
