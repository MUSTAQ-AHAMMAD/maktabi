'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { Receipt, Plus, Search, Trash2, CreditCard, Wallet, AlertTriangle, TrendingUp, X } from 'lucide-react';

interface Item { description: string; quantity: number; unitPrice: number; }
interface Invoice {
  id: string; number: string; status: string; issueDate: string; dueDate?: string;
  subtotal: string; taxAmount: string; total: string; paidAmount: string; taxRate: string; notes?: string;
  contact?: { id: string; name: string }; contactId: string; items?: Item[];
}
const STATUSES = ['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'];
const statusStyle: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800',
};

export default function InvoicesPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ contactId: string; dueDate: string; taxRate: number; notes: string; items: Item[] }>({ contactId: '', dueDate: '', taxRate: 15, notes: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
  const [payForm, setPayForm] = useState({ amount: 0, method: 'BANK_TRANSFER', reference: '' });

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (status !== 'ALL') params.status = status;
      if (search) params.search = search;
      const [inv, sum] = await Promise.all([api.get('/invoices', { params }), api.get('/invoices/summary')]);
      setInvoices(inv.data); setSummary(sum.data);
    } catch {}
  }, [status, search]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); api.get('/contacts/options').then(r => setContacts(r.data)).catch(() => {}); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ contactId: contacts[0]?.id || '', dueDate: '', taxRate: 15, notes: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] }); setDialogOpen(true); };
  const openEdit = async (inv: Invoice) => {
    try {
      const r = await api.get(`/invoices/${inv.id}`);
      const full = r.data;
      setEditing(full);
      setForm({ contactId: full.contactId, dueDate: full.dueDate ? full.dueDate.slice(0, 10) : '', taxRate: num(full.taxRate), notes: full.notes || '', items: (full.items || []).map((it: any) => ({ description: it.description, quantity: num(it.quantity), unitPrice: num(it.unitPrice) })) });
      setDialogOpen(true);
    } catch {}
  };

  const liveSubtotal = form.items.reduce((a, it) => a + num(it.quantity) * num(it.unitPrice), 0);
  const liveTax = liveSubtotal * (num(form.taxRate) / 100);
  const liveTotal = liveSubtotal + liveTax;

  const setItem = (i: number, patch: Partial<Item>) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0 }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.contactId) { toast({ title: t('common.required'), description: t('invoices.client'), variant: 'destructive' }); return; }
    if (form.items.filter(it => it.description.trim()).length === 0) { toast({ title: t('common.required'), description: t('invoices.addItem'), variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { contactId: form.contactId, dueDate: form.dueDate || undefined, taxRate: form.taxRate, notes: form.notes, items: form.items.filter(it => it.description.trim()) };
      if (editing) await api.put(`/invoices/${editing.id}`, payload);
      else await api.post('/invoices', payload);
      toast({ title: editing ? t('common.updated') : t('common.create') });
      setDialogOpen(false); load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const openPay = (inv: Invoice) => { setEditing(inv); setPayForm({ amount: num(inv.total) - num(inv.paidAmount), method: 'BANK_TRANSFER', reference: '' }); setPayOpen(true); };
  const recordPayment = async () => {
    if (!editing) return;
    setSaving(true);
    try { await api.post(`/invoices/${editing.id}/payments`, payForm); toast({ title: t('invoices.recordPayment'), description: money(payForm.amount) }); setPayOpen(false); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const remove = async (inv: Invoice) => { if (!confirm(`${t('common.delete')} ${inv.number}?`)) return; try { await api.delete(`/invoices/${inv.id}`); load(); } catch {} };

  const kpis = summary ? [
    { label: t('invoices.billed'), value: summary.billed, icon: TrendingUp, cls: 'from-blue-500 to-indigo-500' },
    { label: t('invoices.collected'), value: summary.collected, icon: Wallet, cls: 'from-green-500 to-emerald-500' },
    { label: t('invoices.outstanding'), value: summary.outstanding, icon: Receipt, cls: 'from-amber-500 to-orange-500' },
    { label: t('invoices.overdue'), value: summary.overdue, icon: AlertTriangle, cls: 'from-rose-500 to-red-500' },
  ] : [];

  return (
    <AppLayout title={t('invoices.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Receipt className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('invoices.title')}</h1><p className="text-sm text-muted-foreground">{t('invoices.subtitle')}</p></div>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('invoices.new')}</Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-xl p-4 card-hover-glow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{k.label}</p>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${k.cls}`}><k.icon className="w-3.5 h-3.5 text-white" /></div>
              </div>
              <p className="text-xl font-bold text-foreground mt-2 tabular-nums">{moneyCompact(k.value)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('common.search')}…`} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setStatus('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>{t('common.all')}</button>
            {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>{t(`invoices.statuses.${s}`)}</button>)}
          </div>
        </div>

        {/* Table */}
        {loading ? <Skeleton className="h-96 rounded-xl" /> : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">{t('invoices.empty')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('invoices.emptyHint')}</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('invoices.new')}</Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="text-start font-semibold px-4 py-3">{t('invoices.number')}</th>
                    <th className="text-start font-semibold px-4 py-3">{t('invoices.client')}</th>
                    <th className="text-start font-semibold px-4 py-3">{t('invoices.dueDate')}</th>
                    <th className="text-end font-semibold px-4 py-3">{t('invoices.total')}</th>
                    <th className="text-end font-semibold px-4 py-3">{t('invoices.balance')}</th>
                    <th className="text-start font-semibold px-4 py-3">{t('common.status')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const balance = num(inv.total) - num(inv.paidAmount);
                    return (
                      <tr key={inv.id} className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={() => openEdit(inv)}>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-foreground" dir="ltr">{inv.number}</td>
                        <td className="px-4 py-3 text-foreground">{inv.contact?.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.dueDate, locale)}</td>
                        <td className="px-4 py-3 text-end font-semibold text-foreground tabular-nums">{money(inv.total)}</td>
                        <td className={`px-4 py-3 text-end tabular-nums ${balance > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>{money(balance)}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[inv.status]}`}>{t(`invoices.statuses.${inv.status}`)}</span></td>
                        <td className="px-4 py-3 text-end" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title={t('invoices.recordPayment')} onClick={() => openPay(inv)}><CreditCard className="w-3.5 h-3.5" /></Button>}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(inv)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `${t('invoices.edit')} · ${editing.number}` : t('invoices.new')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('invoices.client')}<span className="text-destructive ms-0.5">*</span></label>
                <Select value={form.contactId} onValueChange={v => setForm({ ...form, contactId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('invoices.client')} /></SelectTrigger>
                  <SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('invoices.dueDate')}</label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('invoices.description')}</label>
                <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs"><Plus className="w-3 h-3 me-1" />{t('invoices.addItem')}</Button>
              </div>
              <div className="space-y-2">
                {form.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={it.description} onChange={e => setItem(i, { description: e.target.value })} placeholder={t('invoices.description')} className="flex-1" />
                    <Input type="number" value={it.quantity} onChange={e => setItem(i, { quantity: Number(e.target.value) })} className="w-16 text-center" title={t('invoices.qty')} />
                    <Input type="number" value={it.unitPrice} onChange={e => setItem(i, { unitPrice: Number(e.target.value) })} className="w-28 text-end" title={t('invoices.unitPrice')} />
                    <span className="w-24 text-end text-sm tabular-nums text-muted-foreground">{money(num(it.quantity) * num(it.unitPrice))}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeItem(i)} disabled={form.items.length === 1}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>{t('invoices.subtotal')}</span><span className="tabular-nums">{money(liveSubtotal)}</span></div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1">{t('invoices.tax')}
                    <Input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-14 h-6 text-xs text-center px-1" /> %
                  </span>
                  <span className="tabular-nums">{money(liveTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-border"><span>{t('invoices.total')}</span><span className="tabular-nums">{money(liveTotal)}</span></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('invoices.recordPayment')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('invoices.paymentAmount')}</label>
              <Input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('invoices.method')}</label>
              <Select value={payForm.method} onValueChange={v => setPayForm({ ...payForm, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('invoices.reference')}</label>
              <Input value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={recordPayment} disabled={saving}>{saving ? t('common.saving') : t('invoices.recordPayment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
