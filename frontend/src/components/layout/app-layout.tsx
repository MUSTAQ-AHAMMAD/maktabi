'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topnav } from './topnav';
import { useAuthStore } from '@/store/auth.store';
import { getStoredUser, getToken } from '@/lib/auth';

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();
    if (!storedUser || !token) {
      router.push('/login');
    } else if (!user) {
      setAuth(storedUser, token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-200" style={{ marginLeft: '260px' }}>
        <Topnav title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
