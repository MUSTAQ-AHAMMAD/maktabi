import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /** Conversations for the current user, with last message + unread count. */
  async conversations(userId: string) {
    const parts = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });
    const result = await Promise.all(parts.map(async (p) => {
      const conv = p.conversation;
      const others = conv.participants.filter((cp) => cp.userId !== userId).map((cp) => cp.user);
      const unread = await this.prisma.message.count({
        where: { conversationId: conv.id, senderId: { not: userId }, ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}) },
      });
      const last = conv.messages[0];
      return {
        id: conv.id,
        name: conv.name || others.map((o) => `${o.firstName} ${o.lastName}`).join(', ') || 'Conversation',
        isGroup: conv.isGroup,
        participants: others,
        lastMessage: last ? { body: last.body, createdAt: last.createdAt } : null,
        updatedAt: conv.updatedAt,
        unread,
      };
    }));
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const part = await this.prisma.conversationParticipant.findFirst({ where: { conversationId, userId } });
    if (!part) throw new ForbiddenException('Not a participant');
    return part;
  }

  async messages(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId }, orderBy: { createdAt: 'asc' }, take: 200,
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    });
    // mark read
    await this.prisma.conversationParticipant.updateMany({ where: { conversationId, userId }, data: { lastReadAt: new Date() } });
    return messages;
  }

  async send(conversationId: string, userId: string, body: string) {
    await this.assertParticipant(conversationId, userId);
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { conversationId, senderId: userId, body }, include: { sender: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
      this.prisma.conversationParticipant.updateMany({ where: { conversationId, userId }, data: { lastReadAt: new Date() } }),
    ]);
    return message;
  }

  /** Start (or reuse) a direct 1:1 conversation with another user. */
  async startDirect(userId: string, targetUserId: string, body?: string) {
    if (userId === targetUserId) throw new NotFoundException('Cannot message yourself');
    // find existing 1:1 conversation containing exactly these two
    const mine = await this.prisma.conversationParticipant.findMany({ where: { userId }, select: { conversationId: true } });
    const theirs = await this.prisma.conversationParticipant.findMany({ where: { userId: targetUserId, conversationId: { in: mine.map((m) => m.conversationId) } }, select: { conversationId: true } });
    for (const t of theirs) {
      const count = await this.prisma.conversationParticipant.count({ where: { conversationId: t.conversationId } });
      if (count === 2) {
        if (body) await this.send(t.conversationId, userId, body);
        return { id: t.conversationId };
      }
    }
    const conv = await this.prisma.conversation.create({
      data: { isGroup: false, participants: { create: [{ userId }, { userId: targetUserId }] } },
    });
    if (body) await this.send(conv.id, userId, body);
    return { id: conv.id };
  }

  async unreadTotal(userId: string) {
    const parts = await this.prisma.conversationParticipant.findMany({ where: { userId } });
    let total = 0;
    for (const p of parts) {
      total += await this.prisma.message.count({ where: { conversationId: p.conversationId, senderId: { not: userId }, ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}) } });
    }
    return { unread: total };
  }
}
