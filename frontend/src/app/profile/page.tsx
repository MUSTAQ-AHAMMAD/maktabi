'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from 'next-themes';
import { useLocale } from '@/i18n/locale-provider';
import { Moon, Sun, Monitor, User, Shield, Palette, Languages } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator', CEO: 'Chief Executive Officer', LEGAL_MANAGER: 'Legal Manager',
  INTERNAL_LAWYER: 'Internal Lawyer', EXTERNAL_LAWYER: 'External Lawyer', HR: 'Human Resources',
  FINANCE: 'Finance', DEPARTMENT_MANAGER: 'Department Manager', EMPLOYEE: 'Employee',
};

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security'>('profile');
  const [form, setForm] = useState({ firstName: '', lastName: '', department: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) setForm({ firstName: user.firstName, lastName: user.lastName, department: (user as any).department || '' }); }, [user]);
  if (!user) return null;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await api.patch('/me', form);
      if (token) setAuth({ ...user, firstName: r.data.firstName, lastName: r.data.lastName } as any, token);
      toast({ title: 'Profile updated' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pw.newPassword.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    if (pw.newPassword !== pw.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await api.post('/me/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast({ title: 'Password changed' });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e: any) { toast({ title: 'Error', description: e?.response?.data?.message?.toString() || 'Could not change password', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <AppLayout title="Profile & Settings">
      <div className="max-w-3xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20"><AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback></Avatar>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground">{roleLabels[user.role] || user.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {([{ id: 'profile', label: 'Profile', icon: User }, { id: 'appearance', label: 'Appearance', icon: Palette }, { id: 'security', label: 'Security', icon: Shield }] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Email Address</Label><Input value={user.email} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role</Label><Input value={roleLabels[user.role] || user.role} disabled className="bg-muted" /></div>
            </div>
            <div className="flex justify-end"><Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {[{ value: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' }, { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' }, { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' }].map(t => (
                  <button key={t.value} onClick={() => { setTheme(t.value); toast({ title: `Theme set to ${t.label}` }); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary ${theme === t.value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <t.icon className={`w-6 h-6 ${theme === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-center"><p className={`text-sm font-medium ${theme === t.value ? 'text-primary' : 'text-foreground'}`}>{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Language</Label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[{ value: 'en', label: 'English', desc: 'LTR' }, { value: 'ar', label: 'العربية', desc: 'RTL' }].map(l => (
                  <button key={l.value} onClick={() => setLocale(l.value as 'en' | 'ar')}
                    className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary ${locale === l.value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <Languages className={`w-5 h-5 ${locale === l.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-start"><p className={`text-sm font-medium ${locale === l.value ? 'text-primary' : 'text-foreground'}`}>{l.label}</p><p className="text-xs text-muted-foreground">{l.desc}</p></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-2 sm:col-span-2"><Label>Current password</Label><Input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label>New password</Label><Input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label>Confirm</Label><Input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></div>
            </div>
            <div className="flex justify-end max-w-lg"><Button onClick={changePassword} disabled={saving}>{saving ? 'Saving…' : 'Update password'}</Button></div>
            <div className="p-4 rounded-lg bg-muted max-w-lg"><p className="text-xs text-muted-foreground"><strong>Account ID:</strong> {user.id.substring(0, 16)}…</p><p className="text-xs text-muted-foreground mt-1"><strong>Role:</strong> {user.role}</p></div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
