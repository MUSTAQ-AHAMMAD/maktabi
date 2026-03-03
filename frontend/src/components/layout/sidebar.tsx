'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scale, Search, FileText, Briefcase, DollarSign,
  Users, ChevronLeft, ChevronRight, LogOut, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useSidebarStore } from '@/store/sidebar.store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/litigation', label: 'Litigation', icon: Scale },
  { href: '/investigations', label: 'Investigations', icon: Search },
  { href: '/consultations', label: 'Consultations', icon: FileText },
  { href: '/contracts', label: 'Contracts', icon: Briefcase },
  { href: '/financial', label: 'Financial', icon: DollarSign },
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
      className="fixed left-0 top-0 h-full bg-card border-r border-border z-40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-foreground whitespace-nowrap overflow-hidden"
              >
                Maktabi
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}>
                <Icon className="w-5 h-5 shrink-0" />
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

      <div className="border-t border-border p-3 space-y-2 shrink-0">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-xs font-semibold text-foreground truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearAuth()}
          className={cn('w-full text-muted-foreground hover:text-destructive', collapsed ? 'justify-center px-0' : 'justify-start')}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2 text-sm">Sign out</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full text-muted-foreground', collapsed ? 'justify-center px-0' : 'justify-end')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
