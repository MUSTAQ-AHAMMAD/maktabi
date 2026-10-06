import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 86400000;
const ANNUAL_ENTITLEMENT = 21;

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    user: { select: { id: true, firstName: true, lastName: true, department: true } },
    approver: { select: { firstName: true, lastName: true } },
  };

  async findAll(filters: { status?: string; mine?: string }, currentUserId: string, role: string) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    // Employees see only their own; managers/HR/admin see all unless "mine"
    const canSeeAll = ['ADMIN', 'HR', 'LEGAL_MANAGER', 'CEO', 'DEPARTMENT_MANAGER'].includes(role);
    if (filters.mine === 'true' || !canSeeAll) where.userId = currentUserId;
    return this.prisma.leave.findMany({ where, orderBy: { createdAt: 'desc' }, include: this.userSelect });
  }

  async create(data: any, userId: string) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1);
    return this.prisma.leave.create({
      data: { userId, type: data.type || 'ANNUAL', startDate: start, endDate: end, days, reason: data.reason, status: 'PENDING' },
      include: this.userSelect,
    });
  }

  async decide(id: string, status: 'APPROVED' | 'REJECTED', approverId: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    return this.prisma.leave.update({ where: { id }, data: { status, approverId, decidedAt: new Date() }, include: this.userSelect });
  }

  async cancel(id: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    return this.prisma.leave.update({ where: { id }, data: { status: 'CANCELLED' }, include: this.userSelect });
  }

  async balance(userId: string) {
    const year = new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const leaves = await this.prisma.leave.findMany({ where: { userId, status: 'APPROVED', startDate: { gte: yearStart } }, select: { type: true, days: true } });
    const usedAnnual = leaves.filter((l) => l.type === 'ANNUAL').reduce((a, l) => a + l.days, 0);
    const usedSick = leaves.filter((l) => l.type === 'SICK').reduce((a, l) => a + l.days, 0);
    const pending = await this.prisma.leave.count({ where: { userId, status: 'PENDING' } });
    return { entitlement: ANNUAL_ENTITLEMENT, usedAnnual, remaining: ANNUAL_ENTITLEMENT - usedAnnual, usedSick, pending };
  }

  async summary() {
    const byStatus = await this.prisma.leave.groupBy({ by: ['status'], _count: true });
    const pending = await this.prisma.leave.count({ where: { status: 'PENDING' } });
    return { byStatus, pending };
  }
}
