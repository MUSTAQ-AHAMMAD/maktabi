import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const n = (v: any): number => (v == null ? 0 : Number(v));

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { category?: string; brandId?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters.category) where.category = filters.category;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.search) where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { vendor: { contains: filters.search, mode: 'insensitive' } },
    ];
    return this.prisma.expense.findMany({
      where, orderBy: { date: 'desc' },
      include: { contact: { select: { id: true, name: true } } },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.expense.create({
      data: {
        title: data.title, category: data.category || 'OTHER', amount: n(data.amount),
        currency: data.currency || 'SAR', date: data.date ? new Date(data.date) : new Date(),
        vendor: data.vendor, contactId: data.contactId || null, notes: data.notes,
        relatedType: data.relatedType, relatedId: data.relatedId, brandId: data.brandId, createdById: userId,
      },
    });
  }

  async update(id: string, data: any) {
    const exp = await this.prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new NotFoundException('Expense not found');
    return this.prisma.expense.update({
      where: { id },
      data: {
        title: data.title, category: data.category, amount: data.amount != null ? n(data.amount) : undefined,
        date: data.date ? new Date(data.date) : undefined, vendor: data.vendor, notes: data.notes, contactId: data.contactId || null,
      },
    });
  }

  async remove(id: string) {
    const exp = await this.prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new NotFoundException('Expense not found');
    return this.prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async summary() {
    const rows = await this.prisma.expense.findMany({ where: { deletedAt: null }, select: { amount: true, category: true, date: true } });
    const total = rows.reduce((a, r) => a + n(r.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const r of rows) byCategory[r.category] = (byCategory[r.category] || 0) + n(r.amount);
    // this-month total
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = rows.filter((r) => r.date >= monthStart).reduce((a, r) => a + n(r.amount), 0);
    return {
      total, thisMonth, count: rows.length,
      byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    };
  }
}
