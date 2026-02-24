'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Consultation {
  id: string;
  title: string;
  description?: string;
  status: string;
  tags?: string[];
  createdBy?: { firstName: string; lastName: string };
}

export default function ConsultationsPage() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/consultations').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout title="Legal Consultations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search consultations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Link href="/consultations/new"><Button><Plus className="w-4 h-4 mr-2" />New Request</Button></Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No consultations found</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Requested By</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/consultations/${item.id}`}>
                        <p className="text-sm font-medium text-primary">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-48">{item.description?.substring(0, 80)}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {item.createdBy && <span className="text-sm text-muted-foreground">{item.createdBy.firstName} {item.createdBy.lastName}</span>}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {item.tags?.map((t: string) => (
                          <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
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
