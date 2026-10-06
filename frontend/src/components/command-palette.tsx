'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLocale } from '@/i18n/locale-provider';
import api from '@/lib/api';
import {
  Search, LayoutDashboard, TrendingUp, ListTodo, Contact, Scale, FileText, Briefcase,
  DollarSign, Receipt, FileSpreadsheet, Wallet, Landmark, FileSignature, BookOpen,
  MessageSquare, Palmtree, Calendar, Bell, Users, Shield, Tag, Plus, CornerDownLeft, Search as SearchIcon,
} from 'lucide-react';

interface Cmd { id: string; label: string; sublabel?: string; href: string; icon: any; group: string; }
interface Hit { type: string; id: string; label: string; sublabel: string; href: string; }

const typeIcon: Record<string, any> = {
  contact: Contact, litigation: Scale, contract: Briefcase, invoice: Receipt, task: ListTodo,
  consultation: FileText, investigation: Search, library: BookOpen, poa: FileSignature,
};

export function CommandPalette() {
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // navigation + quick-action commands
  const navCommands: Cmd[] = [
    ['dashboard', '/dashboard', LayoutDashboard], ['insights', '/insights', TrendingUp], ['tasks', '/tasks', ListTodo],
    ['contacts', '/contacts', Contact], ['litigation', '/litigation', Scale], ['investigations', '/investigations', Search],
    ['consultations', '/consultations', FileText], ['contracts', '/contracts', Briefcase], ['poa', '/poa', FileSignature],
    ['financial', '/financial', DollarSign], ['invoices', '/invoices', Receipt], ['estimates', '/estimates', FileSpreadsheet],
    ['expenses', '/expenses', Wallet], ['treasury', '/treasury', Landmark], ['library', '/library', BookOpen],
    ['messages', '/messages', MessageSquare], ['leaves', '/leaves', Palmtree], ['calendar', '/calendar', Calendar],
    ['notifications', '/notifications', Bell], ['users', '/users', Users], ['audit', '/audit', Shield], ['brands', '/brands', Tag],
  ].map(([key, href, icon]) => ({ id: `nav-${key}`, label: t(`nav.${key}`), href: href as string, icon, group: t('nav.practice') }));

  const quickActions: Cmd[] = [
    { id: 'qa-task', label: `${t('common.create')}: ${t('tasks.title')}`, href: '/tasks', icon: Plus, group: 'quick' },
    { id: 'qa-contact', label: `${t('common.create')}: ${t('contacts.newContact')}`, href: '/contacts', icon: Plus, group: 'quick' },
    { id: 'qa-invoice', label: `${t('common.create')}: ${t('invoices.new')}`, href: '/invoices', icon: Plus, group: 'quick' },
    { id: 'qa-case', label: `${t('common.create')}: ${t('nav.litigation')}`, href: '/litigation/new', icon: Plus, group: 'quick' },
  ];

  const q = query.trim().toLowerCase();
  const filteredNav = q ? navCommands.filter((c) => c.label.toLowerCase().includes(q)) : navCommands;
  const filteredQuick = q ? quickActions.filter((c) => c.label.toLowerCase().includes(q)) : quickActions.slice(0, 4);
  const items: (Cmd | (Hit & { icon?: any }))[] = [...filteredQuick, ...filteredNav, ...hits];

  // global ⌘K / Ctrl+K + custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen as EventListener);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-command-palette', onOpen as EventListener); };
  }, []);

  useEffect(() => { if (open) { setQuery(''); setHits([]); setActive(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { setActive(0); }, [query]);

  // debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setHits([]); return; }
    debounceRef.current = setTimeout(async () => {
      try { const r = await api.get('/search', { params: { q: query } }); setHits(r.data.results || []); } catch { setHits([]); }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, q]);

  const go = useCallback((href: string) => { setOpen(false); router.push(href); }, [router]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); const it = items[active]; if (it) go(it.href); }
  };

  const groupLabel: Record<string, string> = { quick: t('common.actions') };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden top-[20%] translate-y-0">
        <DialogTitle className="sr-only">{t('common.search')}</DialogTitle>
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <SearchIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onInputKey}
            placeholder={`${t('common.search')}… (⌘K)`}
            className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t('common.noData')}</div>
          ) : (
            <div className="space-y-0.5">
              {items.map((it, i) => {
                const isHit = 'type' in it;
                const Icon = isHit ? (typeIcon[(it as Hit).type] || FileText) : (it as Cmd).icon;
                return (
                  <button
                    key={('id' in it ? it.id : '') + i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors ${active === i ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{it.label}</p>
                      {isHit && (it as Hit).sublabel && <p className="text-xs text-muted-foreground truncate">{(it as Hit).sublabel}</p>}
                    </div>
                    {isHit && <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 shrink-0">{(it as Hit).type}</span>}
                    {active === i && <CornerDownLeft className="w-3.5 h-3.5 shrink-0 opacity-50" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
