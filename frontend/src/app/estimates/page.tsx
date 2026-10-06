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
import { money, num, formatDate } from '@/lib/format';
import api from '@/lib/api';
import { FileSpreadsheet, Plus, Trash2, X, ArrowRightLeft } from 'lucide-react';

interface Item { description: string; quantity: number; unitPrice: number; }
const STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CONVERTED'];
const statusStyle: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  EXPIRED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  CONVERTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function EstimatesPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [estimates, setEstimates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ contactId: string; validUntil: string; taxRate: number; items: Item[] }>({ contactId: '', validUntil: '', taxRate: 15, items: [{ description: '', quantity: 1, unitPrice: 0 }] });

  const load = useCallback(async () => {
    try { const params: Record<string, string> = {}; if (status !== 'ALL') params.status = status; const r = await api.get('/estimates', { params }); setEstimates(r.data); } catch {}
  }, [status]);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); api.get('/contacts/options').then(r => setContacts(r.data)).catch(() => {}); }, [load]);

  const liveSubtotal = form.items.reduce((a, it) => a + num(it.quantity) * num(it.unitPrice), 0);
  const liveTotal = liveSubtotal * (1 + num(form.taxRate) / 100);
  const setItem = (i: number, patch: Partial<Item>) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));

  const openCreate = () => { setForm({ contactId: contacts[0]?.id || '', validUntil: '', taxRate: 15, items: [{ description: '', quantity: 1, unitPrice: 0 }] }); setDialogOpen(true); };
  const save = async () => {
    if (!form.contactId || form.items.filter(i => i.description.trim()).length === 0) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try { await api.post('/estimates', { ...form, validUntil: form.validUntil || undefined, items: form.items.filter(i => i.description.trim()) }); toast({ title: t('common.create') }); setDialogOpen(false); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const convert = async (est: any) => {
    if (!confirm(`${t('estimates.convert')}?`)) return;
    try { const r = await api.post(`/estimates/${est.id}/convert`); toast({ title: t('estimates.convert'), description: r.data.number }); load(); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };
  const remove = async (id: string) => { if (!confirm(`${t('common.delete')}?`)) return; try { await api.delete(`/estimates/${id}`); load(); } catch {} };

  return (
    <AppLayout title={t('estimates.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><FileSpreadsheet className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('estimates.title')}</h1><p className="text-sm text-muted-foreground">{t('estimates.subtitle')}</p></div>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('estimates.new')}</Button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setStatus('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('common.all')}</button>
          {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t(`estimates.statuses.${s}`)}</button>)}
        </div>

        {loading ? <Skeleton className="h-96 rounded-xl" /> : estimates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center"><FileSpreadsheet className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="font-medium text-foreground">{t('estimates.empty')}</p><p className="text-sm text-muted-foreground mb-4">{t('estimates.emptyHint')}</p><Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('estimates.new')}</Button></div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr>
                  <th className="text-start font-semibold px-4 py-3">{t('invoices.number')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('invoices.client')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('estimates.validUntil')}</th>
                  <th className="text-end font-semibold px-4 py-3">{t('invoices.total')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3" />
                </tr></thead>
                <tbody>
                  {estimates.map(est => (
                    <tr key={est.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground" dir="ltr">{est.number}</td>
                      <td className="px-4 py-3 text-foreground">{est.contact?.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(est.validUntil, locale)}</td>
                      <td className="px-4 py-3 text-end font-semibold text-foreground tabular-nums">{money(est.total)}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[est.status]}`}>{t(`estimates.statuses.${est.status}`)}</span></td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {est.status !== 'CONVERTED' && <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => convert(est)}><ArrowRightLeft className="w-3.5 h-3.5 me-1" />{t('estimates.convert')}</Button>}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(est.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('estimates.new')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('invoices.client')}<span className="text-destructive ms-0.5">*</span></label>
                <Select value={form.contactId} onValueChange={v => setForm({ ...form, contactId: v })}><SelectTrigger><SelectValue placeholder={t('invoices.client')} /></SelectTrigger><SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('estimates.validUntil')}</label><Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-xs font-semibold text-muted-foreground uppercase">{t('invoices.description')}</label><Button variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0 }] }))} className="h-7 text-xs"><Plus className="w-3 h-3 me-1" />{t('invoices.addItem')}</Button></div>
              {form.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={it.description} onChange={e => setItem(i, { description: e.target.value })} placeholder={t('invoices.description')} className="flex-1" />
                  <Input type="number" value={it.quantity} onChange={e => setItem(i, { quantity: Number(e.target.value) })} className="w-16 text-center" />
                  <Input type="number" value={it.unitPrice} onChange={e => setItem(i, { unitPrice: Number(e.target.value) })} className="w-28 text-end" />
                  <span className="w-24 text-end text-sm tabular-nums text-muted-foreground">{money(num(it.quantity) * num(it.unitPrice))}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} disabled={form.items.length === 1}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end"><div className="w-56 flex justify-between font-bold text-foreground pt-2 border-t border-border"><span>{t('invoices.total')}</span><span className="tabular-nums">{money(liveTotal)}</span></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
