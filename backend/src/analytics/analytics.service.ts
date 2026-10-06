import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 24 * 60 * 60 * 1000;
const num = (v: any): number => (v == null ? 0 : Number(v));

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /** Labels for the last `n` months as YYYY-MM, oldest → newest. */
  private monthKeys(n: number): string[] {
    const keys: string[] = [];
    const d = new Date();
    d.setDate(1);
    for (let i = n - 1; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      keys.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
    }
    return keys;
  }

  private monthLabel(key: string): string {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  private pctDelta(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  /** One comprehensive payload powering the Insights hub. */
  async getOverview() {
    const now = new Date();
    const notDeleted = { deletedAt: null };
    const last30 = new Date(now.getTime() - 30 * DAY);
    const prev30 = new Date(now.getTime() - 60 * DAY);

    const [
      cases, contracts, consultations, investigations, financials, payments, users,
    ] = await Promise.all([
      this.prisma.litigationCase.findMany({
        where: notDeleted,
        select: { id: true, status: true, riskLevel: true, financialExposure: true, brandId: true, assignedLawyerId: true, createdAt: true, closedAt: true, slaDeadline: true },
      }),
      this.prisma.contract.findMany({
        where: notDeleted,
        select: { id: true, status: true, value: true, brandId: true, endDate: true, createdAt: true },
      }),
      this.prisma.consultation.findMany({
        where: notDeleted,
        select: { id: true, status: true, createdAt: true, closedAt: true, slaDeadline: true, brandId: true },
      }),
      this.prisma.investigation.findMany({
        where: notDeleted,
        select: { id: true, status: true, severity: true, createdAt: true, closedAt: true, slaDeadline: true, brandId: true },
      }),
      this.prisma.financialExecution.findMany({
        where: notDeleted,
        select: { id: true, type: true, status: true, totalAmount: true, paidAmount: true, brandId: true, createdAt: true },
      }),
      this.prisma.payment.findMany({ select: { amount: true, paymentDate: true } }),
      this.prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true, role: true } }),
    ]);

    const brands = await this.prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, code: true, color: true } });
    const userById = new Map(users.map((u) => [u.id, u]));
    const brandById = new Map(brands.map((b) => [b.id, b]));

    // ── KPIs with period-over-period deltas ─────────────────────────────────
    const inWindow = (d: Date, start: Date, end: Date) => d >= start && d < end;
    const countWindow = <T extends { createdAt: Date }>(rows: T[], start: Date, end: Date) => rows.filter((r) => inWindow(r.createdAt, start, end)).length;

    const activeCase = (s: string) => ['ASSIGNED', 'IN_PROGRESS', 'HEARING', 'IN_REVIEW'].includes(s);
    const totalExposure = cases.reduce((a, c) => a + num(c.financialExposure), 0);
    const recovered = financials.reduce((a, f) => a + num(f.paidAmount), 0);
    const financialTotal = financials.reduce((a, f) => a + num(f.totalAmount), 0);

    const kpis = {
      activeCases: { value: cases.filter((c) => activeCase(c.status)).length, delta: this.pctDelta(countWindow(cases, last30, now), countWindow(cases, prev30, last30)) },
      openContracts: { value: contracts.filter((c) => c.status === 'ACTIVE').length, delta: this.pctDelta(countWindow(contracts, last30, now), countWindow(contracts, prev30, last30)) },
      pendingConsultations: { value: consultations.filter((c) => ['SUBMITTED', 'IN_REVIEW'].includes(c.status)).length, delta: this.pctDelta(countWindow(consultations, last30, now), countWindow(consultations, prev30, last30)) },
      openInvestigations: { value: investigations.filter((i) => !['CLOSED', 'ARCHIVED'].includes(i.status)).length, delta: this.pctDelta(countWindow(investigations, last30, now), countWindow(investigations, prev30, last30)) },
      totalExposure: { value: totalExposure, delta: 0 },
      recovered: { value: recovered, delta: this.pctDelta(payments.filter((p) => inWindow(p.paymentDate, last30, now)).reduce((a, p) => a + num(p.amount), 0), payments.filter((p) => inWindow(p.paymentDate, prev30, last30)).reduce((a, p) => a + num(p.amount), 0)) },
    };

    // ── 12-month caseflow: created vs closed ────────────────────────────────
    const keys = this.monthKeys(12);
    const monthIndex = new Map(keys.map((k, i) => [k, i]));
    const created = new Array(12).fill(0);
    const closed = new Array(12).fill(0);
    for (const c of cases) {
      const ck = c.createdAt.toISOString().slice(0, 7);
      if (monthIndex.has(ck)) created[monthIndex.get(ck)!]++;
      if (c.closedAt) {
        const clk = c.closedAt.toISOString().slice(0, 7);
        if (monthIndex.has(clk)) closed[monthIndex.get(clk)!]++;
      }
    }
    const caseflow = keys.map((k, i) => ({ month: this.monthLabel(k), created: created[i], closed: closed[i] }));

    // ── Cashflow (payments) by month ────────────────────────────────────────
    const cash = new Array(12).fill(0);
    for (const p of payments) {
      const pk = p.paymentDate.toISOString().slice(0, 7);
      if (monthIndex.has(pk)) cash[monthIndex.get(pk)!] += num(p.amount);
    }
    const cashflow = keys.map((k, i) => ({ month: this.monthLabel(k), collected: Math.round(cash[i]) }));

    // ── Distributions ───────────────────────────────────────────────────────
    const groupCount = <T>(rows: T[], key: (r: T) => string) => {
      const m: Record<string, number> = {};
      for (const r of rows) { const k = key(r); m[k] = (m[k] || 0) + 1; }
      return m;
    };
    const riskDistribution = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => ({ level, count: cases.filter((c) => c.riskLevel === level).length }));
    const caseStatus = Object.entries(groupCount(cases, (c) => c.status)).map(([status, count]) => ({ status, count }));
    const consultationStatus = Object.entries(groupCount(consultations, (c) => c.status)).map(([status, count]) => ({ status, count }));
    const investigationSeverity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((severity) => ({ severity, count: investigations.filter((i) => i.severity === severity).length }));

    // ── Contract renewal pipeline (buckets by days-to-expiry) ───────────────
    const buckets = { expired: 0, d0_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 };
    for (const c of contracts) {
      if (!c.endDate || c.status === 'TERMINATED') continue;
      const days = Math.ceil((c.endDate.getTime() - now.getTime()) / DAY);
      if (days < 0) buckets.expired++;
      else if (days <= 30) buckets.d0_30++;
      else if (days <= 60) buckets.d31_60++;
      else if (days <= 90) buckets.d61_90++;
      else buckets.d90_plus++;
    }
    const renewalPipeline = [
      { bucket: 'Expired', count: buckets.expired },
      { bucket: '0–30 days', count: buckets.d0_30 },
      { bucket: '31–60 days', count: buckets.d31_60 },
      { bucket: '61–90 days', count: buckets.d61_90 },
      { bucket: '90+ days', count: buckets.d90_plus },
    ];
    const contractStatus = Object.entries(groupCount(contracts, (c) => c.status)).map(([status, count]) => ({ status, count }));

    // ── Financial: recovery funnel + by type ────────────────────────────────
    const byType = ['AGAINST_COMPANY', 'IN_FAVOR_OF_COMPANY'].map((type) => {
      const rows = financials.filter((f) => f.type === type);
      return { type, total: rows.reduce((a, f) => a + num(f.totalAmount), 0), paid: rows.reduce((a, f) => a + num(f.paidAmount), 0) };
    });
    const financial = {
      total: financialTotal,
      recovered,
      outstanding: financialTotal - recovered,
      recoveryRate: financialTotal === 0 ? 0 : Math.round((recovered / financialTotal) * 1000) / 10,
      byType,
    };

    // ── Lawyer workload ─────────────────────────────────────────────────────
    const workloadMap = new Map<string, { active: number; closed: number; exposure: number }>();
    for (const c of cases) {
      if (!c.assignedLawyerId) continue;
      const w = workloadMap.get(c.assignedLawyerId) || { active: 0, closed: 0, exposure: 0 };
      if (['CLOSED', 'ARCHIVED', 'DECIDED'].includes(c.status)) w.closed++; else w.active++;
      w.exposure += num(c.financialExposure);
      workloadMap.set(c.assignedLawyerId, w);
    }
    const lawyerWorkload = [...workloadMap.entries()]
      .map(([id, w]) => {
        const u = userById.get(id);
        return { name: u ? `${u.firstName} ${u.lastName}` : 'Unassigned', active: w.active, closed: w.closed, exposure: Math.round(w.exposure) };
      })
      .sort((a, b) => b.active + b.closed - (a.active + a.closed))
      .slice(0, 8);

    // ── Brand comparison ────────────────────────────────────────────────────
    const brandComparison = brands.map((b) => {
      const bCases = cases.filter((c) => c.brandId === b.id);
      const bContracts = contracts.filter((c) => c.brandId === b.id);
      return {
        name: b.name, code: b.code, color: b.color,
        cases: bCases.length,
        contracts: bContracts.length,
        exposure: Math.round(bCases.reduce((a, c) => a + num(c.financialExposure), 0)),
        contractValue: Math.round(bContracts.reduce((a, c) => a + num(c.value), 0)),
      };
    }).sort((a, b) => b.exposure - a.exposure);

    // ── SLA compliance across entities ──────────────────────────────────────
    const sla = this.computeSla(cases, consultations, investigations, now);

    return {
      generatedAt: now.toISOString(),
      kpis,
      caseflow,
      cashflow,
      riskDistribution,
      caseStatus,
      consultationStatus,
      investigationSeverity,
      renewalPipeline,
      contractStatus,
      financial,
      lawyerWorkload,
      brandComparison,
      sla,
    };
  }

  private computeSla(
    cases: { status: string; closedAt: Date | null; slaDeadline: Date | null }[],
    consultations: { status: string; closedAt: Date | null; slaDeadline: Date | null }[],
    investigations: { status: string; closedAt: Date | null; slaDeadline: Date | null }[],
    now: Date,
  ) {
    const isClosed = (s: string) => ['CLOSED', 'ARCHIVED', 'DECIDED'].includes(s);
    const classify = (rows: { status: string; closedAt: Date | null; slaDeadline: Date | null }[]) => {
      let onTrack = 0, atRisk = 0, breached = 0, tracked = 0;
      for (const r of rows) {
        if (!r.slaDeadline) continue;
        tracked++;
        if (isClosed(r.status)) {
          if (r.closedAt && r.closedAt > r.slaDeadline) breached++; else onTrack++;
        } else if (r.slaDeadline < now) {
          breached++;
        } else if (r.slaDeadline.getTime() - now.getTime() <= 7 * DAY) {
          atRisk++;
        } else {
          onTrack++;
        }
      }
      return { tracked, onTrack, atRisk, breached, compliance: tracked === 0 ? 100 : Math.round(((onTrack + atRisk) / tracked) * 1000) / 10 };
    };
    const litigation = classify(cases);
    const consults = classify(consultations);
    const invest = classify(investigations);
    const totals = {
      tracked: litigation.tracked + consults.tracked + invest.tracked,
      onTrack: litigation.onTrack + consults.onTrack + invest.onTrack,
      atRisk: litigation.atRisk + consults.atRisk + invest.atRisk,
      breached: litigation.breached + consults.breached + invest.breached,
    };
    return {
      overall: { ...totals, compliance: totals.tracked === 0 ? 100 : Math.round(((totals.onTrack + totals.atRisk) / totals.tracked) * 1000) / 10 },
      byEntity: [
        { entity: 'Litigation', ...litigation },
        { entity: 'Consultations', ...consults },
        { entity: 'Investigations', ...invest },
      ],
    };
  }
}
