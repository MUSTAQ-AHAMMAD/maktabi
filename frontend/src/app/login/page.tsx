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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Maktabi</h1>
          <p className="text-muted-foreground mt-1">Enterprise Legal Management System</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Sign in to your account</h2>

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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Demo accounts:</p>
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
  );
}
