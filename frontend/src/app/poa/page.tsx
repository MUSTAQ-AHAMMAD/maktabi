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
import api from '@/lib/api';
import { FileSignature, Plus, Search, Trash2, Ban, ShieldCheck, Clock, ShieldX } from 'lucide-react';

const STATUSES = ['ACTIVE', 'EXPIRING', 'EXPIRED', 'REVOKED'];
const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  EXPIRING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  REVOKED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};
const emptyForm = { contactId: '', grantor: '', grantee: '', scope: '', issueDate: new Date().toISOString().slice(0, 10), expiryDate: '', notaryRef: '' };

export default function PoaPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (status !== 'ALL') params.status = status;
      if (search) params.search = search;
      const [list, sum] = await Promise.all([api.get('/poa', { params }), api.get('/poa/summary')]);
      setItems(list.data); setSummary(sum.data);
    } catch {}
  }, [status, search]);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); api.get('/contacts/options').then(r => setContacts(r.data)).catch(() => {}); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, contactId: contacts[0]?.id || '', grantor: contacts[0]?.name || '' }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ contactId: p.contactId, grantor: p.grantor, grantee: p.grantee, scope: p.scope, issueDate: p.issueDate?.slice(0, 10) || '', expiryDate: p.expiryDate?.slice(0, 10) || '', notaryRef: p.notaryRef || '' }); setDialogOpen(true); };

  const save = async () => {
    if (!form.contactId || !form.grantee.trim() || !form.scope.trim()) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, expiryDate: form.expiryDate || undefined };
      if (editing) await api.put(`/poa/${editing.id}`, payload); else await api.post('/poa', payload);
      toast({ title: editing ? t('common.updated') : t('common.create') });
      setDialogOpen(false); load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const revoke = async (p: any) => { if (!confirm(t('poa.revokeConfirm'))) return; try { await api.patch(`/poa/${p.id}/revoke`); load(); } catch {} };
  const remove = async (p: any) => { if (!confirm(`${t('common.delete')}?`)) return; try { await api.delete(`/poa/${p.id}`); load(); } catch {} };

  const kpis = summary ? [
    { label: t('poa.statuses.ACTIVE'), value: summary.ACTIVE, icon: ShieldCheck, cls: 'text-green-600 bg-green-500/10' },
    { label: t('poa.statuses.EXPIRING'), value: summary.EXPIRING, icon: Clock, cls: 'text-amber-600 bg-amber-500/10' },
    { label: t('poa.statuses.EXPIRED'), value: summary.EXPIRED, icon: ShieldX, cls: 'text-red-600 bg-red-500/10' },
    { label: t('poa.statuses.REVOKED'), value: summary.REVOKED, icon: Ban, cls: 'text-slate-500 bg-slate-500/10' },
  ] : [];

  return (
    <AppLayout title={t('poa.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><FileSignature className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('poa.title')}</h1><p className="text-sm text-muted-foreground">{t('poa.subtitle')}</p></div>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('poa.new')}</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-xl p-4 card-hover-glow flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${k.cls}`}><k.icon className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-foreground tabular-nums">{k.value ?? 0}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('common.search')}…`} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setStatus('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('common.all')}</button>
            {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t(`poa.statuses.${s}`)}</button>)}
          </div>
        </div>

        {loading ? <Skeleton className="h-96 rounded-xl" /> : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center"><FileSignature className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="font-medium text-foreground">{t('poa.empty')}</p><p className="text-sm text-muted-foreground mb-4">{t('poa.emptyHint')}</p><Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('poa.new')}</Button></div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr>
                  <th className="text-start font-semibold px-4 py-3">{t('poa.number')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('poa.grantor')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('poa.grantee')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('poa.expiryDate')}</th>
                  <th className="text-start font-semibold px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3" />
                </tr></thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={() => openEdit(p)}>
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground" dir="ltr">{p.number}</td>
                      <td className="px-4 py-3 text-foreground">{p.grantor}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.grantee}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.expiryDate, locale)}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[p.effectiveStatus]}`}>{t(`poa.statuses.${p.effectiveStatus}`)}</span></td>
                      <td className="px-4 py-3 text-end" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {p.effectiveStatus !== 'REVOKED' && <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title={t('poa.revoke')} onClick={() => revoke(p)}><Ban className="w-3.5 h-3.5" /></Button>}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? `${t('poa.edit')} · ${editing.number}` : t('poa.new')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('nav.contacts')}<span className="text-destructive ms-0.5">*</span></label>
              <Select value={form.contactId} onValueChange={v => { const c = contacts.find(x => x.id === v); setForm({ ...form, contactId: v, grantor: c?.name || form.grantor }); }}>
                <SelectTrigger><SelectValue placeholder={t('nav.contacts')} /></SelectTrigger><SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.grantor')}</label><Input value={form.grantor} onChange={e => setForm({ ...form, grantor: e.target.value })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.grantee')}<span className="text-destructive ms-0.5">*</span></label><Input value={form.grantee} onChange={e => setForm({ ...form, grantee: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.scope')}<span className="text-destructive ms-0.5">*</span></label>
              <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.issueDate')}</label><Input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.expiryDate')}</label><Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('poa.notaryRef')}</label><Input value={form.notaryRef} onChange={e => setForm({ ...form, notaryRef: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
