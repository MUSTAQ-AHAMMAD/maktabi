'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Brand { id: string; name: string; code: string; color: string; }

interface FinancialExecution {
  id: string;
  title: string;
  type: string;
  totalAmount: string;
  paidAmount: string;
  currency?: string;
  status: string;
  brand?: { id: string; name: string; code: string; color: string };
}

export default function FinancialPage() {
  const [items, setItems] = useState<FinancialExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => { api.get('/brands').then(r => setBrands(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (brandFilter !== 'all') params.brandId = brandFilter;
    api.get('/financial', { params }).then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [brandFilter]);

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));
  const totalExposure = items.filter(i => i.type === 'AGAINST_COMPANY').reduce((acc, i) => acc + Number(i.totalAmount), 0);
  const totalInFavor = items.filter(i => i.type === 'IN_FAVOR_OF_COMPANY').reduce((acc, i) => acc + Number(i.totalAmount), 0);

  return (
    <AppLayout title="Financial Execution">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Against Company</span>
            </div>
            <p className="text-2xl font-bold text-foreground">SAR {totalExposure.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">In Favor of Company</span>
            </div>
            <p className="text-2xl font-bold text-foreground">SAR {totalInFavor.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center">
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
            <Link href="/financial/new"><Button><Plus className="w-4 h-4 mr-2" />New Execution</Button></Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No financial executions found</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Brand</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Total Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Paid</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const progress = Number(item.totalAmount) > 0 ? (Number(item.paidAmount) / Number(item.totalAmount)) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.type === 'AGAINST_COMPANY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {item.type === 'AGAINST_COMPANY' ? 'Against' : 'In Favor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {item.brand ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: item.brand.color + '20', color: item.brand.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.brand.color }} />
                            {item.brand.code}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold">{item.currency} {Number(item.totalAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{Number(item.paidAmount).toLocaleString()}</span>
                            <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden w-24">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
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
