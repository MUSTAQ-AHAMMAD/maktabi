'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topnav } from './topnav';
import { useAuthStore } from '@/store/auth.store';
import { getStoredUser, getToken } from '@/lib/auth';
import { useSidebarStore } from '@/store/sidebar.store';

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
  // Including router/setAuth/user in deps would cause re-runs on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-200" style={{ marginLeft: collapsed ? '64px' : '260px' }}>
        <Topnav title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
