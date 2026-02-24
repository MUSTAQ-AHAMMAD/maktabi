import { ConsultationsService } from './consultations.service';
export declare class ConsultationsController {
    private service;
    constructor(service: ConsultationsService);
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
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
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
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
    }>;
    create(body: any, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
    }>;
    updateStatus(id: string, body: any, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        createdById: string;
        slaDeadline: Date | null;
        closedAt: Date | null;
        title: string;
        tags: string[];
        legalOpinion: string | null;
        templateId: string | null;
        feedback: string | null;
    }>;
}
