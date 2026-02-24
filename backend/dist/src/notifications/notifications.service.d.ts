import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        entityType: string | null;
        entityId: string | null;
        userId: string;
        message: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        entityType: string | null;
        entityId: string | null;
        userId: string;
        message: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    create(data: {
        userId: string;
        title: string;
        message: string;
        type?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        entityType: string | null;
        entityId: string | null;
        userId: string;
        message: string;
        isRead: boolean;
    }>;
}
