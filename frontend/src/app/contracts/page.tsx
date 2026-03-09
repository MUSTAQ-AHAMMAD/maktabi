'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Briefcase, AlertTriangle, ChevronRight } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import api from '@/lib/api';
import Link from 'next/link';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  counterparty: string;
  value?: string;
  currency?: string;
  status: string;
  endDate?: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/contracts').then(r => setContracts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = contracts.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.counterparty?.toLowerCase().includes(search.toLowerCase())
  );

  const totalContracts    = contracts.length;
  const activeContracts   = contracts.filter(c => c.status === 'ACTIVE').length;
  const expiringSoon      = contracts.filter(c => {
    if (!c.endDate) return false;
    const d = differenceInDays(new Date(c.endDate), new Date());
    return d >= 0 && d <= 60;
  }).length;

  const statPills = [
    { label: 'Total',         value: totalContracts,  color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
    { label: 'Active',        value: activeContracts, color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
    { label: 'Expiring Soon', value: expiringSoon,    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  ];

  return (
    <AppLayout title="Contracts">
      <div className="space-y-5">
        {/* ── Stat pills ─────────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex flex-wrap gap-2">
            {statPills.map(p => (
              <div key={p.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${p.color}`}>
                <span className="text-base font-bold tabular-nums">{p.value}</span>
                <span className="opacity-80">{p.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contracts…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Link href="/contracts/new">
            <Button className="shrink-0"><Plus className="w-4 h-4 mr-2" />New Contract</Button>
          </Link>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
            <Briefcase className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No contracts found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first contract to get started</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide">Contract #</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden md:table-cell">Counterparty</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden lg:table-cell">Value</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden xl:table-cell">Expiry</th>
                  <th className="w-10 px-3 py-3 hidden sm:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => {
                  const daysLeft = c.endDate ? differenceInDays(new Date(c.endDate), new Date()) : null;
                  return (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors group cursor-pointer">
                      <td className="px-6 py-3.5">
                        <Link href={`/contracts/${c.id}`}>
                          <p className="text-sm font-semibold text-primary">{c.contractNumber}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-48">{c.title}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-foreground">{c.counterparty}</span>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        {c.value && (
                          <span className="text-sm font-medium text-foreground">
                            {c.currency} {Number(c.value).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-3.5 hidden xl:table-cell">
                        {daysLeft !== null && (
                          <span className={`text-xs font-medium flex items-center gap-1 ${daysLeft < 0 ? 'text-muted-foreground' : daysLeft <= 30 ? 'text-red-600' : daysLeft <= 60 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                            {daysLeft > 0 && daysLeft <= 30 && <AlertTriangle className="w-3 h-3" />}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        <Link href={`/contracts/${c.id}`}>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              Showing {filtered.length} of {contracts.length} contracts
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
