import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const n = (v: any): number => (v == null ? 0 : Number(v));

@Injectable()
export class TreasuryService {
  constructor(private prisma: PrismaService) {}

  async accounts() {
    const accounts = await this.prisma.treasuryAccount.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { transactions: true } } },
    });
    const totalBalance = accounts.reduce((a, acc) => a + n(acc.balance), 0);
    return { accounts, totalBalance };
  }

  async createAccount(data: any) {
    return this.prisma.treasuryAccount.create({
      data: { name: data.name, type: data.type || 'BANK', currency: data.currency || 'SAR', balance: n(data.balance) || 0 },
    });
  }

  async transactions(accountId?: string) {
    return this.prisma.treasuryTransaction.findMany({
      where: accountId ? { accountId } : {},
      orderBy: { date: 'desc' }, take: 100,
      include: { account: { select: { id: true, name: true, currency: true } } },
    });
  }

  async addTransaction(data: any) {
    const account = await this.prisma.treasuryAccount.findUnique({ where: { id: data.accountId } });
    if (!account) throw new NotFoundException('Account not found');
    const delta = data.type === 'CREDIT' ? n(data.amount) : -n(data.amount);
    return this.prisma.$transaction(async (tx) => {
      const txn = await tx.treasuryTransaction.create({
        data: {
          accountId: data.accountId, type: data.type, amount: n(data.amount),
          description: data.description, reference: data.reference,
          date: data.date ? new Date(data.date) : new Date(),
        },
      });
      await tx.treasuryAccount.update({ where: { id: data.accountId }, data: { balance: n(account.balance) + delta } });
      return txn;
    });
  }
}
