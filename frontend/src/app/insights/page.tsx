'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { KpiCard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Scale, Briefcase, FileText, Search, DollarSign, TrendingUp, RefreshCw,
  Download, Printer, AlertTriangle, ShieldCheck, Gauge, Users, Layers, Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ComposedChart,
} from 'recharts';
import api from '@/lib/api';

// ── palette ────────────────────────────────────────────────────────────────
const C = {
  blue: '#3b82f6', indigo: '#6366f1', purple: '#8b5cf6', teal: '#14b8a6',
  green: '#22c55e', amber: '#f59e0b', red: '#ef4444', rose: '#ec4899', slate: '#94a3b8',
};
const RISK = { LOW: C.green, MEDIUM: C.amber, HIGH: C.red, CRITICAL: '#991b1b' } as Record<string, string>;
const SEVERITY = RISK;

// ── formatters ─────────────────────────────────────────────────────────────
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const sar = (v: number) => `SAR ${compact.format(v || 0)}`;
const sarFull = (v: number) => `SAR ${(v || 0).toLocaleString()}`;
const num = (v: number) => (v || 0).toLocaleString();

interface ChartCardProps {
  title: string; subtitle?: string; icon: React.ElementType; iconClass?: string;
  children: React.ReactNode; className?: string; delay?: number; action?: React.ReactNode;
}
function ChartCard({ title, subtitle, icon: Icon, iconClass = 'text-primary bg-primary/10', children, className = '', delay = 0, action }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-card border border-border rounded-xl p-5 card-hover-glow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${iconClass}`}><Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /></div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

// Themed tooltip
const tipStyle = {
  contentStyle: { background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--popover-foreground)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  labelStyle: { color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: 'var(--popover-foreground)' },
};
const axis = { tick: { fontSize: 11, fill: 'currentColor' }, stroke: 'currentColor' } as const;

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/analytics/overview');
      setData(r.data);
    } catch { /* handled by empty state */ }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const exportCsv = () => {
    if (!data) return;
    const rows: string[] = [];
    const section = (name: string, header: string[], body: (string | number)[][]) => {
      rows.push(name); rows.push(header.join(','));
      body.forEach((r) => rows.push(r.map((c) => (typeof c === 'string' && c.includes(',') ? `"${c}"` : c)).join(',')));
      rows.push('');
    };
    section('KPIs', ['Metric', 'Value', 'Delta %'], Object.entries(data.kpis).map(([k, v]: any) => [k, v.value, v.delta]));
    section('Caseflow', ['Month', 'Created', 'Closed'], data.caseflow.map((r: any) => [r.month, r.created, r.closed]));
    section('Renewal Pipeline', ['Bucket', 'Count'], data.renewalPipeline.map((r: any) => [r.bucket, r.count]));
    section('SLA by Entity', ['Entity', 'Tracked', 'On Track', 'At Risk', 'Breached', 'Compliance %'], data.sla.byEntity.map((r: any) => [r.entity, r.tracked, r.onTrack, r.atRisk, r.breached, r.compliance]));
    section('Brand Comparison', ['Brand', 'Cases', 'Contracts', 'Exposure', 'Contract Value'], data.brandComparison.map((r: any) => [r.name, r.cases, r.contracts, r.exposure, r.contractValue]));
    section('Lawyer Workload', ['Lawyer', 'Active', 'Closed', 'Exposure'], data.lawyerWorkload.map((r: any) => [r.name, r.active, r.closed, r.exposure]));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `maktabi-insights-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppLayout title="Insights">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Insights">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-foreground font-medium">Couldn&apos;t load analytics</p>
          <p className="text-sm text-muted-foreground mb-4">The analytics service may be unavailable.</p>
          <Button onClick={refresh}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
        </div>
      </AppLayout>
    );
  }

  const k = data.kpis;
  const sla = data.sla;
  const fin = data.financial;

  const slaColor = sla.overall.compliance >= 80 ? C.green : sla.overall.compliance >= 50 ? C.amber : C.red;
  const gaugeData = [{ name: 'compliance', value: sla.overall.compliance, fill: slaColor }];

  const contractStatusColors: Record<string, string> = {
    ACTIVE: C.green, APPROVED: C.teal, DRAFT: C.slate, EXPIRED: C.red, TERMINATED: '#991b1b',
    PENDING_MANAGER: C.amber, PENDING_LEGAL: C.amber, PENDING_LAWYER: C.amber, PENDING_CEO: C.amber,
  };

  return (
    <AppLayout title="Insights">
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl p-6 text-white relative overflow-hidden print:hidden"
          style={{ background: 'linear-gradient(135deg, hsl(221 83% 36%) 0%, hsl(239 84% 42%) 55%, hsl(262 83% 42%) 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> Analytics &amp; Insights
              </div>
              <h1 className="text-2xl font-bold mt-1">Legal Operations Intelligence</h1>
              <p className="text-white/70 text-sm mt-1">
                Firm-wide performance across litigation, contracts, consultations &amp; finance ·
                updated {new Date(data.generatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refresh} variant="secondary" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-0">
                <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button onClick={exportCsv} variant="secondary" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-0">
                <Download className="w-4 h-4 mr-1.5" /> CSV
              </Button>
              <Button onClick={() => window.print()} variant="secondary" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-0">
                <Printer className="w-4 h-4 mr-1.5" /> Print
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── KPI row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="Active Cases" value={num(k.activeCases.value)} icon={Scale} gradient="from-blue-500 to-indigo-500" trend={{ value: k.activeCases.delta, label: 'vs prev 30d' }} />
          <KpiCard title="Open Contracts" value={num(k.openContracts.value)} icon={Briefcase} gradient="from-purple-500 to-fuchsia-500" trend={{ value: k.openContracts.delta, label: 'vs prev 30d' }} />
          <KpiCard title="Pending Consults" value={num(k.pendingConsultations.value)} icon={FileText} gradient="from-teal-500 to-emerald-500" trend={{ value: k.pendingConsultations.delta, label: 'vs prev 30d' }} />
          <KpiCard title="Open Inquiries" value={num(k.openInvestigations.value)} icon={Search} gradient="from-amber-500 to-orange-500" trend={{ value: k.openInvestigations.delta, label: 'vs prev 30d' }} />
          <KpiCard title="Total Exposure" value={sar(k.totalExposure.value)} icon={AlertTriangle} gradient="from-rose-500 to-red-500" subtitle="Litigation at risk" />
          <KpiCard title="Recovered" value={sar(k.recovered.value)} icon={Wallet} gradient="from-green-500 to-emerald-500" trend={{ value: k.recovered.delta, label: 'collected 30d' }} />
        </div>

        {/* ── Caseflow + SLA ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="Caseflow" subtitle="Cases opened vs. closed · 12 months" icon={TrendingUp} iconClass="text-blue-600 bg-blue-500/10" className="lg:col-span-2" delay={0.05}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data.caseflow} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip {...tipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="created" name="Opened" stroke={C.blue} strokeWidth={2} fill="url(#gCreated)" />
                  <Line type="monotone" dataKey="closed" name="Closed" stroke={C.green} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="SLA Compliance" subtitle={`${sla.overall.tracked} deadlines tracked`} icon={Gauge} iconClass="text-emerald-600 bg-emerald-500/10" delay={0.1}>
            <div className="relative">
              <ResponsiveContainer width="100%" height={150}>
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={220} endAngle={-40}>
                  <RadialBar background dataKey="value" cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: 12 }}>
                <span className="text-3xl font-bold text-foreground tabular-nums">{sla.overall.compliance}%</span>
                <span className="text-xs text-muted-foreground">on-time</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'On track', value: sla.overall.onTrack, color: C.green },
                { label: 'At risk', value: sla.overall.atRisk, color: C.amber },
                { label: 'Breached', value: sla.overall.breached, color: C.red },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-lg bg-muted/50 py-2">
                  <div className="text-lg font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ── Financial recovery + cashflow ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="Financial Recovery" subtitle={`${fin.recoveryRate}% of obligations settled`} icon={DollarSign} iconClass="text-green-600 bg-green-500/10" delay={0.05}>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total obligations</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{sar(fin.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Recovered</p>
                  <p className="text-lg font-semibold text-green-600 tabular-nums">{sar(fin.recovered)}</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${fin.recoveryRate}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">Recovered {fin.recoveryRate}%</span>
                <span className="text-muted-foreground">Outstanding {sar(fin.outstanding)}</span>
              </div>
              <div className="pt-2 space-y-2 border-t border-border">
                {fin.byType.map((t: any) => (
                  <div key={t.type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.type === 'AGAINST_COMPANY' ? 'Against company' : 'In favour'}</span>
                    <span className="font-semibold text-foreground tabular-nums">{sar(t.paid)} / {sar(t.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Collections Cashflow" subtitle="Payments received · 12 months" icon={Wallet} iconClass="text-emerald-600 bg-emerald-500/10" className="lg:col-span-2" delay={0.1}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.cashflow} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.green} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={C.green} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} tickFormatter={(v) => compact.format(v)} />
                  <Tooltip {...tipStyle} formatter={(v: any) => [sarFull(v), 'Collected']} />
                  <Area type="monotone" dataKey="collected" stroke={C.green} strokeWidth={2} fill="url(#gCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ── Renewal pipeline + contract status + risk ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="Contract Renewal Pipeline" subtitle="By days to expiry" icon={Briefcase} iconClass="text-purple-600 bg-purple-500/10" delay={0.05}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.renewalPipeline} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="bucket" {...axis} interval={0} angle={-12} textAnchor="end" height={44} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip {...tipStyle} formatter={(v: any) => [v, 'Contracts']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.renewalPipeline.map((r: any, i: number) => (
                      <Cell key={i} fill={r.bucket === 'Expired' ? C.red : r.bucket === '0–30 days' ? C.amber : C.purple} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Contracts by Status" subtitle="Lifecycle distribution" icon={Layers} iconClass="text-indigo-600 bg-indigo-500/10" delay={0.1}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.contractStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {data.contractStatus.map((r: any, i: number) => (<Cell key={i} fill={contractStatusColors[r.status] || C.slate} />))}
                </Pie>
                <Tooltip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Case Risk" subtitle="Exposure by risk level" icon={AlertTriangle} iconClass="text-red-600 bg-red-500/10" delay={0.15}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.riskDistribution} dataKey="count" nameKey="level" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {data.riskDistribution.map((r: any, i: number) => (<Cell key={i} fill={RISK[r.level]} />))}
                </Pie>
                <Tooltip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Lawyer workload + brand comparison ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Lawyer Workload" subtitle="Active vs. closed caseload" icon={Users} iconClass="text-blue-600 bg-blue-500/10" delay={0.05}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.lawyerWorkload} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" {...axis} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" {...axis} width={104} />
                  <Tooltip {...tipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="active" name="Active" stackId="a" fill={C.blue} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="closed" name="Closed" stackId="a" fill={C.slate} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Brand Comparison" subtitle="Financial exposure by business unit" icon={Layers} iconClass="text-fuchsia-600 bg-fuchsia-500/10" delay={0.1}>
            <div className="space-y-3">
              {data.brandComparison.map((b: any) => {
                const max = Math.max(...data.brandComparison.map((x: any) => x.exposure), 1);
                return (
                  <div key={b.code}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />{b.name}
                        <span className="text-muted-foreground font-normal">· {b.cases} cases · {b.contracts} contracts</span>
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">{sar(b.exposure)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(b.exposure / max) * 100}%`, background: b.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* ── SLA by entity + severity + case status ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="SLA by Practice Area" subtitle="Compliance breakdown" icon={ShieldCheck} iconClass="text-emerald-600 bg-emerald-500/10" delay={0.05}>
            <div className="space-y-3 pt-1">
              {sla.byEntity.map((e: any) => (
                <div key={e.entity}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{e.entity}</span>
                    <span className="text-muted-foreground">{e.compliance}% · {e.tracked} tracked</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                    <div className="h-full bg-green-500" style={{ width: `${(e.onTrack / Math.max(e.tracked, 1)) * 100}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${(e.atRisk / Math.max(e.tracked, 1)) * 100}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${(e.breached / Math.max(e.tracked, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> On track</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> At risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Breached</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Investigation Severity" subtitle="HR & compliance inquiries" icon={Search} iconClass="text-amber-600 bg-amber-500/10" delay={0.1}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.investigationSeverity} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="severity" {...axis} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip {...tipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.investigationSeverity.map((r: any, i: number) => (<Cell key={i} fill={SEVERITY[r.severity]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Case Status" subtitle="Litigation pipeline" icon={Scale} iconClass="text-blue-600 bg-blue-500/10" delay={0.15}>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.caseStatus} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="status" {...axis} interval={0} angle={-20} textAnchor="end" height={54} tick={{ fontSize: 9, fill: 'currentColor' }} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip {...tipStyle} />
                  <Bar dataKey="count" fill={C.indigo} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
