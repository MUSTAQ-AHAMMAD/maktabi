'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  code: string;
  color: string;
}

const schema = z.object({
  caseType: z.string().min(1, 'Required'),
  courtName: z.string().min(1, 'Required'),
  parties: z.string().min(1, 'Required'),
  description: z.string().min(10, 'Min 10 characters'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  financialExposure: z.string().optional(),
  brandId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewLitigationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { riskLevel: 'MEDIUM' },
  });

  useEffect(() => {
    api.get('/brands').then(r => setBrands(r.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/litigation', data);
      toast({ title: 'Case created', description: 'Litigation case created successfully.' });
      router.push('/litigation');
    } catch {
      toast({ title: 'Error', description: 'Failed to create case.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout title="New Litigation Case">
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/litigation">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Cases</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Case Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Case Type *</Label>
                <Input placeholder="e.g. Commercial Dispute" {...register('caseType')} />
                {errors.caseType && <p className="text-xs text-destructive">{errors.caseType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Court Name *</Label>
                <Input placeholder="e.g. Riyadh Commercial Court" {...register('courtName')} />
                {errors.courtName && <p className="text-xs text-destructive">{errors.courtName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select onValueChange={v => setValue('brandId', v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select brand (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Brand</SelectItem>
                  {brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                        {b.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parties *</Label>
              <Input placeholder="e.g. Company A vs Company B" {...register('parties')} />
              {errors.parties && <p className="text-xs text-destructive">{errors.parties.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe the case details..." rows={4} {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Level *</Label>
                <Select defaultValue="MEDIUM" onValueChange={v => setValue('riskLevel', v as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Financial Exposure (SAR)</Label>
                <Input type="number" placeholder="0.00" {...register('financialExposure')} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Case'}
              </Button>
              <Link href="/litigation">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
