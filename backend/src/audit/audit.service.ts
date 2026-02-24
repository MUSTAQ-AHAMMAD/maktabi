import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(query: any = {}) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.entityType) where.entityType = query.entityType;
    return this.prisma.auditLog.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async log(data: { userId: string; action: string; entityType: string; entityId?: string; oldValues?: any; newValues?: any; ipAddress?: string }) {
    return this.prisma.auditLog.create({ data });
  }
}
