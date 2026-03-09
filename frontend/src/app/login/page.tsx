'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { login } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await login(data.email, data.password);
      setAuth(res.user, res.access_token);
      router.push('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--sidebar-bg)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Maktabi</span>
              <p className="text-xs" style={{ color: 'var(--sidebar-fg)' }}>Legal Management</p>
            </div>
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Enterprise Legal<br />Management System
          </h2>
          <p style={{ color: 'var(--sidebar-fg)' }} className="text-base leading-relaxed">
            Streamline your legal operations with comprehensive case management, 
            contract tracking, and compliance monitoring.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: 'Cases Managed', value: '500+' },
              { label: 'Contracts Tracked', value: '1,200+' },
              { label: 'Legal Consultations', value: '3,000+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-lg" style={{ background: 'var(--sidebar-hover-bg)' }}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--sidebar-fg)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <p className="text-xs" style={{ color: 'var(--sidebar-fg)' }}>
            © {new Date().getFullYear()} Maktabi Legal. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-3 shadow-lg">
              <Scale className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Maktabi</h1>
            <p className="text-muted-foreground text-sm mt-1">Enterprise Legal Management System</p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick access — Demo accounts:</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { email: 'admin@maktabi.com', role: 'Admin', password: 'Admin@123' },
                  { email: 'ceo@maktabi.com', role: 'CEO', password: 'Ceo@123' },
                  { email: 'legal.manager@maktabi.com', role: 'Legal Mgr', password: 'Legal@123' },
                  { email: 'lawyer@maktabi.com', role: 'Lawyer', password: 'Lawyer@123' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setValue('email', acc.email);
                      setValue('password', acc.password);
                    }}
                    className="p-2 rounded-lg bg-muted hover:bg-accent text-left transition-colors"
                  >
                    <div className="font-medium text-foreground">{acc.role}</div>
                    <div className="text-muted-foreground truncate">{acc.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
