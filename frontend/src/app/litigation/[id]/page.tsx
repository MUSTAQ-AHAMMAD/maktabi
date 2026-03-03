'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Scale, Calendar, Gavel, User, AlertTriangle, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface Hearing {
  id: string;
  hearingDate: string;
  court: string;
  notes?: string;
  outcome?: string;
  nextDate?: string;
}

interface LitigationCase {
  id: string;
  caseNumber: string;
  caseType: string;
  courtName: string;
  parties: string;
  description: string;
  riskLevel: string;
  status: string;
  financialExposure?: string;
  currency?: string;
  slaDeadline?: string;
  createdAt: string;
  assignedLawyer?: { firstName: string; lastName: string };
  hearings: Hearing[];
}

export default function LitigationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<LitigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.get(`/litigation/${id}`)
      .then(r => { setCaseData(r.data); setNewStatus(r.data.status); })
      .catch(() => router.push('/litigation'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === caseData?.status) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/litigation/${id}/status`, { status: newStatus });
      setCaseData(prev => prev ? { ...prev, status: newStatus } : prev);
      toast({ title: 'Status updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Case Details">
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!caseData) return null;

  return (
    <AppLayout title={caseData.caseNumber}>
      <div className="max-w-4xl space-y-6">
        <div>
          <Link href="/litigation">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Cases</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{caseData.caseNumber}</h2>
                <p className="text-sm text-muted-foreground">{caseData.caseType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={caseData.riskLevel} />
              <StatusBadge status={caseData.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Parties</p>
                <p className="text-sm text-foreground">{caseData.parties}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Court</p>
                <div className="flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{caseData.courtName}</p>
                </div>
              </div>
              {caseData.assignedLawyer && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assigned Lawyer</p>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">{caseData.assignedLawyer.firstName} {caseData.assignedLawyer.lastName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {caseData.financialExposure && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Financial Exposure</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">{caseData.currency || 'SAR'} {(parseFloat(caseData.financialExposure) || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {caseData.slaDeadline && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">SLA Deadline</p>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <p className="text-sm text-foreground">{format(new Date(caseData.slaDeadline), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{format(new Date(caseData.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{caseData.description}</p>
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="HEARING">Hearing</SelectItem>
                  <SelectItem value="DECIDED">Decided</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === caseData.status}>
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Hearings ({caseData.hearings.length})</h3>
          </div>
          {caseData.hearings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hearings scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {caseData.hearings.map(hearing => (
                <div key={hearing.id} className="border border-border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{format(new Date(hearing.hearingDate), 'MMM d, yyyy')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{hearing.court}</span>
                  </div>
                  {hearing.notes && <p className="text-xs text-muted-foreground mt-1">{hearing.notes}</p>}
                  {hearing.outcome && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-muted-foreground">Outcome: </span>
                      <span className="text-xs text-foreground">{hearing.outcome}</span>
                    </div>
                  )}
                  {hearing.nextDate && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Plus className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Next: {format(new Date(hearing.nextDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
