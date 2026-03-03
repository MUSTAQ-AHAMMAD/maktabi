'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scale, Search, FileText, Briefcase, DollarSign,
  Users, ChevronLeft, ChevronRight, LogOut, Shield, Bell, Calendar, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useSidebarStore } from '@/store/sidebar.store';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  CEO: 'Chief Executive Officer',
  LEGAL_MANAGER: 'Legal Manager',
  INTERNAL_LAWYER: 'Internal Lawyer',
  EXTERNAL_LAWYER: 'External Lawyer',
  HR: 'Human Resources',
  FINANCE: 'Finance',
  DEPARTMENT_MANAGER: 'Department Manager',
  EMPLOYEE: 'Employee',
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/litigation', label: 'Litigation', icon: Scale },
  { href: '/investigations', label: 'Investigations', icon: Search },
  { href: '/consultations', label: 'Consultations', icon: FileText },
  { href: '/contracts', label: 'Contracts', icon: Briefcase },
  { href: '/financial', label: 'Financial', icon: DollarSign },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/users', label: 'Users', icon: Users, roles: ['ADMIN', 'LEGAL_MANAGER'] },
  { href: '/audit', label: 'Audit Log', icon: Shield, roles: ['ADMIN', 'LEGAL_MANAGER', 'CEO'] },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarStore();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const visibleItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="text-lg font-bold whitespace-nowrap" style={{ color: 'white' }}>
                  Maktabi
                </span>
                <p className="text-[10px] whitespace-nowrap" style={{ color: 'var(--sidebar-fg)', marginTop: '-2px' }}>
                  Legal Management
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group',
                )}
                style={{
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1 shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {!collapsed && user && (
          <div className="px-2 py-2 mb-1 rounded-lg" style={{ background: 'var(--sidebar-hover-bg)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'white' }}>{user.firstName} {user.lastName}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-fg)' }}>{roleLabels[user.role] || user.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        )}
        <Link href="/profile">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
            style={{ color: 'var(--sidebar-fg)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <button
          onClick={() => clearAuth()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-fg)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full flex items-center px-3 py-2 rounded-lg transition-all duration-150', collapsed ? 'justify-center' : 'justify-end')}
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
