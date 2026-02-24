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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinancialService = class FinancialService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = { deletedAt: null };
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        return this.prisma.financialExecution.findMany({ where, include: { payments: true }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const f = await this.prisma.financialExecution.findFirst({ where: { id, deletedAt: null }, include: { payments: true, documents: true } });
        if (!f)
            throw new common_1.NotFoundException('Financial execution not found');
        return f;
    }
    async create(data) {
        return this.prisma.financialExecution.create({ data: { ...data, paidAmount: 0 } });
    }
    async addPayment(id, paymentData) {
        const f = await this.prisma.financialExecution.findFirst({ where: { id } });
        if (!f)
            throw new common_1.NotFoundException();
        const payment = await this.prisma.payment.create({ data: { ...paymentData, financialExecutionId: id } });
        const newPaid = Number(f.paidAmount) + Number(paymentData.amount);
        const newStatus = newPaid >= Number(f.totalAmount) ? 'COMPLETED' : 'PARTIAL';
        await this.prisma.financialExecution.update({ where: { id }, data: { paidAmount: newPaid, status: newStatus } });
        return payment;
    }
    async update(id, data) {
        return this.prisma.financialExecution.update({ where: { id }, data });
    }
    async softDelete(id) {
        return this.prisma.financialExecution.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map