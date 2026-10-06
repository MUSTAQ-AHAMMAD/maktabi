import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ContactFilters {
  type?: string;
  isActive?: string;
  brandId?: string;
  search?: string;
}

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ContactFilters = {}) {
    const where: any = { deletedAt: null };
    if (filters.type) where.type = filters.type;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.isActive === 'true') where.isActive = true;
    if (filters.isActive === 'false') where.isActive = false;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true, invoices: true, estimates: true, powersOfAttorney: true } } },
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        tasks: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10 },
        estimates: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10 },
        powersOfAttorney: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(data: any, userId: string) {
    return this.prisma.contact.create({ data: { ...data, createdById: userId } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  /** Lightweight list for pickers (id + name + type). */
  async options() {
    return this.prisma.contact.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, type: true, company: true },
      orderBy: { name: 'asc' },
    });
  }
}
