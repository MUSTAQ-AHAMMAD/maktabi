'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Gavel, Clock, AlertTriangle, Briefcase } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, isPast, differenceInDays } from 'date-fns';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import api from '@/lib/api';

interface Hearing {
  id: string;
  hearingDate: string;
  court: string;
  notes?: string;
  outcome?: string;
  nextDate?: string;
  case: {
    id: string;
    caseNumber: string;
    caseType: string;
    parties: string;
    status: string;
    riskLevel: string;
  };
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  endDate: string;
  status: string;
}

function getDateLabel(dateStr: string): { label: string; color: string } {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: 'Past', color: 'text-muted-foreground' };
  if (isToday(date)) return { label: 'Today', color: 'text-green-600' };
  if (isTomorrow(date)) return { label: 'Tomorrow', color: 'text-amber-600' };
  if (isThisWeek(date)) return { label: 'This week', color: 'text-blue-600' };
  const days = differenceInDays(date, new Date());
  return { label: `In ${days} days`, color: 'text-foreground' };
}

export default function CalendarPage() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/litigation').then(r => {
        const cases = r.data as Array<{ id: string; caseNumber: string; caseType: string; parties: string; status: string; riskLevel: string; hearings: Omit<Hearing, 'case'>[] }>;
        const allHearings: Hearing[] = [];
        cases.forEach(c => {
          (c.hearings || []).forEach(h => {
            allHearings.push({ ...h, case: { id: c.id, caseNumber: c.caseNumber, caseType: c.caseType, parties: c.parties, status: c.status, riskLevel: c.riskLevel } });
          });
        });
        allHearings.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
        setHearings(allHearings);
      }).catch(() => {}),
      api.get('/contracts').then(r => {
        const contracts = r.data as Contract[];
        const expiring = contracts
          .filter(c => c.endDate && c.status !== 'EXPIRED' && c.status !== 'TERMINATED')
          .filter(c => {
            const days = differenceInDays(new Date(c.endDate), new Date());
            return days >= 0 && days <= 60;
          })
          .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        setExpiringContracts(expiring);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const upcoming = hearings.filter(h => !isPast(new Date(h.hearingDate)) || isToday(new Date(h.hearingDate)));
  const past = hearings.filter(h => isPast(new Date(h.hearingDate)) && !isToday(new Date(h.hearingDate)));

  return (
    <AppLayout title="Calendar & Deadlines">
      <div className="space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Upcoming Hearings</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? '–' : upcoming.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Expiring Contracts</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? '–' : expiringContracts.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Past Hearings</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? '–' : past.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Hearings */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
              <Gavel className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Upcoming Hearings</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Calendar className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming hearings</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcoming.slice(0, 10).map(h => {
                  const { label, color } = getDateLabel(h.hearingDate);
                  return (
                    <Link key={h.id} href={`/litigation/${h.case.id}`}>
                      <div className="flex items-start gap-3 px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-center w-12 shrink-0">
                          <p className="text-xl font-bold text-foreground leading-none">
                            {format(new Date(h.hearingDate), 'd')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(h.hearingDate), 'MMM')}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{h.case.caseNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{h.court}</p>
                          <p className="text-xs text-muted-foreground truncate">{h.case.parties}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-xs font-medium ${color}`}>{label}</p>
                          <StatusBadge status={h.case.riskLevel} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expiring Contracts */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-foreground">Contracts Expiring Soon</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : expiringContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Briefcase className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No contracts expiring in the next 60 days</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {expiringContracts.map(c => {
                  const daysLeft = differenceInDays(new Date(c.endDate), new Date());
                  return (
                    <Link key={c.id} href={`/contracts/${c.id}`}>
                      <div className="flex items-start gap-3 px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-center w-12 shrink-0">
                          <p className="text-xl font-bold text-foreground leading-none">
                            {format(new Date(c.endDate), 'd')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(c.endDate), 'MMM')}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{c.contractNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.title}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-xs font-medium flex items-center gap-1 ${daysLeft <= 15 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                            {daysLeft <= 30 && <AlertTriangle className="w-3 h-3" />}
                          </span>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Past Hearings */}
        {past.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Past Hearings</h3>
            </div>
            <div className="divide-y divide-border">
              {past.slice(0, 5).map(h => (
                <Link key={h.id} href={`/litigation/${h.case.id}`}>
                  <div className="flex items-start gap-3 px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer opacity-70">
                    <div className="text-center w-12 shrink-0">
                      <p className="text-xl font-bold text-foreground leading-none">
                        {format(new Date(h.hearingDate), 'd')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(h.hearingDate), 'MMM yyyy')}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{h.case.caseNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{h.court}</p>
                      {h.outcome && <p className="text-xs text-foreground mt-0.5 truncate">Outcome: {h.outcome}</p>}
                    </div>
                    <StatusBadge status={h.case.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
