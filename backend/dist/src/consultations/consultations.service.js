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
exports.ConsultationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConsultationsService = class ConsultationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = { deletedAt: null };
        if (query.status)
            where.status = query.status;
        return this.prisma.consultation.findMany({
            where,
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const c = await this.prisma.consultation.findFirst({
            where: { id, deletedAt: null },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, documents: true },
        });
        if (!c)
            throw new common_1.NotFoundException('Consultation not found');
        return c;
    }
    async create(data, userId) {
        return this.prisma.consultation.create({ data: { ...data, createdById: userId, status: 'SUBMITTED' } });
    }
    async update(id, data) {
        return this.prisma.consultation.update({ where: { id }, data });
    }
    async updateStatus(id, status, userId, notes) {
        const c = await this.prisma.consultation.findFirst({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException();
        const updated = await this.prisma.consultation.update({ where: { id }, data: { status: status } });
        await this.prisma.workflowState.create({
            data: { entityType: 'CONSULTATION', entityId: id, fromStatus: c.status, toStatus: status, action: 'STATUS_CHANGE', performedById: userId, notes },
        });
        return updated;
    }
    async softDelete(id) {
        return this.prisma.consultation.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.ConsultationsService = ConsultationsService;
exports.ConsultationsService = ConsultationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsultationsService);
//# sourceMappingURL=consultations.service.js.map