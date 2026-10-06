import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { type?: string; category?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.search) where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } },
    ];
    return this.prisma.libraryItem.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.libraryItem.findFirst({ where: { id, deletedAt: null }, include: { createdBy: { select: { firstName: true, lastName: true } } } });
    if (!item) throw new NotFoundException('Library item not found');
    await this.prisma.libraryItem.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
    return item;
  }

  async create(data: any, userId: string) {
    return this.prisma.libraryItem.create({
      data: {
        title: data.title, type: data.type || 'TEMPLATE', category: data.category, description: data.description,
        content: data.content, fileUrl: data.fileUrl, tags: data.tags || [], isPublic: data.isPublic ?? true, createdById: userId,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findExisting(id);
    return this.prisma.libraryItem.update({
      where: { id },
      data: { title: data.title, type: data.type, category: data.category, description: data.description, content: data.content, fileUrl: data.fileUrl, tags: data.tags, isPublic: data.isPublic },
    });
  }

  async remove(id: string) {
    await this.findExisting(id);
    return this.prisma.libraryItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async findExisting(id: string) {
    const item = await this.prisma.libraryItem.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }

  async categories() {
    const rows = await this.prisma.libraryItem.findMany({ where: { deletedAt: null }, select: { type: true } });
    const byType: Record<string, number> = {};
    for (const r of rows) byType[r.type] = (byType[r.type] || 0) + 1;
    return { total: rows.length, byType };
  }
}
