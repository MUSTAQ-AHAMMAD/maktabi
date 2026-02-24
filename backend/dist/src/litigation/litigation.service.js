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
exports.LitigationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LitigationService = class LitigationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = { deletedAt: null };
        if (query.status)
            where.status = query.status;
        if (query.riskLevel)
            where.riskLevel = query.riskLevel;
        if (query.assignedLawyerId)
            where.assignedLawyerId = query.assignedLawyerId;
        return this.prisma.litigationCase.findMany({
            where,
            include: { assignedLawyer: { select: { id: true, firstName: true, lastName: true } }, hearings: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const c = await this.prisma.litigationCase.findFirst({
            where: { id, deletedAt: null },
            include: {
                assignedLawyer: { select: { id: true, firstName: true, lastName: true } },
                hearings: { orderBy: { hearingDate: 'asc' } },
                documents: true,
            },
        });
        if (!c)
            throw new common_1.NotFoundException('Case not found');
        return c;
    }
    async create(data, userId) {
        const caseNumber = `LIT-${Date.now()}`;
        const newCase = await this.prisma.litigationCase.create({
            data: { ...data, caseNumber, createdById: userId, status: 'DRAFT' },
        });
        await this.prisma.workflowState.create({
            data: { entityType: 'LITIGATION', entityId: newCase.id, toStatus: 'DRAFT', action: 'CREATE', performedById: userId },
        });
        return newCase;
    }
    async updateStatus(id, status, userId, notes) {
        const c = await this.prisma.litigationCase.findFirst({ where: { id, deletedAt: null } });
        if (!c)
            throw new common_1.NotFoundException('Case not found');
        const updated = await this.prisma.litigationCase.update({ where: { id }, data: { status: status } });
        await this.prisma.workflowState.create({
            data: { entityType: 'LITIGATION', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
        });
        return updated;
    }
    async update(id, data) {
        return this.prisma.litigationCase.update({ where: { id }, data });
    }
    async addHearing(caseId, data) {
        return this.prisma.hearing.create({ data: { ...data, caseId } });
    }
    async softDelete(id) {
        return this.prisma.litigationCase.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.LitigationService = LitigationService;
exports.LitigationService = LitigationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LitigationService);
//# sourceMappingURL=litigation.service.js.map