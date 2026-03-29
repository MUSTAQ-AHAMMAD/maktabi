'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
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

interface Brand { id: string; name: string; code: string; color: string; }

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(10, 'Min 10 characters'),
  counterparty: z.string().min(1, 'Required'),
  value: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  brandId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => { api.get('/brands').then(r => setBrands(r.data)).catch(() => {}); }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/contracts', data);
      toast({ title: 'Contract created' });
      router.push('/contracts');
    } catch {
      toast({ title: 'Error', description: 'Failed to create contract.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout title="New Contract">
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/contracts"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
        </div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Contract Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Contract title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Counterparty *</Label>
              <Input placeholder="Company or individual name" {...register('counterparty')} />
              {errors.counterparty && <p className="text-xs text-destructive">{errors.counterparty.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Contract description..." rows={3} {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Value (SAR)</Label>
                <Input type="number" placeholder="0" {...register('value')} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" {...register('endDate')} />
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
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Contract'}
              </Button>
              <Link href="/contracts"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
