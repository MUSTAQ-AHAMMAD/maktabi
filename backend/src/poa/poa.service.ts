import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 86400000;

@Injectable()
export class PoaService {
  constructor(private prisma: PrismaService) {}

  /** Derive display status from stored status + expiry. */
  private decorate<T extends { status: string; expiryDate: Date | null }>(row: T) {
    let effectiveStatus = row.status;
    if (row.status !== 'REVOKED' && row.expiryDate) {
      const diff = row.expiryDate.getTime() - Date.now();
      if (diff < 0) effectiveStatus = 'EXPIRED';
      else if (diff <= 30 * DAY) effectiveStatus = 'EXPIRING';
      else effectiveStatus = 'ACTIVE';
    }
    return { ...row, effectiveStatus };
  }

  async findAll(filters: { status?: string; contactId?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters.contactId) where.contactId = filters.contactId;
    if (filters.search) where.OR = [
      { number: { contains: filters.search, mode: 'insensitive' } },
      { grantor: { contains: filters.search, mode: 'insensitive' } },
      { grantee: { contains: filters.search, mode: 'insensitive' } },
    ];
    const rows = await this.prisma.powerOfAttorney.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { contact: { select: { id: true, name: true } } },
    });
    const decorated = rows.map((r) => this.decorate(r));
    return filters.status ? decorated.filter((r) => r.effectiveStatus === filters.status) : decorated;
  }

  async findOne(id: string) {
    const poa = await this.prisma.powerOfAttorney.findFirst({ where: { id, deletedAt: null }, include: { contact: true } });
    if (!poa) throw new NotFoundException('Power of attorney not found');
    return this.decorate(poa);
  }

  async create(data: any, userId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.powerOfAttorney.count();
    const number = `POA-${year}-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.powerOfAttorney.create({
      data: {
        number, contactId: data.contactId, grantor: data.grantor, grantee: data.grantee, scope: data.scope,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.status || 'ACTIVE', notaryRef: data.notaryRef, notes: data.notes,
        brandId: data.brandId, createdById: userId,
      },
      include: { contact: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.powerOfAttorney.update({
      where: { id },
      data: {
        contactId: data.contactId, grantor: data.grantor, grantee: data.grantee, scope: data.scope,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.status, notaryRef: data.notaryRef, notes: data.notes,
      },
      include: { contact: { select: { id: true, name: true } } },
    });
  }

  async revoke(id: string) {
    await this.findOne(id);
    return this.prisma.powerOfAttorney.update({ where: { id }, data: { status: 'REVOKED' } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.powerOfAttorney.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async summary() {
    const rows = await this.prisma.powerOfAttorney.findMany({ where: { deletedAt: null }, select: { status: true, expiryDate: true } });
    const counts = { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0, REVOKED: 0 };
    for (const r of rows) counts[this.decorate(r as any).effectiveStatus as keyof typeof counts]++;
    return { total: rows.length, ...counts };
  }
}
