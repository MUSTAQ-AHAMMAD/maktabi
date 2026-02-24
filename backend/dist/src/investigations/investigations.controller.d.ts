import { InvestigationsService } from './investigations.service';
export declare class InvestigationsController {
    private service;
    constructor(service: InvestigationsService);
    findAll(query: any): Promise<({
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
    create(body: any, user: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
    updateStatus(id: string, body: any, user: any): Promise<{
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
    remove(id: string): Promise<{
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
