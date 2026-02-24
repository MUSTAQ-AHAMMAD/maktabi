'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ConsultationForm {
  title: string;
  description: string;
  slaDeadline?: string;
}

export default function NewConsultationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<ConsultationForm>();

  const onSubmit = async (data: ConsultationForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/consultations', data);
      toast({ title: 'Consultation submitted' });
      router.push('/consultations');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit.', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="New Consultation Request">
      <div className="max-w-2xl">
        <div className="mb-6"><Link href="/consultations"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link></div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Consultation Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input placeholder="What legal advice do you need?" {...register('title', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe your legal question in detail..." rows={5} {...register('description', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>SLA Deadline</Label>
              <Input type="datetime-local" {...register('slaDeadline')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Request'}
              </Button>
              <Link href="/consultations"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
