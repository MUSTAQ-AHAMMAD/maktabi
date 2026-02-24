"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(_userId, _role) {
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
        const grouped = {};
        cases.forEach(c => {
            const month = c.createdAt.toISOString().substring(0, 7);
            grouped[month] = (grouped[month] || 0) + 1;
        });
        return Object.entries(grouped).map(([month, count]) => ({ month, count }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map