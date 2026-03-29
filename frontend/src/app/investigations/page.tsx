'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Shield } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Brand { id: string; name: string; code: string; color: string; }

interface Investigation {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  isConfidential?: boolean;
  createdBy?: { firstName: string; lastName: string };
  brand?: { id: string; name: string; code: string; color: string };
}

export default function InvestigationsPage() {
  const [items, setItems] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => { api.get('/brands').then(r => setBrands(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (brandFilter !== 'all') params.brandId = brandFilter;
    api.get('/investigations', { params }).then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [brandFilter]);

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout title="Investigations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search investigations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
            <Link href="/investigations/new">
              <Button><Plus className="w-4 h-4 mr-2" />New Investigation</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No investigations found</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Severity</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Brand</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Submitted By</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden xl:table-cell">Confidential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/investigations/${item.id}`}>
                        <p className="text-sm font-medium text-primary">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-48">{item.description?.substring(0, 80)}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <StatusBadge status={item.severity} />
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
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {item.createdBy && <span className="text-sm text-muted-foreground">{item.createdBy.firstName} {item.createdBy.lastName}</span>}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {item.isConfidential && <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">Confidential</span>}
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
