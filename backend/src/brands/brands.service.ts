import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.brand.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(data: { name: string; code: string; description?: string; color?: string }) {
    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ name: data.name }, { code: data.code }] },
    });
    if (existing) throw new ConflictException('Brand with this name or code already exists');
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: { name?: string; code?: string; description?: string; color?: string; isActive?: boolean }) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return this.prisma.brand.update({ where: { id }, data });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return this.prisma.brand.update({ where: { id }, data: { isActive: false } });
  }
}
