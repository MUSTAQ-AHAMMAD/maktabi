'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit').then(r => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Audit Log">
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No audit logs yet</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">Entity</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium">{log.user?.firstName} {log.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{log.entityType} {log.entityId && `(${log.entityId.substring(0,8)}...)`}</span>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
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
