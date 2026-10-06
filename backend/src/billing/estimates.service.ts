import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const n = (v: any): number => (v == null ? 0 : Number(v));
function computeTotals(items: { quantity: any; unitPrice: any }[], taxRate: any) {
  const subtotal = items.reduce((a, it) => a + n(it.quantity) * n(it.unitPrice), 0);
  const taxAmount = Math.round(subtotal * (n(taxRate) / 100) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, taxAmount, total: Math.round((subtotal + taxAmount) * 100) / 100 };
}

@Injectable()
export class EstimatesService {
  constructor(private prisma: PrismaService) {}

  private mapItems(items: any[] = []) {
    return items.map((it) => ({
      description: it.description, quantity: n(it.quantity) || 1, unitPrice: n(it.unitPrice),
      amount: Math.round((n(it.quantity) || 1) * n(it.unitPrice) * 100) / 100,
    }));
  }

  async findAll(filters: { status?: string; contactId?: string }) {
    const where: any = { deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.contactId) where.contactId = filters.contactId;
    return this.prisma.estimate.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { contact: { select: { id: true, name: true } }, _count: { select: { items: true } } },
    });
  }

  async findOne(id: string) {
    const est = await this.prisma.estimate.findFirst({ where: { id, deletedAt: null }, include: { contact: true, items: true } });
    if (!est) throw new NotFoundException('Estimate not found');
    return est;
  }

  async create(data: any, userId: string) {
    const items = this.mapItems(data.items);
    const totals = computeTotals(items, data.taxRate ?? 15);
    const year = new Date().getFullYear();
    const count = await this.prisma.estimate.count();
    const number = `EST-${year}-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.estimate.create({
      data: {
        number, contactId: data.contactId, status: data.status || 'DRAFT',
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        currency: data.currency || 'SAR', taxRate: n(data.taxRate ?? 15), ...totals,
        notes: data.notes, brandId: data.brandId, createdById: userId, items: { create: items },
      },
      include: { items: true, contact: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const items = this.mapItems(data.items);
    const totals = computeTotals(items, data.taxRate ?? 15);
    return this.prisma.$transaction(async (tx) => {
      await tx.estimateItem.deleteMany({ where: { estimateId: id } });
      return tx.estimate.update({
        where: { id },
        data: {
          contactId: data.contactId, status: data.status,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          taxRate: n(data.taxRate ?? 15), ...totals, notes: data.notes, items: { create: items },
        },
        include: { items: true },
      });
    });
  }

  async convertToInvoice(id: string, userId: string) {
    const est = await this.findOne(id);
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const number = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          number, contactId: est.contactId, status: 'DRAFT',
          dueDate: new Date(Date.now() + 30 * 86400000), currency: est.currency,
          taxRate: est.taxRate, subtotal: est.subtotal, taxAmount: est.taxAmount, total: est.total,
          notes: est.notes, brandId: est.brandId, createdById: userId,
          items: { create: est.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, amount: it.amount })) },
        },
      });
      await tx.estimate.update({ where: { id }, data: { status: 'CONVERTED', convertedInvoiceId: invoice.id } });
      return invoice;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.estimate.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
