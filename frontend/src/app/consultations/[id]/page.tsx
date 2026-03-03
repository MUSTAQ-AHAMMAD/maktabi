'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: string;
  legalOpinion?: string;
  tags: string[];
  feedback?: string;
  slaDeadline?: string;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [legalOpinion, setLegalOpinion] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingOpinion, setSavingOpinion] = useState(false);

  useEffect(() => {
    api.get(`/consultations/${id}`)
      .then(r => {
        setData(r.data);
        setNewStatus(r.data.status);
        setLegalOpinion(r.data.legalOpinion || '');
      })
      .catch(() => router.push('/consultations'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === data?.status) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/consultations/${id}/status`, { status: newStatus });
      setData(prev => prev ? { ...prev, status: newStatus } : prev);
      toast({ title: 'Status updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveOpinion = async () => {
    setSavingOpinion(true);
    try {
      await api.put(`/consultations/${id}`, { legalOpinion });
      setData(prev => prev ? { ...prev, legalOpinion } : prev);
      toast({ title: 'Legal opinion saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save opinion.', variant: 'destructive' });
    } finally {
      setSavingOpinion(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Consultation Details">
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return null;

  return (
    <AppLayout title="Consultation Details">
      <div className="max-w-4xl space-y-6">
        <div>
          <Link href="/consultations">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Consultations</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{data.title}</h2>
              </div>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {data.createdBy && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Requested By</p>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{data.createdBy.firstName} {data.createdBy.lastName}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Submitted</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{format(new Date(data.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
            {data.slaDeadline && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">SLA Deadline</p>
                <p className="text-sm text-foreground">{format(new Date(data.slaDeadline), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Request Description</p>
              <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
            </div>

            {data.tags && data.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" />Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Legal Opinion</h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Enter legal opinion here..."
              rows={5}
              value={legalOpinion}
              onChange={e => setLegalOpinion(e.target.value)}
            />
            <Button onClick={handleSaveOpinion} disabled={savingOpinion}>
              {savingOpinion ? 'Saving...' : 'Save Opinion'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Update Status</h3>
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="OPINION_PROVIDED">Opinion Provided</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === data.status}>
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
