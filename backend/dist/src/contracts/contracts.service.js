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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContractsService = class ContractsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = { deletedAt: null };
        if (query.status)
            where.status = query.status;
        return this.prisma.contract.findMany({
            where,
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const c = await this.prisma.contract.findFirst({
            where: { id, deletedAt: null },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, documents: true },
        });
        if (!c)
            throw new common_1.NotFoundException('Contract not found');
        return c;
    }
    async create(data, userId) {
        const contractNumber = `CNT-${Date.now()}`;
        return this.prisma.contract.create({ data: { ...data, contractNumber, createdById: userId, status: 'DRAFT' } });
    }
    async update(id, data) {
        return this.prisma.contract.update({ where: { id }, data });
    }
    async updateStatus(id, status, userId, notes) {
        const c = await this.prisma.contract.findFirst({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException();
        const updated = await this.prisma.contract.update({ where: { id }, data: { status: status } });
        await this.prisma.workflowState.create({
            data: { entityType: 'CONTRACT', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
        });
        return updated;
    }
    async getExpiringSoon(days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.prisma.contract.findMany({
            where: { endDate: { lte: futureDate }, status: 'ACTIVE', deletedAt: null },
            orderBy: { endDate: 'asc' },
        });
    }
    async softDelete(id) {
        return this.prisma.contract.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map