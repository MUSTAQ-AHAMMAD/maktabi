import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

// Map a friendly entityType to the Document model's polymorphic FK column.
const FK: Record<string, string> = {
  case: 'caseId', litigation: 'caseId',
  investigation: 'investigationId',
  consultation: 'consultationId',
  contract: 'contractId',
  financial: 'financialId',
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async list(entityType?: string, entityId?: string) {
    const where: any = {};
    if (entityType && entityId && FK[entityType]) where[FK[entityType]] = entityId;
    return this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(file: Express.Multer.File, meta: { entityType?: string; entityId?: string }, userId: string) {
    const data: any = {
      filename: file.filename, originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      mimeType: file.mimetype, size: file.size, path: file.path, uploadedById: userId,
    };
    if (meta.entityType && meta.entityId && FK[meta.entityType]) {
      // versioning: same entity + originalName → bump version
      const prior = await this.prisma.document.count({ where: { [FK[meta.entityType]]: meta.entityId, originalName: data.originalName } });
      data.version = prior + 1;
      data[FK[meta.entityType]] = meta.entityId;
    }
    return this.prisma.document.create({ data });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await this.prisma.document.delete({ where: { id } });
    fs.promises.unlink(doc.path).catch(() => { /* file may already be gone */ });
    return { ok: true };
  }
}
