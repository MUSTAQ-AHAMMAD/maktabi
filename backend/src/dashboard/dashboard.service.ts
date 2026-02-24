import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // userId and role reserved for future role-based filtering
  async getStats(_userId: string, _role: string) {
    const [totalCases, activeCases, totalContracts, expiringContracts, pendingConsultations, totalFinancial] = await Promise.all([
      this.prisma.litigationCase.count({ where: { deletedAt: null } }),
      this.prisma.litigationCase.count({ where: { status: { in: ['IN_PROGRESS', 'HEARING'] }, deletedAt: null } }),
      this.prisma.contract.count({ where: { deletedAt: null } }),
      this.prisma.contract.count({
        where: { endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, status: 'ACTIVE', deletedAt: null },
      }),
      this.prisma.consultation.count({ where: { status: 'SUBMITTED', deletedAt: null } }),
      this.prisma.financialExecution.aggregate({ where: { deletedAt: null }, _sum: { totalAmount: true, paidAmount: true } }),
    ]);

    const riskBreakdown = await this.prisma.litigationCase.groupBy({
      by: ['riskLevel'],
      where: { deletedAt: null },
      _count: true,
    });

    const recentCases = await this.prisma.litigationCase.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { assignedLawyer: { select: { firstName: true, lastName: true } } },
    });

    return {
      kpis: { totalCases, activeCases, totalContracts, expiringContracts, pendingConsultations },
      financial: { total: totalFinancial._sum.totalAmount, paid: totalFinancial._sum.paidAmount },
      riskBreakdown,
      recentCases,
    };
  }

  async getCasesTimeline() {
    const cases = await this.prisma.litigationCase.findMany({
      where: { deletedAt: null },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    cases.forEach(c => {
      const month = c.createdAt.toISOString().substring(0, 7);
      grouped[month] = (grouped[month] || 0) + 1;
    });

    return Object.entries(grouped).map(([month, count]) => ({ month, count }));
  }
}
