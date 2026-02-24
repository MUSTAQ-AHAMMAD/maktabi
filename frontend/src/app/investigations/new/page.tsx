'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface InvestigationForm {
  title: string;
  description: string;
}

export default function NewInvestigationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [severity, setSeverity] = useState('MEDIUM');
  const { register, handleSubmit } = useForm<InvestigationForm>();

  const onSubmit = async (data: InvestigationForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/investigations', { ...data, isConfidential, severity });
      toast({ title: 'Investigation submitted' });
      router.push('/investigations');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit.', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="New Investigation">
      <div className="max-w-2xl">
        <div className="mb-6"><Link href="/investigations"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link></div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Investigation Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Investigation title" {...register('title', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe the investigation..." rows={4} {...register('description', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select defaultValue="MEDIUM" onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isConfidential} onCheckedChange={setIsConfidential} />
              <Label>Mark as Confidential</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Investigation'}
              </Button>
              <Link href="/investigations"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
