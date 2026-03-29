'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Scale, ChevronRight } from 'lucide-react';
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
  brand?: { id: string; name: string; code: string; color: string };
}

interface Brand {
  id: string;
  name: string;
  code: string;
  color: string;
}

export default function LitigationPage() {
  const [cases, setCases] = useState<LitigationCase[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => {
    api.get('/brands').then(r => setBrands(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (brandFilter !== 'all') params.brandId = brandFilter;
    api.get('/litigation', { params }).then(r => setCases(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter, brandFilter]);

  const filtered = cases.filter(c =>
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.caseType.toLowerCase().includes(search.toLowerCase()) ||
    c.parties.toLowerCase().includes(search.toLowerCase())
  );

  const totalCases    = cases.length;
  const activeCases   = cases.filter(c => ['IN_PROGRESS', 'HEARING'].includes(c.status)).length;
  const highRiskCases = cases.filter(c => ['HIGH', 'CRITICAL'].includes(c.riskLevel)).length;
  const decidedCases  = cases.filter(c => c.status === 'DECIDED').length;

  const statPills = [
    { label: 'Total',     value: totalCases,    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
    { label: 'Active',    value: activeCases,   color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
    { label: 'High Risk', value: highRiskCases, color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
    { label: 'Decided',   value: decidedCases,  color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
  ];

  return (
    <AppLayout title="Litigation Cases">
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
          <div className="flex gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search cases…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      {b.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/litigation/new">
            <Button className="shrink-0"><Plus className="w-4 h-4 mr-2" />New Case</Button>
          </Link>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
            <Scale className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No cases found</h3>
            <p className="text-muted-foreground text-sm mt-1">Create your first litigation case to get started</p>
            <Link href="/litigation/new" className="mt-4">
              <Button><Plus className="w-4 h-4 mr-2" />New Case</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide">Case #</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden lg:table-cell">Brand</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden lg:table-cell">Court</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide">Risk</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden xl:table-cell">Exposure</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3 uppercase tracking-wide hidden lg:table-cell">Assigned To</th>
                  <th className="w-10 px-3 py-3 hidden sm:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors group cursor-pointer">
                    <td className="px-6 py-3.5">
                      <Link href={`/litigation/${c.id}`} className="block">
                        <p className="text-sm font-semibold text-primary">{c.caseNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-48">{c.parties}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-foreground">{c.caseType}</span>
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      {c.brand ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: c.brand.color + '20', color: c.brand.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.brand.color }} />
                          {c.brand.code}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{c.courtName}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={c.riskLevel} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3.5 hidden xl:table-cell">
                      {c.financialExposure && (
                        <span className="text-sm font-medium text-foreground">
                          {c.currency} {Number(c.financialExposure).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      {c.assignedLawyer && (
                        <span className="text-sm text-muted-foreground">
                          {c.assignedLawyer.firstName} {c.assignedLawyer.lastName}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <Link href={`/litigation/${c.id}`}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              Showing {filtered.length} of {cases.length} cases
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
