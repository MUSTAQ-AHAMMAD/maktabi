'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Briefcase, AlertTriangle } from 'lucide-react';
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

  return (
    <AppLayout title="Contracts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contracts..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Link href="/contracts/new">
            <Button><Plus className="w-4 h-4 mr-2" />New Contract</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No contracts found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first contract to get started</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Contract #</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Counterparty</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Value</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden xl:table-cell">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => {
                  const daysLeft = c.endDate ? differenceInDays(new Date(c.endDate), new Date()) : null;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/contracts/${c.id}`}>
                          <p className="text-sm font-semibold text-primary">{c.contractNumber}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.title}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-foreground">{c.counterparty}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {c.value && <span className="text-sm font-medium">{c.currency} {Number(c.value).toLocaleString()}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        {daysLeft !== null && (
                          <span className={`text-xs font-medium flex items-center gap-1 ${daysLeft <= 30 ? 'text-red-600' : daysLeft <= 60 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                            {daysLeft > 0 && daysLeft <= 30 && <AlertTriangle className="w-3 h-3" />}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
