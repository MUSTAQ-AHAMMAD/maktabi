'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topnav } from './topnav';
import { useAuthStore } from '@/store/auth.store';
import { getStoredUser, getToken } from '@/lib/auth';
import { useSidebarStore } from '@/store/sidebar.store';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

const routeLabels: Record<string, string> = {
  dashboard:     'Dashboard',
  litigation:    'Litigation',
  investigations:'Investigations',
  consultations: 'Consultations',
  contracts:     'Contracts',
  financial:     'Financial',
  calendar:      'Calendar',
  notifications: 'Notifications',
  users:         'Users',
  audit:         'Audit Log',
  profile:       'Profile',
  new:           'New',
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = routeLabels[seg] || seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 opacity-50" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const { collapsed } = useSidebarStore();

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();
    if (!storedUser || !token) {
      router.push('/login');
    } else if (!user) {
      setAuth(storedUser, token);
    }
  // Run only on mount: reads localStorage and hydrates auth store once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-200" style={{ marginLeft: collapsed ? '64px' : '260px' }}>
        <Topnav title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
