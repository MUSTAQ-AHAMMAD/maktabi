'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Scale } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface LitigationCase {
  id: string;
  caseNumber: string;
  caseType: string;
  courtName: string;
  parties: string;
  riskLevel: string;
  status: string;
  financialExposure?: string;
  currency?: string;
  assignedLawyer?: { firstName: string; lastName: string };
}

export default function LitigationPage() {
  const [cases, setCases] = useState<LitigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    api.get('/litigation', { params }).then(r => setCases(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = cases.filter(c =>
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.caseType.toLowerCase().includes(search.toLowerCase()) ||
    c.parties.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Litigation Cases">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search cases..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="HEARING">Hearing</SelectItem>
                <SelectItem value="DECIDED">Decided</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/litigation/new">
            <Button><Plus className="w-4 h-4 mr-2" />New Case</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Scale className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No cases found</h3>
            <p className="text-muted-foreground text-sm mt-1">Create your first litigation case to get started</p>
            <Link href="/litigation/new" className="mt-4">
              <Button><Plus className="w-4 h-4 mr-2" />New Case</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Case #</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Court</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Risk</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden xl:table-cell">Exposure</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/litigation/${c.id}`} className="block">
                        <p className="text-sm font-semibold text-primary">{c.caseNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-48">{c.parties}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-foreground">{c.caseType}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{c.courtName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.riskLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {c.financialExposure && (
                        <span className="text-sm font-medium text-foreground">
                          {c.currency} {Number(c.financialExposure).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.assignedLawyer && (
                        <span className="text-sm text-muted-foreground">
                          {c.assignedLawyer.firstName} {c.assignedLawyer.lastName}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
