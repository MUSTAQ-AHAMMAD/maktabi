'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/i18n/locale-provider';
import { money, num, formatDate } from '@/lib/format';
import { DocumentsPanel } from '@/components/documents-panel';
import api from '@/lib/api';
import { ArrowLeft, DollarSign, CreditCard, FileText, Building2, TrendingUp, TrendingDown } from 'lucide-react';

const statusStyle: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function FinancialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { locale, dir } = useLocale();
  const { toast } = useToast();
  const [f, setF] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, reference: '', notes: '' });

  const load = () => api.get(`/financial/${id}`).then(r => setF(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <AppLayout title="Financial"><div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div></AppLayout>;
  if (!f) return <AppLayout title="Financial"><div className="py-20 text-center text-muted-foreground">Not found</div></AppLayout>;

  const total = num(f.totalAmount), paid = num(f.paidAmount), balance = total - paid;
  const progress = total > 0 ? (paid / total) * 100 : 0;
  const against = f.type === 'AGAINST_COMPANY';
  const Arrow = dir === 'rtl' ? (p: any) => <ArrowLeft {...p} className={`${p.className} rotate-180`} /> : ArrowLeft;

  const openPay = () => { setPayForm({ amount: balance, reference: '', notes: '' }); setPayOpen(true); };
  const recordPayment = async () => {
    setSaving(true);
    try { await api.post(`/financial/${id}/payments`, payForm); toast({ title: 'Payment recorded', description: money(payForm.amount) }); setPayOpen(false); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };

  return (
    <AppLayout title={f.title}>
      <div className="space-y-6">
        <Link href="/financial" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Arrow className="w-4 h-4" /> Back to Enforcement</Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${against ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                {against ? <TrendingDown className="w-6 h-6 text-red-600" /> : <TrendingUp className="w-6 h-6 text-green-600" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{f.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{against ? 'Against company' : 'In favour of company'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[f.status]}`}>{f.status}</span>
                  {f.brand && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Building2 className="w-3 h-3" />{f.brand.name}</span>}
                </div>
              </div>
            </div>
            {f.status !== 'COMPLETED' && f.status !== 'CANCELLED' && <Button onClick={openPay}><CreditCard className="w-4 h-4 me-1.5" /> Record Payment</Button>}
          </div>

          {/* progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground tabular-nums">{money(total)}</p></div>
              <div className="text-end"><p className="text-xs text-muted-foreground">Paid</p><p className="text-lg font-semibold text-green-600 tabular-nums">{money(paid)}</p></div>
              <div className="text-end"><p className="text-xs text-muted-foreground">Balance</p><p className="text-lg font-semibold text-amber-600 tabular-nums">{money(balance)}</p></div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${progress}%` }} /></div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>{progress.toFixed(1)}% settled</span>{f.dueDate && <span>Due {formatDate(f.dueDate, locale)}</span>}</div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-primary" /><h3 className="font-semibold text-foreground">Payments ({f.payments?.length || 0})</h3></div>
          {(!f.payments || f.payments.length === 0) ? <p className="text-sm text-muted-foreground py-4 text-center">No payments recorded yet</p> : (
            <div className="divide-y divide-border">
              {f.payments.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"><CreditCard className="w-4 h-4 text-green-600" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{money(p.amount)}</p><p className="text-xs text-muted-foreground">{formatDate(p.paymentDate, locale)}{p.reference ? ` · ${p.reference}` : ''}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-primary" /><h3 className="font-semibold text-foreground">Documents</h3></div>
          <DocumentsPanel entityType="financial" entityId={id} />
        </div>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Amount</label><Input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Reference</label><Input value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button><Button onClick={recordPayment} disabled={saving}>{saving ? 'Saving…' : 'Record'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
