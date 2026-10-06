'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/i18n/locale-provider';
import api from '@/lib/api';
import {
  Contact as ContactIcon, Plus, Search, Mail, Phone, MapPin, Building2,
  Pencil, Trash2, Briefcase, ListTodo, FileText, Users,
} from 'lucide-react';

interface Contact {
  id: string; type: string; name: string; company?: string; email?: string; phone?: string;
  address?: string; city?: string; country?: string; nationalId?: string; notes?: string;
  isActive: boolean; createdAt: string;
  _count?: { tasks: number; invoices: number; estimates: number; powersOfAttorney: number };
}

const TYPES = ['CLIENT', 'COUNTERPARTY', 'VENDOR', 'COURT', 'EXPERT', 'OTHER'];
const typeStyle: Record<string, string> = {
  CLIENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COUNTERPARTY: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  VENDOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  COURT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  EXPERT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const emptyForm = { name: '', type: 'CLIENT', company: '', email: '', phone: '', city: '', country: 'Saudi Arabia', nationalId: '', notes: '' };

export default function ContactsPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (search) params.search = search;
      const r = await api.get('/contacts', { params });
      setContacts(r.data);
    } catch { /* empty state handles it */ }
  }, [typeFilter, search]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, company: c.company || '', email: c.email || '', phone: c.phone || '', city: c.city || '', country: c.country || 'Saudi Arabia', nationalId: c.nationalId || '', notes: c.notes || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (form.name.trim().length < 2) { toast({ title: t('common.required'), description: t('common.name'), variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, email: form.email || undefined };
      if (editing) await api.put(`/contacts/${editing.id}`, payload);
      else await api.post('/contacts', payload);
      toast({ title: editing ? t('common.updated') : t('common.create'), description: form.name });
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: 'Error', description: 'Could not save contact', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const remove = async (c: Contact) => {
    if (!confirm(t('contacts.deleteConfirm'))) return;
    try { await api.delete(`/contacts/${c.id}`); toast({ title: t('common.delete'), description: c.name }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const counts = TYPES.reduce((acc, ty) => { acc[ty] = contacts.filter(c => c.type === ty).length; return acc; }, {} as Record<string, number>);

  return (
    <AppLayout title={t('contacts.title')}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><ContactIcon className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('contacts.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('contacts.subtitle')}</p>
            </div>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('contacts.newContact')}</Button>
        </motion.div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button onClick={() => setTypeFilter('ALL')}
            className={`rounded-xl border p-3 text-start transition-all ${typeFilter === 'ALL' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30'}`}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide"><Users className="w-3.5 h-3.5" />{t('common.all')}</div>
            <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{contacts.length}</div>
          </button>
          {TYPES.slice(0, 5).map(ty => (
            <button key={ty} onClick={() => setTypeFilter(ty)}
              className={`rounded-xl border p-3 text-start transition-all ${typeFilter === ty ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30'}`}>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">{t(`contacts.types.${ty}`)}</div>
              <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{counts[ty] || 0}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('contacts.searchPlaceholder')} className="ltr:pl-9 rtl:pr-9" />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ContactIcon className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">{t('contacts.empty')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('contacts.emptyHint')}</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('contacts.newContact')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {contacts.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                className="group bg-card border border-border rounded-xl p-4 card-hover-glow">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 min-w-0 group/link">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate group-hover/link:text-primary transition-colors">{c.name}</p>
                      {c.company && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Building2 className="w-3 h-3" />{c.company}</p>}
                    </div>
                  </Link>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeStyle[c.type]}`}>{t(`contacts.types.${c.type}`)}</span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  {c.email && <p className="flex items-center gap-2 text-muted-foreground truncate"><Mail className="w-3.5 h-3.5 shrink-0" />{c.email}</p>}
                  {c.phone && <p className="flex items-center gap-2 text-muted-foreground truncate" dir="ltr"><Phone className="w-3.5 h-3.5 shrink-0" />{c.phone}</p>}
                  {c.city && <p className="flex items-center gap-2 text-muted-foreground truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{c.city}{c.country ? `, ${c.country}` : ''}</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title={t('nav.tasks')}><ListTodo className="w-3.5 h-3.5" />{c._count?.tasks ?? 0}</span>
                    <span className="flex items-center gap-1" title={t('nav.invoices')}><FileText className="w-3.5 h-3.5" />{c._count?.invoices ?? 0}</span>
                    <span className="flex items-center gap-1" title={t('nav.poa')}><Briefcase className="w-3.5 h-3.5" />{c._count?.powersOfAttorney ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? t('contacts.editContact') : t('contacts.newContact')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t('common.name')} required>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label={t('common.type')}>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(ty => <SelectItem key={ty} value={ty}>{t(`contacts.types.${ty}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('common.company')}>
              <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label={t('contacts.nationalId')}>
              <Input value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} />
            </Field>
            <Field label={t('common.email')}>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label={t('common.phone')}>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </Field>
            <Field label={t('common.city')}>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label={t('common.country')}>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t('common.notes')}>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full min-h-[70px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive ms-0.5">*</span>}</label>
      {children}
    </div>
  );
}
