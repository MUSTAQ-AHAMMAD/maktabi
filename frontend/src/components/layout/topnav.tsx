'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export function Topnav({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications')
      .then(r => {
        const notifications = r.data as Array<Record<string, unknown>>;
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, [user]);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30 flex items-center px-6 gap-4">
      {title && <h1 className="text-xl font-semibold text-foreground hidden md:block">{title}</h1>}
      <div className="flex-1 max-w-md ml-auto md:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9 bg-muted border-0 focus-visible:ring-1" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[1rem] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
        {user && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
