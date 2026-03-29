import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.brandId) where.brandId = query.brandId;
    return this.prisma.financialExecution.findMany({ where, include: { payments: true, brand: { select: { id: true, name: true, code: true, color: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const f = await this.prisma.financialExecution.findFirst({ where: { id, deletedAt: null }, include: { payments: true, documents: true, brand: { select: { id: true, name: true, code: true, color: true } } } });
    if (!f) throw new NotFoundException('Financial execution not found');
    return f;
  }

  async create(data: any) {
    return this.prisma.financialExecution.create({ data: { ...data, paidAmount: 0 } });
  }

  async addPayment(id: string, paymentData: any) {
    const f = await this.prisma.financialExecution.findFirst({ where: { id } });
    if (!f) throw new NotFoundException();
    const payment = await this.prisma.payment.create({ data: { ...paymentData, financialExecutionId: id } });
    const newPaid = Number(f.paidAmount) + Number(paymentData.amount);
    const newStatus = newPaid >= Number(f.totalAmount) ? 'COMPLETED' : 'PARTIAL';
    await this.prisma.financialExecution.update({ where: { id }, data: { paidAmount: newPaid, status: newStatus as any } });
    return payment;
  }

  async update(id: string, data: any) {
    return this.prisma.financialExecution.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.financialExecution.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
