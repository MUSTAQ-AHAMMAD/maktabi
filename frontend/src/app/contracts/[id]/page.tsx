'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Briefcase, Calendar, User, DollarSign, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  counterparty: string;
  value?: string;
  currency?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  renewalAlertDays: number;
  riskScore?: number;
  clauseNotes?: string;
  signatureReady: boolean;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.get(`/contracts/${id}`)
      .then(r => { setData(r.data); setNewStatus(r.data.status); })
      .catch(() => router.push('/contracts'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === data?.status) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/contracts/${id}/status`, { status: newStatus });
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
      <AppLayout title="Contract Details">
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return null;

  const daysLeft = data.endDate ? differenceInDays(new Date(data.endDate), new Date()) : null;

  return (
    <AppLayout title="Contract Details">
      <div className="max-w-4xl space-y-6">
        <div>
          <Link href="/contracts">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Contracts</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{data.contractNumber}</h2>
                <p className="text-sm text-muted-foreground">{data.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
              {data.signatureReady && (
                <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                  Signature Ready
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Counterparty</p>
                <p className="text-sm text-foreground font-medium">{data.counterparty}</p>
              </div>
              {data.createdBy && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Created By</p>
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
            </div>

            <div className="space-y-4">
              {data.value && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contract Value</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">{data.currency || 'SAR'} {(parseFloat(data.value) || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {data.startDate && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Start Date</p>
                  <p className="text-sm text-foreground">{format(new Date(data.startDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {data.endDate && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">End Date</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">{format(new Date(data.endDate), 'MMM d, yyyy')}</p>
                    {daysLeft !== null && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {daysLeft < 0 ? '(Expired)' : daysLeft === 0 ? '(Expires today)' : `(${daysLeft}d left)`}
                        {daysLeft >= 0 && daysLeft <= 30 && <AlertTriangle className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {data.riskScore !== null && data.riskScore !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Risk Score</p>
                  <p className="text-sm text-foreground">{data.riskScore}/100</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
            </div>
            {data.clauseNotes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Clause Notes</p>
                <p className="text-sm text-foreground leading-relaxed">{data.clauseNotes}</p>
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_MANAGER">Pending Manager</SelectItem>
                  <SelectItem value="PENDING_LEGAL">Pending Legal</SelectItem>
                  <SelectItem value="PENDING_LAWYER">Pending Lawyer</SelectItem>
                  <SelectItem value="PENDING_CEO">Pending CEO</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
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
