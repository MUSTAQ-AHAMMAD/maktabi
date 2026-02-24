import { PrismaService } from '../prisma/prisma.service';
export declare class FinancialService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): Promise<({
        payments: {
            id: string;
            createdAt: Date;
            currency: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date;
            reference: string | null;
            financialExecutionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        currency: string;
        status: import(".prisma/client").$Enums.FinancialExecutionStatus;
        title: string;
        type: import(".prisma/client").$Enums.FinancialExecutionType;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        caseId: string | null;
        notes: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        payments: {
            id: string;
            createdAt: Date;
            currency: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date;
            reference: string | null;
            financialExecutionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        currency: string;
        status: import(".prisma/client").$Enums.FinancialExecutionStatus;
        title: string;
        type: import(".prisma/client").$Enums.FinancialExecutionType;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        caseId: string | null;
        notes: string | null;
    }>;
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        currency: string;
        status: import(".prisma/client").$Enums.FinancialExecutionStatus;
        title: string;
        type: import(".prisma/client").$Enums.FinancialExecutionType;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        caseId: string | null;
        notes: string | null;
    }>;
    addPayment(id: string, paymentData: any): Promise<{
        id: string;
        createdAt: Date;
        currency: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentDate: Date;
        reference: string | null;
        financialExecutionId: string;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        currency: string;
        status: import(".prisma/client").$Enums.FinancialExecutionStatus;
        title: string;
        type: import(".prisma/client").$Enums.FinancialExecutionType;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        caseId: string | null;
        notes: string | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        currency: string;
        status: import(".prisma/client").$Enums.FinancialExecutionStatus;
        title: string;
        type: import(".prisma/client").$Enums.FinancialExecutionType;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        caseId: string | null;
        notes: string | null;
    }>;
}
