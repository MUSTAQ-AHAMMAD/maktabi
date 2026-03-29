'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Search, Moon, Sun, X, CheckCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { format } from 'date-fns';

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

export function Topnav({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .catch(() => {});
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n.id}/read`);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      } catch {}
    }
    const link = getEntityLink(n.entityType, n.entityId);
    if (link) {
      setShowNotifications(false);
      router.push(link);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30 flex items-center px-6 gap-4">
      {title && <h1 className="text-lg font-semibold text-foreground hidden md:block">{title}</h1>}
      <div className="flex-1 max-w-md ml-auto md:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9 bg-muted border-0 focus-visible:ring-1" />
        </div>
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</p>
                            {n.entityType && (
                              <span className="text-[10px] text-primary font-medium">
                                {n.entityType === 'LITIGATION' ? '⚖ Case' : n.entityType === 'CONTRACT' ? '📄 Contract' : n.entityType === 'HEARING' ? '🔔 Hearing' : n.entityType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <Link href="/notifications" onClick={() => setShowNotifications(false)}>
                  <button className="text-xs text-primary hover:underline w-full text-center">View all notifications</button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {user && (
          <Link href="/profile">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
}
