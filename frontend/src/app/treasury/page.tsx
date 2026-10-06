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
import { money, num, formatDate } from '@/lib/format';
import api from '@/lib/api';
import { Landmark, Plus, Building2, Banknote, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const acctIcon: Record<string, any> = { BANK: Building2, CASH: Banknote, CARD: CreditCard };

export default function TreasuryPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acctOpen, setAcctOpen] = useState(false);
  const [txnOpen, setTxnOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acctForm, setAcctForm] = useState({ name: '', type: 'BANK', balance: 0 });
  const [txnForm, setTxnForm] = useState({ accountId: '', type: 'CREDIT', amount: 0, description: '', reference: '' });

  const load = useCallback(async () => {
    try { const [a, tx] = await Promise.all([api.get('/treasury/accounts'), api.get('/treasury/transactions')]); setData(a.data); setTxns(tx.data); } catch {}
  }, []);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const saveAcct = async () => {
    if (!acctForm.name.trim()) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try { await api.post('/treasury/accounts', acctForm); toast({ title: t('common.create'), description: acctForm.name }); setAcctOpen(false); setAcctForm({ name: '', type: 'BANK', balance: 0 }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const saveTxn = async () => {
    if (!txnForm.accountId || !txnForm.amount || !txnForm.description.trim()) { toast({ title: t('common.required'), variant: 'destructive' }); return; }
    setSaving(true);
    try { await api.post('/treasury/transactions', txnForm); toast({ title: t('treasury.addTransaction') }); setTxnOpen(false); setTxnForm({ accountId: '', type: 'CREDIT', amount: 0, description: '', reference: '' }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSaving(false); }
  };
  const openTxn = (accountId = '') => { setTxnForm({ accountId: accountId || data?.accounts[0]?.id || '', type: 'CREDIT', amount: 0, description: '', reference: '' }); setTxnOpen(true); };

  return (
    <AppLayout title={t('treasury.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Landmark className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-xl font-bold text-foreground">{t('treasury.title')}</h1><p className="text-sm text-muted-foreground">{t('treasury.subtitle')}</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAcctOpen(true)}><Plus className="w-4 h-4 me-1.5" /> {t('treasury.newAccount')}</Button>
            <Button onClick={() => openTxn()}><Plus className="w-4 h-4 me-1.5" /> {t('treasury.addTransaction')}</Button>
          </div>
        </div>

        {loading ? <Skeleton className="h-40 rounded-xl" /> : (
          <>
            {/* Total balance banner */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(221 83% 36%) 0%, hsl(239 84% 42%) 60%, hsl(262 83% 42%) 100%)' }}>
              <p className="text-white/70 text-sm font-medium">{t('treasury.totalBalance')}</p>
              <p className="text-3xl font-bold mt-1 tabular-nums">{money(data?.totalBalance)}</p>
            </div>

            {/* Accounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.accounts.map((a: any) => {
                const Icon = acctIcon[a.type] || Building2;
                const neg = num(a.balance) < 0;
                return (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-4 card-hover-glow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                        <div><p className="text-sm font-semibold text-foreground">{a.name}</p><p className="text-xs text-muted-foreground">{t(`treasury.types.${a.type}`)} · {a._count?.transactions ?? 0} {t('treasury.transactions')}</p></div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTxn(a.id)}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <p className={`text-2xl font-bold mt-3 tabular-nums ${neg ? 'text-red-600' : 'text-foreground'}`}>{money(a.balance)}</p>
                  </div>
                );
              })}
            </div>

            {/* Transactions */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border"><h3 className="font-semibold text-foreground text-sm">{t('treasury.transactions')}</h3></div>
              <div className="divide-y divide-border">
                {txns.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">{t('common.noData')}</div> : txns.map(tx => {
                  const credit = tx.type === 'CREDIT';
                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${credit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {credit ? <ArrowDownRight className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground truncate">{tx.description}</p><p className="text-xs text-muted-foreground">{tx.account?.name} · {formatDate(tx.date, locale)}{tx.reference ? ` · ${tx.reference}` : ''}</p></div>
                      <span className={`font-semibold tabular-nums shrink-0 ${credit ? 'text-green-600' : 'text-red-600'}`}>{credit ? '+' : '−'}{money(tx.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* New account */}
      <Dialog open={acctOpen} onOpenChange={setAcctOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('treasury.newAccount')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.name')}</label><Input value={acctForm.name} onChange={e => setAcctForm({ ...acctForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.type')}</label>
                <Select value={acctForm.type} onValueChange={v => setAcctForm({ ...acctForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['BANK', 'CASH', 'CARD'].map(ty => <SelectItem key={ty} value={ty}>{t(`treasury.types.${ty}`)}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('treasury.balance')}</label><Input type="number" value={acctForm.balance} onChange={e => setAcctForm({ ...acctForm, balance: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAcctOpen(false)}>{t('common.cancel')}</Button><Button onClick={saveAcct} disabled={saving}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New transaction */}
      <Dialog open={txnOpen} onOpenChange={setTxnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('treasury.addTransaction')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('treasury.account')}</label>
              <Select value={txnForm.accountId} onValueChange={v => setTxnForm({ ...txnForm, accountId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data?.accounts.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.type')}</label>
                <Select value={txnForm.type} onValueChange={v => setTxnForm({ ...txnForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CREDIT">{t('treasury.credit')}</SelectItem><SelectItem value="DEBIT">{t('treasury.debit')}</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('common.amount')}</label><Input type="number" value={txnForm.amount} onChange={e => setTxnForm({ ...txnForm, amount: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t('invoices.description')}</label><Input value={txnForm.description} onChange={e => setTxnForm({ ...txnForm, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTxnOpen(false)}>{t('common.cancel')}</Button><Button onClick={saveTxn} disabled={saving}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
