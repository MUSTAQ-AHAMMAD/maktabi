'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Scale, Loader2, Eye, EyeOff, Shield, Clock, BarChart2, Users, CheckCircle2, ArrowRight } from 'lucide-react';
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

const features = [
  { icon: Scale,    title: 'Case Management',   desc: 'Track litigation from filing to resolution' },
  { icon: Shield,   title: 'Risk Monitoring',   desc: 'Real-time risk assessment & alerts' },
  { icon: Clock,    title: 'Deadline Tracking',  desc: 'Never miss a court date or deadline' },
  { icon: BarChart2,title: 'Financial Insights', desc: 'Exposure analysis & cost tracking' },
  { icon: Users,    title: 'Team Collaboration', desc: 'Assign cases, share documents' },
];

const demoAccounts = [
  { email: 'admin@maktabi.com',           role: 'Admin',        password: 'Admin@123',   color: 'bg-red-500' },
  { email: 'ceo@maktabi.com',             role: 'CEO',          password: 'Ceo@123',     color: 'bg-violet-500' },
  { email: 'legal.manager@maktabi.com',   role: 'Legal Mgr',    password: 'Legal@123',   color: 'bg-blue-500' },
  { email: 'lawyer@maktabi.com',          role: 'Lawyer',       password: 'Lawyer@123',  color: 'bg-cyan-500' },
  { email: 'finance@maktabi.com',         role: 'Finance',      password: 'Finance@123', color: 'bg-green-500' },
  { email: 'hr@maktabi.com',              role: 'HR',           password: 'Hr@123',      color: 'bg-amber-500' },
  { email: 'employee@maktabi.com',        role: 'Employee',     password: 'Employee@123',color: 'bg-slate-500' },
];

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
      {/* ── Left panel – branding ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden animate-gradient"
        style={{
          background: 'linear-gradient(135deg, hsl(221 83% 28%), hsl(239 84% 40%), hsl(262 83% 38%))',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 -left-24 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-0 w-64 h-64 rounded-full bg-purple-400 opacity-20 blur-3xl animate-float-delay" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 rounded-full bg-indigo-300 opacity-15 blur-2xl animate-float-slow" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Maktabi</span>
              <p className="text-xs text-white/60">Legal Management System</p>
            </div>
          </div>
        </motion.div>

        {/* Headline & features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative space-y-8"
        >
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Enterprise Legal<br />Management System
            </h2>
            <p className="text-white/70 text-base leading-relaxed mt-3">
              Streamline legal operations with comprehensive case management,
              contract tracking, and compliance monitoring.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/60">{f.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-white/40 ml-auto shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative"
        >
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Maktabi Legal. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* ── Right panel – login form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-3 shadow-lg">
              <Scale className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Maktabi</h1>
            <p className="text-muted-foreground text-sm mt-1">Enterprise Legal Management System</p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary/30'}
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
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10 focus-visible:ring-primary/30'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-11 text-sm font-semibold gap-2" disabled={isSubmitting}>
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
                  : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium">
                Quick access — Demo accounts
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3 md:grid-cols-4">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setValue('email', acc.email);
                      setValue('password', acc.password);
                    }}
                    className="p-2 rounded-lg bg-muted hover:bg-accent border border-transparent hover:border-border text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${acc.color}`} />
                      <span className="font-semibold text-foreground">{acc.role}</span>
                    </div>
                    <div className="text-muted-foreground truncate text-[10px] group-hover:text-foreground/70 transition-colors">
                      {acc.email.split('@')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
