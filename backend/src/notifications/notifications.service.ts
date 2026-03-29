import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async create(data: { userId: string; title: string; message: string; type?: string; entityType?: string; entityId?: string }) {
    return this.prisma.notification.create({ data });
  }

  async notifyNewCase(caseData: { id: string; caseNumber: string }, createdById: string) {
    const managers = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'LEGAL_MANAGER', 'CEO'] }, isActive: true, id: { not: createdById } },
      select: { id: true },
    });
    for (const mgr of managers) {
      await this.create({
        userId: mgr.id,
        title: 'New Litigation Case',
        message: `Case ${caseData.caseNumber} has been created.`,
        type: 'INFO',
        entityType: 'LITIGATION',
        entityId: caseData.id,
      });
    }
  }

  async notifyStatusChange(entityType: string, entityId: string, entityLabel: string, newStatus: string, changedById: string) {
    const managers = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'LEGAL_MANAGER', 'CEO'] }, isActive: true, id: { not: changedById } },
      select: { id: true },
    });
    for (const mgr of managers) {
      await this.create({
        userId: mgr.id,
        title: `${entityType} Status Updated`,
        message: `${entityLabel} status changed to ${newStatus.replace(/_/g, ' ')}.`,
        type: 'INFO',
        entityType,
        entityId,
      });
    }
  }

  async notifyHearingScheduled(caseNumber: string, hearingDate: string, assignedLawyerId?: string) {
    const targets = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['ADMIN', 'LEGAL_MANAGER'] }, isActive: true },
          ...(assignedLawyerId ? [{ id: assignedLawyerId }] : []),
        ],
      },
      select: { id: true },
    });
    const uniqueIds = [...new Set(targets.map(t => t.id))];
    for (const userId of uniqueIds) {
      await this.create({
        userId,
        title: 'Hearing Scheduled',
        message: `A hearing for case ${caseNumber} is scheduled for ${new Date(hearingDate).toLocaleDateString()}.`,
        type: 'WARNING',
        entityType: 'HEARING',
      });
    }
  }

  async notifyContractExpiring(contractTitle: string, contractId: string, daysLeft: number) {
    const targets = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'LEGAL_MANAGER', 'CEO'] }, isActive: true },
      select: { id: true },
    });
    for (const t of targets) {
      await this.create({
        userId: t.id,
        title: 'Contract Expiring Soon',
        message: `Contract "${contractTitle}" expires in ${daysLeft} days.`,
        type: 'WARNING',
        entityType: 'CONTRACT',
        entityId: contractId,
      });
    }
  }
}
