import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  brandId?: string;
  search?: string;
  mine?: string;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private assigneeSelect = { assignee: { select: { id: true, firstName: true, lastName: true } }, contact: { select: { id: true, name: true } } };

  async findAll(filters: TaskFilters, currentUserId: string) {
    const where: any = { deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.mine === 'true') where.assigneeId = currentUserId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
      include: this.assigneeSelect,
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, deletedAt: null }, include: this.assigneeSelect });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(data: any, userId: string) {
    const { dueDate, ...rest } = data;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: userId,
        completedAt: rest.status === 'DONE' ? new Date() : null,
      },
      include: this.assigneeSelect,
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { dueDate, ...rest } = data;
    const patch: any = { ...rest };
    if (dueDate !== undefined) patch.dueDate = dueDate ? new Date(dueDate) : null;
    if (rest.status) patch.completedAt = rest.status === 'DONE' ? new Date() : null;
    return this.prisma.task.update({ where: { id }, data: patch, include: this.assigneeSelect });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: { status: status as TaskStatus, completedAt: status === 'DONE' ? new Date() : null },
      include: this.assigneeSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  /** KPI summary for badges/widgets. */
  async summary(currentUserId: string) {
    const [byStatus, overdue, mine] = await Promise.all([
      this.prisma.task.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      this.prisma.task.count({ where: { deletedAt: null, dueDate: { lt: new Date() }, status: { notIn: ['DONE', 'CANCELLED'] } } }),
      this.prisma.task.count({ where: { deletedAt: null, assigneeId: currentUserId, status: { notIn: ['DONE', 'CANCELLED'] } } }),
    ]);
    return { byStatus, overdue, mine };
  }
}
