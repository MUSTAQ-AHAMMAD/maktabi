'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, Briefcase, FileText, DollarSign, AlertTriangle, Clock, Plus, Search, MessageSquare, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [timeline, setTimeline] = useState<unknown[]>([]);
  const [hearings, setHearings] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/dashboard/cases-timeline').then(r => setTimeline(r.data)).catch(() => {}),
      api.get('/litigation').then(r => {
        const todayStr = new Date().toDateString();
        const todayHearings = (r.data as Array<Record<string, unknown>>).filter(c => {
          const nextHearing = c.nextHearingDate as string | undefined;
          return nextHearing && new Date(nextHearing).toDateString() === todayStr;
        });
        setHearings(todayHearings);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const RISK_COLORS: Record<string, string> = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#991b1b' };

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const kpis = stats?.kpis as Record<string, number> | undefined;
  const financial = stats?.financial as Record<string, string> | undefined;
  const riskBreakdown = stats?.riskBreakdown as Array<{ riskLevel: string; _count: number }> | undefined;
  const recentCases = stats?.recentCases as Array<Record<string, unknown>> | undefined;

  const pieData = riskBreakdown?.map((r) => ({
    name: r.riskLevel,
    value: r._count,
    color: RISK_COLORS[r.riskLevel] || '#94a3b8',
  })) || [];

  const financialExposure = financial?.total ? Number(financial.total).toLocaleString() : '0';
  const financialPaid = financial?.paid ? Number(financial.paid).toLocaleString() : '0';
  const financialProgress = financial?.total && Number(financial.total) > 0
    ? (Number(financial.paid) / Number(financial.total)) * 100
    : 0;

  const quickActions = [
    { label: 'New Case',         href: '/litigation/new',     icon: Scale,         color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'New Contract',     href: '/contracts/new',      icon: Briefcase,     color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'New Consultation', href: '/consultations/new',  icon: MessageSquare, color: 'bg-teal-500 hover:bg-teal-600' },
    { label: 'New Investigation',href: '/investigations/new', icon: Search,        color: 'bg-amber-500 hover:bg-amber-600' },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* ── Welcome banner ─────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, hsl(221 83% 36%) 0%, hsl(239 84% 42%) 60%, hsl(262 83% 40%) 100%)',
        }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative">
            <p className="text-white/70 text-sm font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold mt-1">
              {getGreeting()}, {user?.firstName}!
            </h1>
            <p className="text-white/70 text-sm mt-1">Here&apos;s your legal operations overview for today.</p>
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <button className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                <Plus className="w-3.5 h-3.5 ml-auto opacity-70" />
              </button>
            </Link>
          ))}
        </div>

        {/* ── KPI cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            title="Total Cases" value={kpis?.totalCases || 0}
            subtitle="All litigation cases"
            icon={Scale} iconColor="text-blue-600" iconBg="bg-blue-100 dark:bg-blue-900/30"
          />
          <KpiCard
            title="Active Cases" value={kpis?.activeCases || 0}
            subtitle="In progress or hearing"
            icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30"
          />
          <KpiCard
            title="Contracts" value={kpis?.totalContracts || 0}
            subtitle={`${kpis?.expiringContracts || 0} expiring soon`}
            icon={Briefcase} iconColor="text-purple-600" iconBg="bg-purple-100 dark:bg-purple-900/30"
          />
          <KpiCard
            title="Pending Consultations" value={kpis?.pendingConsultations || 0}
            subtitle="Awaiting legal opinion"
            icon={FileText} iconColor="text-teal-600" iconBg="bg-teal-100 dark:bg-teal-900/30"
          />
        </div>

        {/* ── Financial + Risk ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">Financial Exposure</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground">Total Exposure</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">SAR {financialExposure}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="text-lg font-semibold text-green-600 mt-0.5">SAR {financialPaid}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Recovery progress</span>
                  <span className="font-medium text-foreground">{financialProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${financialProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-foreground">Risk Distribution</h3>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" strokeWidth={2}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Cases']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name} <span className="font-semibold text-foreground">({d.value})</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-28 text-muted-foreground text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* ── Timeline chart ──────────────────────────────────────────────── */}
        {(timeline as Array<Record<string, unknown>>).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Cases Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline as Array<Record<string, unknown>>}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(221,83%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Today's Hearings ────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Today&apos;s Hearings</h3>
            </div>
            <Link href="/litigation">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
            </Link>
          </div>
          {hearings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No hearings scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hearings.map(c => (
                <Link key={c.id as string} href={`/litigation/${c.id as string}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.caseNumber as string}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.caseType as string} · {c.courtName as string}</p>
                    </div>
                    <StatusBadge status={c.status as string} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Cases ────────────────────────────────────────────────── */}
        {recentCases && recentCases.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Cases</h3>
              <Link href="/litigation">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentCases.map((c) => (
                <Link key={c.id as string} href={`/litigation/${c.id as string}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Scale className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.caseNumber as string}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.caseType as string} · {c.courtName as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <StatusBadge status={c.riskLevel as string} />
                      <StatusBadge status={c.status as string} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
