'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface FinancialForm {
  title: string;
  totalAmount: string;
  dueDate?: string;
  notes?: string;
}

export default function NewFinancialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('AGAINST_COMPANY');
  const { register, handleSubmit } = useForm<FinancialForm>();

  const onSubmit = async (data: FinancialForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/financial', { ...data, type });
      toast({ title: 'Financial execution created' });
      router.push('/financial');
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="New Financial Execution">
      <div className="max-w-2xl">
        <div className="mb-6"><Link href="/financial"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link></div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Financial Execution Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Execution title" {...register('title', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue="AGAINST_COMPANY" onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGAINST_COMPANY">Against Company</SelectItem>
                  <SelectItem value="IN_FAVOR_OF_COMPANY">In Favor of Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount (SAR) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('totalAmount', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" {...register('dueDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." rows={3} {...register('notes')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create'}
              </Button>
              <Link href="/financial"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
