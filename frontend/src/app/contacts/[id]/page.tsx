'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/i18n/locale-provider';
import { money, moneyCompact, num, formatDate } from '@/lib/format';
import api from '@/lib/api';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Receipt, FileSpreadsheet, ListTodo,
  FileSignature, TrendingUp, Wallet, User as UserIcon,
} from 'lucide-react';

const TABS = ['overview', 'invoices', 'estimates', 'tasks', 'poa'] as const;
type Tab = typeof TABS[number];

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale, dir } = useLocale();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => { api.get(`/contacts/${id}`).then(r => setC(r.data)).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <AppLayout title={t('portal.title')}><div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div></AppLayout>;
  if (!c) return <AppLayout title={t('portal.title')}><div className="py-20 text-center text-muted-foreground">{t('common.noData')}</div></AppLayout>;

  const invoices = c.invoices || [], estimates = c.estimates || [], tasks = c.tasks || [], poa = c.powersOfAttorney || [];
  const billed = invoices.reduce((a: number, i: any) => a + num(i.total), 0);
  const outstanding = invoices.reduce((a: number, i: any) => a + (num(i.total) - num(i.paidAmount)), 0);
  const openTasks = tasks.filter((tk: any) => !['DONE', 'CANCELLED'].includes(tk.status)).length;

  const kpis = [
    { label: t('portal.totalBilled'), value: moneyCompact(billed), icon: TrendingUp, cls: 'from-blue-500 to-indigo-500' },
    { label: t('portal.outstanding'), value: moneyCompact(outstanding), icon: Wallet, cls: 'from-amber-500 to-orange-500' },
    { label: t('portal.openTasks'), value: openTasks, icon: ListTodo, cls: 'from-teal-500 to-emerald-500' },
    { label: t('portal.poa'), value: poa.length, icon: FileSignature, cls: 'from-purple-500 to-fuchsia-500' },
  ];
  const counts: Record<Tab, number> = { overview: 0, invoices: invoices.length, estimates: estimates.length, tasks: tasks.length, poa: poa.length };
  const Arrow = dir === 'rtl' ? (props: any) => <ArrowLeft {...props} className={`${props.className} rotate-180`} /> : ArrowLeft;

  return (
    <AppLayout title={c.name}>
      <div className="space-y-6">
        <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Arrow className="w-4 h-4" /> {t('portal.backToContacts')}
        </Link>

        {/* Header card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">{c.name.slice(0, 2).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{c.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t(`contacts.types.${c.type}`)}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {c.company && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{c.company}</span>}
                {c.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{c.email}</span>}
                {c.phone && <span className="flex items-center gap-1.5" dir="ltr"><Phone className="w-3.5 h-3.5" />{c.phone}</span>}
                {c.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{c.city}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('portal.since')} {formatDate(c.createdAt, locale)}</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 card-hover-glow">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${k.cls}`}><k.icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-lg font-bold text-foreground tabular-nums">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === tb ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t(`portal.${tb}`)}{tb !== 'overview' && counts[tb] > 0 && <span className="ms-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">{counts[tb]}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MiniList title={t('portal.invoices')} icon={Receipt} rows={invoices.slice(0, 5).map((i: any) => ({ id: i.id, main: i.number, sub: t(`invoices.statuses.${i.status}`), right: money(i.total) }))} empty={t('portal.noRecords')} />
            <MiniList title={t('portal.tasks')} icon={ListTodo} rows={tasks.slice(0, 5).map((tk: any) => ({ id: tk.id, main: tk.title, sub: t(`tasks.statuses.${tk.status}`), right: t(`tasks.priorities.${tk.priority}`) }))} empty={t('portal.noRecords')} />
            <MiniList title={t('portal.estimates')} icon={FileSpreadsheet} rows={estimates.slice(0, 5).map((e: any) => ({ id: e.id, main: e.number, sub: t(`estimates.statuses.${e.status}`), right: money(e.total) }))} empty={t('portal.noRecords')} />
            <MiniList title={t('portal.poa')} icon={FileSignature} rows={poa.slice(0, 5).map((p: any) => ({ id: p.id, main: p.number, sub: p.grantee, right: formatDate(p.expiryDate, locale) }))} empty={t('portal.noRecords')} />
          </div>
        )}
        {tab === 'invoices' && <SectionTable rows={invoices} empty={t('portal.noRecords')} cols={[{ h: t('invoices.number'), get: (r: any) => r.number, mono: true }, { h: t('common.status'), get: (r: any) => t(`invoices.statuses.${r.status}`) }, { h: t('invoices.total'), get: (r: any) => money(r.total), end: true }, { h: t('invoices.balance'), get: (r: any) => money(num(r.total) - num(r.paidAmount)), end: true }]} />}
        {tab === 'estimates' && <SectionTable rows={estimates} empty={t('portal.noRecords')} cols={[{ h: t('invoices.number'), get: (r: any) => r.number, mono: true }, { h: t('common.status'), get: (r: any) => t(`estimates.statuses.${r.status}`) }, { h: t('invoices.total'), get: (r: any) => money(r.total), end: true }]} />}
        {tab === 'tasks' && <SectionTable rows={tasks} empty={t('portal.noRecords')} cols={[{ h: t('common.name'), get: (r: any) => r.title }, { h: t('common.status'), get: (r: any) => t(`tasks.statuses.${r.status}`) }, { h: t('common.priority'), get: (r: any) => t(`tasks.priorities.${r.priority}`) }]} />}
        {tab === 'poa' && <SectionTable rows={poa} empty={t('portal.noRecords')} cols={[{ h: t('poa.number'), get: (r: any) => r.number, mono: true }, { h: t('poa.grantee'), get: (r: any) => r.grantee }, { h: t('poa.expiryDate'), get: (r: any) => formatDate(r.expiryDate, locale) }]} />}
      </div>
    </AppLayout>
  );
}

function MiniList({ title, icon: Icon, rows, empty }: { title: string; icon: any; rows: { id: string; main: string; sub: string; right: string }[]; empty: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-primary" /><h3 className="font-semibold text-foreground text-sm">{title}</h3></div>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">{empty}</p> : (
        <div className="space-y-1">
          {rows.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{r.main}</p><p className="text-xs text-muted-foreground">{r.sub}</p></div>
              <span className="text-sm text-muted-foreground tabular-nums shrink-0 ms-2">{r.right}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTable({ rows, cols, empty }: { rows: any[]; cols: { h: string; get: (r: any) => string; end?: boolean; mono?: boolean }[]; empty: string }) {
  if (rows.length === 0) return <div className="bg-card border border-border rounded-xl py-16 text-center text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr>{cols.map((col, i) => <th key={i} className={`font-semibold px-4 py-3 ${col.end ? 'text-end' : 'text-start'}`}>{col.h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.id || ri} className="border-t border-border hover:bg-muted/40">
                {cols.map((col, ci) => <td key={ci} className={`px-4 py-3 ${col.end ? 'text-end tabular-nums' : 'text-start'} ${col.mono ? 'font-mono text-xs' : ''} text-foreground`} dir={col.mono ? 'ltr' : undefined}>{col.get(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
