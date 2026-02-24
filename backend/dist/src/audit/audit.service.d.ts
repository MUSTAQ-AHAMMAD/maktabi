import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getLogs(query?: any): Promise<({
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
    log(data: {
        userId: string;
        action: string;
        entityType: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
    }): Promise<{
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
    }>;
}
