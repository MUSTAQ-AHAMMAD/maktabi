import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private service;
    constructor(service: DashboardService);
    getStats(user: any): Promise<{
        kpis: {
            totalCases: number;
            activeCases: number;
            totalContracts: number;
            expiringContracts: number;
            pendingConsultations: number;
        };
        financial: {
            total: import("@prisma/client/runtime/library").Decimal;
            paid: import("@prisma/client/runtime/library").Decimal;
        };
        riskBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LitigationCaseGroupByOutputType, "riskLevel"[]> & {
            _count: number;
        })[];
        recentCases: ({
            assignedLawyer: {
                firstName: string;
                lastName: string;
            };
        } & {
            description: string;
            id: string;
            caseNumber: string;
            caseType: string;
            courtName: string;
            parties: string;
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            financialExposure: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            status: import(".prisma/client").$Enums.CaseStatus;
            assignedLawyerId: string | null;
            createdById: string;
            slaDeadline: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
    }>;
    getCasesTimeline(): Promise<{
        month: string;
        count: number;
    }[]>;
}
