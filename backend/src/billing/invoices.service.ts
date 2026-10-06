import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

const n = (v: any): number => (v == null ? 0 : Number(v));

function computeTotals(items: { quantity: any; unitPrice: any }[], taxRate: any) {
  const subtotal = items.reduce((a, it) => a + n(it.quantity) * n(it.unitPrice), 0);
  const taxAmount = Math.round(subtotal * (n(taxRate) / 100) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, taxAmount, total: Math.round((subtotal + taxAmount) * 100) / 100 };
}

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async nextNumber(prefix: string, table: 'invoice' | 'estimate') {
    const year = new Date().getFullYear();
    const count = await (this.prisma as any)[table].count();
    return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(filters: { status?: string; contactId?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.contactId) where.contactId = filters.contactId;
    if (filters.search) where.OR = [
      { number: { contains: filters.search, mode: 'insensitive' } },
      { contact: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
    return this.prisma.invoice.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { contact: { select: { id: true, name: true } }, _count: { select: { items: true, payments: true } } },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { contact: true, items: true, payments: { orderBy: { paymentDate: 'desc' } }, createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async create(data: any, userId: string) {
    const items = (data.items || []).map((it: any) => ({
      description: it.description, quantity: n(it.quantity) || 1, unitPrice: n(it.unitPrice),
      amount: Math.round((n(it.quantity) || 1) * n(it.unitPrice) * 100) / 100,
    }));
    const totals = computeTotals(items, data.taxRate ?? 15);
    const number = await this.nextNumber('INV', 'invoice');
    return this.prisma.invoice.create({
      data: {
        number, contactId: data.contactId, status: data.status || 'DRAFT',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        currency: data.currency || 'SAR', taxRate: n(data.taxRate ?? 15),
        ...totals, notes: data.notes, brandId: data.brandId, createdById: userId,
        items: { create: items },
      },
      include: { items: true, contact: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const items = (data.items || []).map((it: any) => ({
      description: it.description, quantity: n(it.quantity) || 1, unitPrice: n(it.unitPrice),
      amount: Math.round((n(it.quantity) || 1) * n(it.unitPrice) * 100) / 100,
    }));
    const totals = computeTotals(items, data.taxRate ?? 15);
    return this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      return tx.invoice.update({
        where: { id },
        data: {
          contactId: data.contactId, status: data.status,
          issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          taxRate: n(data.taxRate ?? 15), ...totals, notes: data.notes,
          items: { create: items },
        },
        include: { items: true, contact: { select: { id: true, name: true } } },
      });
    });
  }

  async addPayment(id: string, data: any) {
    const inv = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.invoicePayment.create({
        data: {
          invoiceId: id, amount: n(data.amount), paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          method: data.method || 'BANK_TRANSFER', reference: data.reference, notes: data.notes,
        },
      });
      const paidAmount = n(inv.paidAmount) + n(data.amount);
      const total = n(inv.total);
      const status = paidAmount >= total && total > 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : inv.status;
      return tx.invoice.update({ where: { id }, data: { paidAmount, status }, include: { payments: true } });
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.invoice.update({ where: { id }, data: { status: status as InvoiceStatus } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async summary() {
    const rows = await this.prisma.invoice.findMany({ where: { deletedAt: null }, select: { total: true, paidAmount: true, status: true, dueDate: true } });
    const now = new Date();
    let billed = 0, collected = 0, overdue = 0, outstanding = 0;
    for (const r of rows) {
      billed += n(r.total); collected += n(r.paidAmount);
      const bal = n(r.total) - n(r.paidAmount);
      outstanding += bal;
      if (bal > 0 && r.dueDate && r.dueDate < now && r.status !== 'PAID') overdue += bal;
    }
    return { billed, collected, outstanding, overdue, count: rows.length };
  }
}
