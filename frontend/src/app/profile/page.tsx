'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, User, Shield, Bell, Palette } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  CEO: 'Chief Executive Officer',
  LEGAL_MANAGER: 'Legal Manager',
  INTERNAL_LAWYER: 'Internal Lawyer',
  EXTERNAL_LAWYER: 'External Lawyer',
  HR: 'Human Resources',
  FINANCE: 'Finance',
  DEPARTMENT_MANAGER: 'Department Manager',
  EMPLOYEE: 'Employee',
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security'>('profile');

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <AppLayout title="Profile & Settings">
      <div className="max-w-3xl space-y-6">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground">{roleLabels[user.role] || user.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {([
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'security', label: 'Security', icon: Shield },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={user.firstName} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={user.lastName} disabled className="bg-muted" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email Address</Label>
                <Input defaultValue={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input defaultValue={roleLabels[user.role] || user.role} disabled className="bg-muted" />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Profile information can only be updated by your system administrator.
              </p>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Appearance</h3>
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
                  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value);
                      toast({ title: `Theme set to ${t.label}` });
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary ${
                      theme === t.value ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <t.icon className={`w-6 h-6 ${theme === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <p className={`text-sm font-medium ${theme === t.value ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Password</p>
                    <p className="text-xs text-muted-foreground">Last changed: unknown</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Contact your administrator to change your password.' })}>
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">In-app notifications enabled</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Active</span>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">
                  <strong>Account ID:</strong> {user.id.substring(0, 16)}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
