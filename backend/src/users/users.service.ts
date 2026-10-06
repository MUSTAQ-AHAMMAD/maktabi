import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true, isActive: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hash },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async update(id: string, data: any) {
    const patch = { ...data };
    // Never store a plaintext password on the admin edit path.
    if (patch.password) patch.password = await bcrypt.hash(patch.password, 10);
    else delete patch.password;
    return this.prisma.user.update({
      where: { id },
      data: patch,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true, isActive: true },
    });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /** Self-service profile update (whitelisted fields only). */
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; department?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { firstName: data.firstName, lastName: data.lastName, department: data.department },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const ok = await bcrypt.compare(currentPassword || '', user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(newPassword, 10) } });
    return { ok: true };
  }
}
