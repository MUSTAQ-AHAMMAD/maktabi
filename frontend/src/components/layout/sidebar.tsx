'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scale, Search, FileText, Briefcase, DollarSign,
  Users, ChevronLeft, ChevronRight, LogOut, Shield, Bell, Calendar, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  { href: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/litigation',     label: 'Litigation',    icon: Scale },
  { href: '/investigations', label: 'Investigations', icon: Search },
  { href: '/consultations',  label: 'Consultations', icon: FileText },
  { href: '/contracts',      label: 'Contracts',     icon: Briefcase },
  { href: '/financial',      label: 'Financial',     icon: DollarSign },
  { href: '/calendar',       label: 'Calendar',      icon: Calendar },
  { href: '/notifications',  label: 'Notifications', icon: Bell,    badge: true },
  { href: '/users',          label: 'Users',         icon: Users,   roles: ['ADMIN', 'LEGAL_MANAGER'] },
  { href: '/audit',          label: 'Audit Log',     icon: Shield,  roles: ['ADMIN', 'LEGAL_MANAGER', 'CEO'] },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarStore();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const visibleItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
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
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="text-lg font-bold whitespace-nowrap text-white">Maktabi</span>
                <p className="text-[10px] whitespace-nowrap" style={{ color: 'var(--sidebar-fg)', marginTop: '-2px' }}>
                  Legal Management
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
              <div
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group',
                  isActive && 'shadow-sm',
                )}
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg, var(--sidebar-active-bg) 0%, hsl(221 83% 48%) 100%)'
                    : 'transparent',
                  color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-r-full" />
                )}

                <div className="relative shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                  {/* Notification badge (collapsed) */}
                  {item.badge && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between flex-1 overflow-hidden"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                      {/* Notification badge (expanded) */}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full shrink-0">
                          NEW
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-0.5 shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {/* User profile (expanded only) */}
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-2 py-2 mb-1 rounded-lg" style={{ background: 'var(--sidebar-hover-bg)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-fg)' }}>
                      {roleLabels[user.role] || user.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/profile" title={collapsed ? 'Settings' : undefined}>
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
          title={collapsed ? 'Sign out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#f87171';
            (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-fg)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center px-3 py-2 rounded-lg transition-all duration-150',
            collapsed ? 'justify-center' : 'justify-end',
          )}
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
          {!collapsed && <span className="text-xs ml-1 -mr-1 opacity-60">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
