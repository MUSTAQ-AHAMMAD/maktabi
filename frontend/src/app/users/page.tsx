'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Pencil, UserX, UserCheck } from 'lucide-react';
import api from '@/lib/api';

const ROLES = ['ADMIN', 'CEO', 'LEGAL_MANAGER', 'INTERNAL_LAWYER', 'EXTERNAL_LAWYER', 'HR', 'FINANCE', 'DEPARTMENT_MANAGER', 'EMPLOYEE'];
const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CEO: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  LEGAL_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INTERNAL_LAWYER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  EXTERNAL_LAWYER: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  HR: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FINANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DEPARTMENT_MANAGER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  EMPLOYEE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

interface User { id: string; firstName: string; lastName: string; email: string; role: string; department?: string; isActive?: boolean; }
const emptyForm = { firstName: '', lastName: '', email: '', role: 'EMPLOYEE', department: '', password: '' };

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => { api.get('/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, department: u.department || '', password: '' }); setDialogOpen(true); };

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) { toast({ title: 'Required fields missing', variant: 'destructive' }); return; }
    if (!editing && form.password.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        const payload: any = { firstName: form.firstName, lastName: form.lastName, role: form.role, department: form.department };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', form);
      }
      toast({ title: editing ? 'User updated' : 'User created' });
      setDialogOpen(false); load();
    } catch (e: any) { toast({ title: 'Error', description: e?.response?.data?.message?.toString() || 'Could not save', variant: 'destructive' }); }
    finally { setSaving(false); }
  };
  const deactivate = async (u: User) => { if (!confirm(`Deactivate ${u.firstName} ${u.lastName}?`)) return; try { await api.delete(`/users/${u.id}`); load(); } catch {} };
  const reactivate = async (u: User) => { try { await api.put(`/users/${u.id}`, { isActive: true }); load(); } catch {} };

  const filtered = users.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout title="Users">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="ltr:pl-9 rtl:pr-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-1.5" /> New User</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(u => (
              <div key={u.id} className={`group bg-card border border-border rounded-xl p-5 card-hover-glow ${u.isActive === false ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10"><AvatarFallback className="text-sm bg-primary text-primary-foreground">{u.firstName[0]}{u.lastName[0]}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.department && <p className="text-xs text-muted-foreground">{u.department}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                    {u.isActive === false
                      ? <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => reactivate(u)}><UserCheck className="w-3.5 h-3.5" /></Button>
                      : <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deactivate(u)}><UserX className="w-3.5 h-3.5" /></Button>}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role.replace(/_/g, ' ')}</span>
                  {u.isActive === false && <span className="text-[10px] font-semibold text-muted-foreground uppercase">Inactive</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit User' : 'New User'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">First name</label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Last name</label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><label className="text-xs font-medium text-muted-foreground">Email</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Department</label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><label className="text-xs font-medium text-muted-foreground">{editing ? 'New password (optional)' : 'Password'}</label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : ''} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
