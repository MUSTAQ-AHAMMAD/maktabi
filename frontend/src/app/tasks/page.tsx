'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ListTodo, Plus, LayoutGrid, List, Calendar as CalIcon, AlertTriangle,
  Trash2, GripVertical, User as UserIcon, Building2,
} from 'lucide-react';

interface Task {
  id: string; title: string; description?: string; status: string; priority: string;
  dueDate?: string | null; assigneeId?: string | null; contactId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string } | null;
  contact?: { id: string; name: string } | null;
}
interface Person { id: string; firstName: string; lastName: string; }
interface ContactOpt { id: string; name: string; }

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const colHeader: Record<string, string> = {
  TODO: 'border-slate-400', IN_PROGRESS: 'border-blue-500', IN_REVIEW: 'border-amber-500', DONE: 'border-green-500',
};
const priStyle: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const emptyForm = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '', contactId: '' };

export default function TasksPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [contacts, setContacts] = useState<ContactOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { const r = await api.get('/tasks'); setTasks(r.data); } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    api.get('/contacts/options').then(r => setContacts(r.data)).catch(() => {});
    api.get('/users').then(r => setPeople(r.data)).catch(() => {}); // managers/admins only
  }, [load]);

  const openCreate = (status = 'TODO') => { setEditing(null); setForm({ ...emptyForm, status }); setDialogOpen(true); };
  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title, description: task.description || '', status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '', assigneeId: task.assigneeId || '', contactId: task.contactId || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (form.title.trim().length < 2) { toast({ title: t('common.required'), description: t('common.name'), variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title, description: form.description || undefined, status: form.status, priority: form.priority,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined, contactId: form.contactId || undefined,
      };
      if (editing) await api.put(`/tasks/${editing.id}`, payload);
      else await api.post('/tasks', payload);
      toast({ title: editing ? t('common.updated') : t('common.create'), description: form.title });
      setDialogOpen(false); load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const remove = async (task: Task) => {
    if (!confirm(`${t('common.delete')}?`)) return;
    try { await api.delete(`/tasks/${task.id}`); load(); } catch {}
  };

  const moveTo = async (taskId: string, status: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === status) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t)); // optimistic
    try { await api.patch(`/tasks/${taskId}/status`, { status }); }
    catch { load(); toast({ title: 'Error', variant: 'destructive' }); }
  };

  const dueMeta = (due?: string | null) => {
    if (!due) return null;
    const d = new Date(due); const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    const label = d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' });
    if (diff < 0) return { label, cls: 'text-red-600', tag: t('tasks.overdue') };
    if (diff === 0) return { label, cls: 'text-amber-600', tag: t('tasks.dueToday') };
    return { label, cls: 'text-muted-foreground', tag: '' };
  };

  const initials = (p?: { firstName: string; lastName: string } | null) => p ? `${p.firstName[0]}${p.lastName[0]}` : '';

  const TaskCard = ({ task }: { task: Task }) => {
    const due = dueMeta(task.dueDate);
    return (
      <div
        draggable
        onDragStart={() => setDragId(task.id)}
        onDragEnd={() => setDragId(null)}
        onClick={() => openEdit(task)}
        className={`group bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all ${dragId === task.id ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
          <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100" />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priStyle[task.priority]}`}>{t(`tasks.priorities.${task.priority}`)}</span>
          {due && (
            <span className={`text-[11px] flex items-center gap-1 ${due.cls}`}>
              {due.tag ? <AlertTriangle className="w-3 h-3" /> : <CalIcon className="w-3 h-3" />}{due.tag || due.label}
            </span>
          )}
        </div>
        {(task.contact || task.assignee) && (
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
            {task.contact ? (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate"><Building2 className="w-3 h-3 shrink-0" />{task.contact.name}</span>
            ) : <span />}
            {task.assignee && (
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0" title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
                {initials(task.assignee)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout title={t('tasks.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><ListTodo className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('tasks.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('tasks.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border p-0.5">
              <button onClick={() => setView('board')} className={`p-1.5 rounded-md ${view === 'board' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} title={t('tasks.board')}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} title={t('tasks.list')}><List className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => openCreate()}><Plus className="w-4 h-4 me-1.5" /> {t('tasks.newTask')}</Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          </div>
        ) : view === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const items = tasks.filter(t => t.status === col);
              return (
                <div key={col}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragId) moveTo(dragId, col); setDragId(null); }}
                  className={`rounded-xl bg-muted/40 border-t-2 ${colHeader[col]} p-3 min-h-[200px]`}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-foreground">{t(`tasks.statuses.${col}`)}</h3>
                    <span className="text-xs font-bold text-muted-foreground bg-background rounded-full px-2 py-0.5 tabular-nums">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(task => <TaskCard key={task.id} task={task} />)}
                    <button onClick={() => openCreate(col)} className="w-full text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg border border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> {t('common.add')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-start">
                    <th className="text-start font-medium px-4 py-2.5">{t('common.name')}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t('common.status')}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t('common.priority')}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t('common.dueDate')}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t('common.assignee')}</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const due = dueMeta(task.dueDate);
                    return (
                      <tr key={task.id} className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={() => openEdit(task)}>
                        <td className="px-4 py-2.5 font-medium text-foreground">{task.title}</td>
                        <td className="px-4 py-2.5"><span className="text-xs">{t(`tasks.statuses.${task.status}`)}</span></td>
                        <td className="px-4 py-2.5"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priStyle[task.priority]}`}>{t(`tasks.priorities.${task.priority}`)}</span></td>
                        <td className={`px-4 py-2.5 ${due?.cls || 'text-muted-foreground'}`}>{due ? (due.tag || due.label) : t('tasks.noDue')}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : t('common.unassigned')}</td>
                        <td className="px-4 py-2.5 text-end"><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); remove(task); }}><Trash2 className="w-3.5 h-3.5" /></Button></td>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? t('tasks.editTask') : t('tasks.newTask')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('common.name')}<span className="text-destructive ms-0.5">*</span></label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('common.notes')}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('common.status')}</label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'].map(s => <SelectItem key={s} value={s}>{t(`tasks.statuses.${s}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('common.priority')}</label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{t(`tasks.priorities.${p}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('common.dueDate')}</label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('common.assignee')}</label>
                <Select value={form.assigneeId || 'NONE'} onValueChange={v => setForm({ ...form, assigneeId: v === 'NONE' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder={t('common.unassigned')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">{t('common.unassigned')}</SelectItem>
                    {people.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('nav.contacts')}</label>
              <Select value={form.contactId || 'NONE'} onValueChange={v => setForm({ ...form, contactId: v === 'NONE' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder={t('common.none')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">{t('common.none')}</SelectItem>
                  {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
