import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LitigationService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.riskLevel) where.riskLevel = query.riskLevel;
    if (query.assignedLawyerId) where.assignedLawyerId = query.assignedLawyerId;
    if (query.brandId) where.brandId = query.brandId;
    return this.prisma.litigationCase.findMany({
      where,
      include: { assignedLawyer: { select: { id: true, firstName: true, lastName: true } }, hearings: true, brand: { select: { id: true, name: true, code: true, color: true } } },
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
        brand: { select: { id: true, name: true, code: true, color: true } },
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
    this.notifications.notifyNewCase({ id: newCase.id, caseNumber: newCase.caseNumber }, userId).catch(() => {});
    return newCase;
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const c = await this.prisma.litigationCase.findFirst({ where: { id, deletedAt: null } });
    if (!c) throw new NotFoundException('Case not found');
    const updated = await this.prisma.litigationCase.update({ where: { id }, data: { status: status as any } });
    await this.prisma.workflowState.create({
      data: { entityType: 'LITIGATION', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
    });
    this.notifications.notifyStatusChange('LITIGATION', id, c.caseNumber, status, userId).catch(() => {});
    return updated;
  }

  async update(id: string, data: any) {
    return this.prisma.litigationCase.update({ where: { id }, data });
  }

  async addHearing(caseId: string, data: any) {
    const caseData = await this.prisma.litigationCase.findFirst({ where: { id: caseId }, select: { caseNumber: true, assignedLawyerId: true } });
    const hearing = await this.prisma.hearing.create({ data: { ...data, caseId } });
    if (caseData) {
      this.notifications.notifyHearingScheduled(caseData.caseNumber, data.hearingDate, caseData.assignedLawyerId || undefined).catch(() => {});
    }
    return hearing;
  }

  async softDelete(id: string) {
    return this.prisma.litigationCase.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
