'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  SUCCESS: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ERROR: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

function getEntityLink(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  const routes: Record<string, string> = {
    LITIGATION: '/litigation',
    CONTRACT: '/contracts',
    INVESTIGATION: '/investigations',
    CONSULTATION: '/consultations',
    FINANCIAL: '/financial',
  };
  const base = routes[entityType];
  return base ? `${base}/${entityId}` : null;
}

function getEntityLabel(entityType?: string): string {
  if (!entityType) return '';
  const labels: Record<string, string> = {
    LITIGATION: '⚖ Litigation Case',
    CONTRACT: '📄 Contract',
    INVESTIGATION: '🔍 Investigation',
    CONSULTATION: '💬 Consultation',
    FINANCIAL: '💰 Financial',
    HEARING: '🔔 Hearing',
  };
  return labels[entityType] || entityType;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    api.get('/notifications')
      .then(r => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({ title: 'All notifications marked as read' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n.id}/read`);
        setItems(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      } catch {}
    }
    const link = getEntityLink(n.entityType, n.entityId);
    if (link) {
      router.push(link);
    }
  };

  const unreadCount = items.filter(n => !n.isRead).length;
  const filtered = filter === 'unread' ? items.filter(n => !n.isRead) : items;

  return (
    <AppLayout title="Notifications">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({items.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here when there are updates.'}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filtered.map(n => {
              const cfg = typeConfig[n.type] || typeConfig['INFO'];
              const Icon = cfg.icon;
              const entityLink = getEntityLink(n.entityType, n.entityId);
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(n.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    {n.entityType && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {getEntityLabel(n.entityType)}
                        </span>
                        {entityLink && (
                          <span className="text-xs text-primary flex items-center gap-0.5">
                            <ExternalLink className="w-3 h-3" />
                            View
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
