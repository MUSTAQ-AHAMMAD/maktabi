import { PrismaService } from '../prisma/prisma.service';
export declare class InvestigationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): Promise<({
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    })[]>;
    findOne(id: string): Promise<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        documents: {
            id: string;
            createdAt: Date;
            caseId: string | null;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            path: string;
            version: number;
            uploadedById: string;
            investigationId: string | null;
            consultationId: string | null;
            contractId: string | null;
            financialId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    }>;
    create(data: any, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    }>;
    updateStatus(id: string, status: string, userId: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.InvestigationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        severity: string;
        isConfidential: boolean;
        committeeMembers: string[];
        disciplinaryLog: string | null;
        appealNotes: string | null;
    }>;
}
