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
import { money, moneyCompact, num, formatDate } from '@/lib/format';
import api from '@/lib/api';
import { Wallet, Plus, Trash2, Calendar as CalIcon } from 'lucide-react';

const CATEGORIES = ['COURT_FEES', 'FILING', 'TRAVEL', 'SALARY', 'OFFICE', 'MARKETING', 'SOFTWARE', 'CONSULTANT', 'OTHER'];
const catColor: Record<string, string> = {
  COURT_FEES: '#3b82f6', FILING: '#6366f1', TRAVEL: '#14b8a6', SALARY: '#8b5cf6', OFFICE: '#f59e0b',
  MARKETING: '#ec4899', SOFTWARE: '#06b6d4', CONSULTANT: '#22c55e', OTHER: '#94a3b8',
};

export default function ExpensesPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'OTHER', amount: 0, date: new Date().toISOString().slice(0, 10), vendor: '', notes: '' });

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (category !== 'ALL') params.category = category;
      const [ex, sum] = await Promise.all([api.get('/expenses', { params }), api.get('/expenses/summary')]);
      setExpenses(ex.data); setSummary(sum.data);
    } catch {}
  }, [category]);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const save = async () => {
    if (!form.title.trim() || !form.amount) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try { await api.post('/expenses', form); toast({ title: t('common.create'), description: form.title }); setDialogOpen(false); setForm({ title: '', category: 'OTHER', amount: 0, date: new Date().toISOString().slice(0, 10), vendor: '', notes: '' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };
  const remove = async (id: string) => { if (!confirm(`${t('common.delete')}?`)) return; try { await api.delete(`/expenses/${id}`); load(); } catch {} };

  const maxCat = summary ? Math.max(...summary.byCategory.map((c: any) => c.amount), 1) : 1;

  return (
    <AppLayout title={t('expenses.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Wallet className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('expenses.title')}</h1><p className="text-sm text-muted-foreground">{t('expenses.subtitle')}</p></div>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 me-1.5" /> {t('expenses.new')}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* summary cards */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t('expenses.totalSpent')}</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{money(summary?.total)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t('expenses.thisMonth')}</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{money(summary?.thisMonth)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">{t('expenses.byCategory')}</p>
              <div className="space-y-2">
                {summary?.byCategory.map((c: any) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-foreground">{t(`expenses.categories.${c.category}`)}</span><span className="text-muted-foreground tabular-nums">{moneyCompact(c.amount)}</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(c.amount / maxCat) * 100}%`, background: catColor[c.category] }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setCategory('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${category === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('common.all')}</button>
              {CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t(`expenses.categories.${c}`)}</button>)}
            </div>
            {loading ? <Skeleton className="h-96 rounded-xl" /> : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
                <Wallet className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="font-medium text-foreground">{t('expenses.empty')}</p><p className="text-sm text-muted-foreground">{t('expenses.emptyHint')}</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center gap-3 p-3.5 hover:bg-muted/40 group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${catColor[e.category]}20` }}><Wallet className="w-4 h-4" style={{ color: catColor[e.category] }} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2"><span>{t(`expenses.categories.${e.category}`)}</span>{e.vendor && <>· <span className="truncate">{e.vendor}</span></>}<span className="flex items-center gap-1"><CalIcon className="w-3 h-3" />{formatDate(e.date, locale)}</span></p>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums shrink-0">{money(e.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('expenses.new')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.name')}<span className="text-destructive ms-0.5">*</span></label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('expenses.category')}</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(`expenses.categories.${c}`)}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.amount')}<span className="text-destructive ms-0.5">*</span></label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.date')}</label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('expenses.vendor')}</label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
