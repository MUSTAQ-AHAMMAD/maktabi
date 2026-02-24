import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private service;
    constructor(service: NotificationsService);
    getAll(user: any): Promise<{
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
    markRead(id: string): Promise<{
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
    markAllRead(user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
