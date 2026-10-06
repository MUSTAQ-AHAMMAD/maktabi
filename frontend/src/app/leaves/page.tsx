'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/i18n/locale-provider';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Palmtree, Plus, Check, X, CalendarDays, Clock } from 'lucide-react';

const TYPES = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'EMERGENCY', 'OTHER'];
const statusStyle: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-slate-100 text-slate-500 dark:bg-slate-800',
};
const MANAGER_ROLES = ['ADMIN', 'HR', 'LEGAL_MANAGER', 'CEO', 'DEPARTMENT_MANAGER'];

export default function LeavesPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isManager = user && MANAGER_ROLES.includes(user.role);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Default 'all'; the backend already scopes non-managers to their own records.
  const [scope, setScope] = useState<'mine' | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'ANNUAL', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), reason: '' });

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (scope === 'mine') params.mine = 'true';
      const [l, b] = await Promise.all([api.get('/leaves', { params }), api.get('/leaves/balance')]);
      setLeaves(l.data); setBalance(b.data);
    } catch {}
  }, [scope]);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const save = async () => {
    setSaving(true);
    try { await api.post('/leaves', form); toast({ title: t('common.create') }); setDialogOpen(false); setForm({ type: 'ANNUAL', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), reason: '' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const decide = async (id: string, action: 'approve' | 'reject') => { try { await api.patch(`/leaves/${id}/${action}`); load(); } catch {} };
  const cancel = async (id: string) => { if (!confirm(`${t('common.cancel')}?`)) return; try { await api.delete(`/leaves/${id}`); load(); } catch {} };

  return (
    <AppLayout title={t('leaves.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Palmtree className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('leaves.title')}</h1><p className="text-sm text-muted-foreground">{t('leaves.subtitle')}</p></div>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 me-1.5" /> {t('leaves.new')}</Button>
        </div>

        {/* Balance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {balance && [
            { label: t('leaves.entitlement'), value: balance.entitlement, icon: CalendarDays, cls: 'from-blue-500 to-indigo-500' },
            { label: t('leaves.remaining'), value: balance.remaining, icon: Palmtree, cls: 'from-green-500 to-emerald-500' },
            { label: `${t('leaves.used')} (${t('leaves.types.ANNUAL')})`, value: balance.usedAnnual, icon: CalendarDays, cls: 'from-amber-500 to-orange-500' },
            { label: t('leaves.pending'), value: balance.pending, icon: Clock, cls: 'from-purple-500 to-fuchsia-500' },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 card-hover-glow">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${k.cls}`}><k.icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-2xl font-bold text-foreground tabular-nums">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
            </div>
          ))}
        </div>

        {isManager && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setScope('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scope === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('common.all')}</button>
            <button onClick={() => setScope('mine')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scope === 'mine' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{locale === 'ar' ? 'طلباتي' : 'Mine'}</button>
          </div>
        )}

        {loading ? <Skeleton className="h-80 rounded-xl" /> : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center"><Palmtree className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="font-medium text-foreground">{t('leaves.empty')}</p><p className="text-sm text-muted-foreground">{t('leaves.emptyHint')}</p></div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr>
                  <th className="text-start font-semibold px-4 py-3">{t('leaves.requestedBy')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('common.type')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('leaves.startDate')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('leaves.endDate')}</th>
                  <th className="text-center font-semibold px-4 py-3">{t('leaves.days')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3" />
                </tr></thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-3 text-foreground">{l.user ? `${l.user.firstName} ${l.user.lastName}` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t(`leaves.types.${l.type}`)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(l.startDate, locale)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(l.endDate, locale)}</td>
                      <td className="px-4 py-3 text-center tabular-nums text-foreground">{l.days}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[l.status]}`}>{t(`leaves.statuses.${l.status}`)}</span></td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {isManager && l.status === 'PENDING' && <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title={t('leaves.approve')} onClick={() => decide(l.id, 'approve')}><Check className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title={t('leaves.reject')} onClick={() => decide(l.id, 'reject')}><X className="w-4 h-4" /></Button>
                          </>}
                          {l.status === 'PENDING' && l.user?.id === user?.id && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => cancel(l.id)}>{t('common.cancel')}</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('leaves.new')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.type')}</label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(ty => <SelectItem key={ty} value={ty}>{t(`leaves.types.${ty}`)}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('leaves.startDate')}</label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('leaves.endDate')}</label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('leaves.reason')}</label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('leaves.new')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
