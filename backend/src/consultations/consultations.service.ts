import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    return this.prisma.consultation.findMany({
      where,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.consultation.findFirst({
      where: { id, deletedAt: null },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, documents: true },
    });
    if (!c) throw new NotFoundException('Consultation not found');
    return c;
  }

  async create(data: any, userId: string) {
    return this.prisma.consultation.create({ data: { ...data, createdById: userId, status: 'SUBMITTED' } });
  }

  async update(id: string, data: any) {
    return this.prisma.consultation.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, userId: string, notes?: string) {
    const c = await this.prisma.consultation.findFirst({ where: { id } });
    if (!c) throw new NotFoundException();
    const updated = await this.prisma.consultation.update({ where: { id }, data: { status: status as any } });
    await this.prisma.workflowState.create({
      data: { entityType: 'CONSULTATION', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
    });
    return updated;
  }

  async softDelete(id: string) {
    return this.prisma.consultation.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
