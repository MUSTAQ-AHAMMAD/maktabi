'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, Briefcase, FileText, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [timeline, setTimeline] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/dashboard/cases-timeline').then(r => setTimeline(r.data)).catch(() => {}),
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

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard title="Total Cases" value={kpis?.totalCases || 0} subtitle="All litigation cases" icon={Scale} iconColor="text-blue-600" iconBg="bg-blue-100 dark:bg-blue-900/30" />
          <KpiCard title="Active Cases" value={kpis?.activeCases || 0} subtitle="In progress or hearing" icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30" />
          <KpiCard title="Contracts" value={kpis?.totalContracts || 0} subtitle={`${kpis?.expiringContracts || 0} expiring soon`} icon={Briefcase} iconColor="text-purple-600" iconBg="bg-purple-100 dark:bg-purple-900/30" />
          <KpiCard title="Pending Consultations" value={kpis?.pendingConsultations || 0} subtitle="Awaiting legal opinion" icon={FileText} iconColor="text-teal-600" iconBg="bg-teal-100 dark:bg-teal-900/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">Financial Exposure</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Exposure</span>
                <span className="font-bold text-foreground">SAR {financialExposure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-green-600">SAR {financialPaid}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${financialProgress}%` }}
                />
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
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Cases']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-28 text-muted-foreground text-sm">No data yet</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(timeline as Array<Record<string, unknown>>).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Cases Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline as Array<Record<string, unknown>>}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {recentCases && recentCases.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Cases</h3>
            <div className="space-y-3">
              {recentCases.map((c) => (
                <div key={c.id as string} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.caseNumber as string}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.caseType as string} · {c.courtName as string}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StatusBadge status={c.riskLevel as string} />
                    <StatusBadge status={c.status as string} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
