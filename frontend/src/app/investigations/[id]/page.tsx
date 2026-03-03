'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Calendar, User, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface Investigation {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  isConfidential: boolean;
  committeeMembers: string[];
  disciplinaryLog?: string;
  appealNotes?: string;
  slaDeadline?: string;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
}

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.get(`/investigations/${id}`)
      .then(r => { setData(r.data); setNewStatus(r.data.status); })
      .catch(() => router.push('/investigations'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === data?.status) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/investigations/${id}/status`, { status: newStatus });
      setData(prev => prev ? { ...prev, status: newStatus } : prev);
      toast({ title: 'Status updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Investigation Details">
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return null;

  return (
    <AppLayout title="Investigation Details">
      <div className="max-w-4xl space-y-6">
        <div>
          <Link href="/investigations">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Investigations</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{data.title}</h2>
                {data.isConfidential && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3 text-red-500" />
                    <span className="text-xs font-medium text-red-600">Confidential</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.severity} />
              <StatusBadge status={data.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {data.createdBy && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Submitted By</p>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{data.createdBy.firstName} {data.createdBy.lastName}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Created</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
            </div>

            {data.committeeMembers && data.committeeMembers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Committee Members</p>
                <div className="flex flex-wrap gap-2">
                  {data.committeeMembers.map((m, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {data.disciplinaryLog && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Disciplinary Log</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{data.disciplinaryLog}</p>
              </div>
            )}

            {data.appealNotes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Appeal Notes</p>
                <p className="text-sm text-foreground leading-relaxed">{data.appealNotes}</p>
              </div>
            )}
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
                  <SelectItem value="CLASSIFIED">Classified</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMMITTEE_REVIEW">Committee Review</SelectItem>
                  <SelectItem value="APPEAL">Appeal</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
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
