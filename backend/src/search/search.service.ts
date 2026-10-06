import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Hit { type: string; id: string; label: string; sublabel: string; href: string; }

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string): Promise<{ results: Hit[]; total: number }> {
    const query = (q || '').trim();
    if (query.length < 2) return { results: [], total: 0 };
    const c = { contains: query, mode: 'insensitive' as const };
    const take = 5;
    const nd = { deletedAt: null };

    const [contacts, cases, contracts, invoices, tasks, consultations, investigations, library, poa] = await Promise.all([
      this.prisma.contact.findMany({ where: { ...nd, OR: [{ name: c }, { company: c }, { email: c }] }, take, select: { id: true, name: true, company: true, type: true } }),
      this.prisma.litigationCase.findMany({ where: { ...nd, OR: [{ caseNumber: c }, { parties: c }, { caseType: c }] }, take, select: { id: true, caseNumber: true, caseType: true, parties: true } }),
      this.prisma.contract.findMany({ where: { ...nd, OR: [{ contractNumber: c }, { title: c }, { counterparty: c }] }, take, select: { id: true, contractNumber: true, title: true } }),
      this.prisma.invoice.findMany({ where: { ...nd, OR: [{ number: c }, { contact: { name: c } }] }, take, select: { id: true, number: true, contact: { select: { name: true } } } }),
      this.prisma.task.findMany({ where: { ...nd, title: c }, take, select: { id: true, title: true, status: true } }),
      this.prisma.consultation.findMany({ where: { ...nd, title: c }, take, select: { id: true, title: true } }),
      this.prisma.investigation.findMany({ where: { ...nd, title: c }, take, select: { id: true, title: true } }),
      this.prisma.libraryItem.findMany({ where: { ...nd, OR: [{ title: c }, { tags: { has: query } }] }, take, select: { id: true, title: true, type: true } }),
      this.prisma.powerOfAttorney.findMany({ where: { ...nd, OR: [{ number: c }, { grantor: c }, { grantee: c }] }, take, select: { id: true, number: true, grantor: true } }),
    ]);

    const results: Hit[] = [
      ...contacts.map((r) => ({ type: 'contact', id: r.id, label: r.name, sublabel: r.company || r.type, href: `/contacts/${r.id}` })),
      ...cases.map((r) => ({ type: 'litigation', id: r.id, label: r.caseNumber, sublabel: `${r.caseType} · ${r.parties}`, href: `/litigation/${r.id}` })),
      ...contracts.map((r) => ({ type: 'contract', id: r.id, label: r.title, sublabel: r.contractNumber, href: `/contracts/${r.id}` })),
      ...invoices.map((r) => ({ type: 'invoice', id: r.id, label: r.number, sublabel: r.contact?.name || '', href: `/invoices` })),
      ...tasks.map((r) => ({ type: 'task', id: r.id, label: r.title, sublabel: r.status, href: `/tasks` })),
      ...consultations.map((r) => ({ type: 'consultation', id: r.id, label: r.title, sublabel: '', href: `/consultations/${r.id}` })),
      ...investigations.map((r) => ({ type: 'investigation', id: r.id, label: r.title, sublabel: '', href: `/investigations/${r.id}` })),
      ...library.map((r) => ({ type: 'library', id: r.id, label: r.title, sublabel: r.type, href: `/library` })),
      ...poa.map((r) => ({ type: 'poa', id: r.id, label: r.number, sublabel: r.grantor, href: `/poa` })),
    ];
    return { results, total: results.length };
  }
}
