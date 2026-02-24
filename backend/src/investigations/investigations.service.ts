import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestigationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    return this.prisma.investigation.findMany({
      where,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.investigation.findFirst({
      where: { id, deletedAt: null },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, documents: true },
    });
    if (!inv) throw new NotFoundException('Investigation not found');
    return inv;
  }

  async create(data: any, userId: string) {
    return this.prisma.investigation.create({ data: { ...data, createdById: userId, status: 'SUBMITTED' } });
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const inv = await this.prisma.investigation.findFirst({ where: { id } });
    if (!inv) throw new NotFoundException();
    const updated = await this.prisma.investigation.update({ where: { id }, data: { status: status as any } });
    await this.prisma.workflowState.create({
      data: { entityType: 'INVESTIGATION', entityId: id, fromStatus: inv.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
    });
    return updated;
  }

  async update(id: string, data: any) {
    return this.prisma.investigation.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.investigation.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
