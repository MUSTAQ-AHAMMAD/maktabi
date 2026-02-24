import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    return this.prisma.contract.findMany({
      where,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.contract.findFirst({
      where: { id, deletedAt: null },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, documents: true },
    });
    if (!c) throw new NotFoundException('Contract not found');
    return c;
  }

  async create(data: any, userId: string) {
    const contractNumber = `CNT-${Date.now()}`;
    return this.prisma.contract.create({ data: { ...data, contractNumber, createdById: userId, status: 'DRAFT' } });
  }

  async update(id: string, data: any) {
    return this.prisma.contract.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const c = await this.prisma.contract.findFirst({ where: { id } });
    if (!c) throw new NotFoundException();
    const updated = await this.prisma.contract.update({ where: { id }, data: { status: status as any } });
    await this.prisma.workflowState.create({
      data: { entityType: 'CONTRACT', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
    });
    return updated;
  }

  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.prisma.contract.findMany({
      where: { endDate: { lte: futureDate }, status: 'ACTIVE', deletedAt: null },
      orderBy: { endDate: 'asc' },
    });
  }

  async softDelete(id: string) {
    return this.prisma.contract.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
