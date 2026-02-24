import { AuditService } from './audit.service';
export declare class AuditController {
    private service;
    constructor(service: AuditService);
    getLogs(query: any): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string | null;
        action: string;
        userId: string;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
