import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LitigationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.riskLevel) where.riskLevel = query.riskLevel;
    if (query.assignedLawyerId) where.assignedLawyerId = query.assignedLawyerId;
    return this.prisma.litigationCase.findMany({
      where,
      include: { assignedLawyer: { select: { id: true, firstName: true, lastName: true } }, hearings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.litigationCase.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignedLawyer: { select: { id: true, firstName: true, lastName: true } },
        hearings: { orderBy: { hearingDate: 'asc' } },
        documents: true,
      },
    });
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }

  async create(data: any, userId: string) {
    const caseNumber = `LIT-${Date.now()}`;
    const newCase = await this.prisma.litigationCase.create({
      data: { ...data, caseNumber, createdById: userId, status: 'DRAFT' },
    });
    await this.prisma.workflowState.create({
      data: { entityType: 'LITIGATION', entityId: newCase.id, toStatus: 'DRAFT', action: 'CREATE', performedById: userId },
    });
    return newCase;
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const c = await this.prisma.litigationCase.findFirst({ where: { id, deletedAt: null } });
    if (!c) throw new NotFoundException('Case not found');
    const updated = await this.prisma.litigationCase.update({ where: { id }, data: { status: status as any } });
    await this.prisma.workflowState.create({
      data: { entityType: 'LITIGATION', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
    });
    return updated;
  }

  async update(id: string, data: any) {
    return this.prisma.litigationCase.update({ where: { id }, data });
  }

  async addHearing(caseId: string, data: any) {
    return this.prisma.hearing.create({ data: { ...data, caseId } });
  }

  async softDelete(id: string) {
    return this.prisma.litigationCase.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
