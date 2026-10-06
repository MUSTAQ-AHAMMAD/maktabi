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
import api from '@/lib/api';
import { BookOpen, Plus, Search, Trash2, Eye, FileText, Scale, BookMarked, ClipboardList, FileCheck, FileSignature } from 'lucide-react';

const TYPES = ['TEMPLATE', 'CONTRACT_TEMPLATE', 'REGULATION', 'PRECEDENT', 'GUIDE', 'FORM'];
const typeIcon: Record<string, any> = { TEMPLATE: FileText, CONTRACT_TEMPLATE: FileSignature, REGULATION: Scale, PRECEDENT: BookMarked, GUIDE: ClipboardList, FORM: FileCheck };
const typeColor: Record<string, string> = {
  TEMPLATE: 'text-blue-600 bg-blue-500/10', CONTRACT_TEMPLATE: 'text-indigo-600 bg-indigo-500/10', REGULATION: 'text-purple-600 bg-purple-500/10',
  PRECEDENT: 'text-teal-600 bg-teal-500/10', GUIDE: 'text-amber-600 bg-amber-500/10', FORM: 'text-rose-600 bg-rose-500/10',
};
const emptyForm = { title: '', type: 'TEMPLATE', category: '', description: '', content: '', tags: '' };

export default function LibraryPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const params: Record<string, string> = {}; if (type !== 'ALL') params.type = type; if (search) params.search = search; const r = await api.get('/library', { params }); setItems(r.data); } catch {}
  }, [type, search]);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (it: any) => { setEditing(it); setForm({ title: it.title, type: it.type, category: it.category || '', description: it.description || '', content: it.content || '', tags: (it.tags || []).join(', ') }); setDialogOpen(true); };
  const save = async () => {
    if (!form.title.trim()) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) };
      if (editing) await api.put(`/library/${editing.id}`, payload); else await api.post('/library', payload);
      toast({ title: editing ? t('common.updated') : t('common.create') }); setDialogOpen(false); load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const remove = async (it: any) => { if (!confirm(`${t('common.delete')}?`)) return; try { await api.delete(`/library/${it.id}`); load(); } catch {} };
  const open = async (it: any) => { try { const r = await api.get(`/library/${it.id}`); setViewItem(r.data); } catch { setViewItem(it); } };

  return (
    <AppLayout title={t('library.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><BookOpen className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('library.title')}</h1><p className="text-sm text-muted-foreground">{t('library.subtitle')}</p></div>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('library.new')}</Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('common.search')}…`} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setType('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('common.all')}</button>
            {TYPES.map(ty => <button key={ty} onClick={() => setType(ty)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === ty ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t(`library.types.${ty}`)}</button>)}
          </div>
        </div>

        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
          : items.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="font-medium text-foreground">{t('library.empty')}</p><p className="text-sm text-muted-foreground mb-4">{t('library.emptyHint')}</p><Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> {t('library.new')}</Button></div>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(it => {
                const Icon = typeIcon[it.type] || FileText;
                return (
                  <div key={it.id} className="group bg-card border border-border rounded-xl p-4 card-hover-glow flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-lg ${typeColor[it.type]}`}><Icon className="w-4 h-4" /></div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{t(`library.types.${it.type}`)}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mt-3 line-clamp-2">{it.title}</h3>
                    {it.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{it.description}</p>}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">{(it.tags || []).slice(0, 3).map((tag: string) => <span key={tag} className="text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">#{tag}</span>)}</div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{it.views} {t('library.views')}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => open(it)}>{t('library.readMore')}</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openEdit(it)}><FileText className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(it)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewItem} onOpenChange={o => !o && setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          {viewItem && <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`px-2 py-0.5 rounded-full ${typeColor[viewItem.type]}`}>{t(`library.types.${viewItem.type}`)}</span>{viewItem.category && <span>· {viewItem.category}</span>}</div>
            {viewItem.description && <p className="text-sm text-muted-foreground">{viewItem.description}</p>}
            <div className="bg-muted/40 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">{viewItem.content || '—'}</div>
          </div>}
        </DialogContent>
      </Dialog>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('library.edit') : t('library.new')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.name')}<span className="text-destructive ms-0.5">*</span></label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.type')}</label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(ty => <SelectItem key={ty} value={ty}>{t(`library.types.${ty}`)}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('library.category')}</label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.notes')}</label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('library.content')}</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('library.tags')}</label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="employment, contract" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
