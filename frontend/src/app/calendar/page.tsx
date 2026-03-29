'use client';

import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Calendar as CalendarIcon, Gavel, Clock, AlertTriangle, Briefcase,
  ChevronLeft, ChevronRight, List, LayoutGrid,
} from 'lucide-react';
import {
  format, isToday, isSameDay, isSameMonth, isPast,
  differenceInDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, addDays,
} from 'date-fns';
import Link from 'next/link';
import api from '@/lib/api';

interface Hearing {
  id: string;
  hearingDate: string;
  court: string;
  notes?: string;
  outcome?: string;
  case: {
    id: string;
    caseNumber: string;
    caseType: string;
    parties: string;
    status: string;
    riskLevel: string;
  };
}

interface ContractEvent {
  id: string;
  contractNumber: string;
  title: string;
  endDate: string;
  status: string;
}

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'hearing' | 'contract_expiry';
  title: string;
  subtitle: string;
  linkHref: string;
  color: string;
  riskLevel?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    Promise.all([
      api.get('/litigation').then(r => {
        const cases = r.data as Array<{
          id: string; caseNumber: string; caseType: string; parties: string;
          status: string; riskLevel: string; hearings: Omit<Hearing, 'case'>[];
        }>;
        const allHearings: Hearing[] = [];
        cases.forEach(c => {
          (c.hearings || []).forEach(h => {
            allHearings.push({
              ...h,
              case: {
                id: c.id, caseNumber: c.caseNumber, caseType: c.caseType,
                parties: c.parties, status: c.status, riskLevel: c.riskLevel,
              },
            });
          });
        });
        allHearings.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
        setHearings(allHearings);
      }).catch(() => {}),
      api.get('/contracts').then(r => {
        const contracts = r.data as ContractEvent[];
        const expiring = contracts
          .filter(c => c.endDate && c.status !== 'EXPIRED' && c.status !== 'TERMINATED')
          .filter(c => differenceInDays(new Date(c.endDate), new Date()) >= -7)
          .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        setExpiringContracts(expiring);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Build unified events list
  const events: CalendarEvent[] = useMemo(() => {
    const evts: CalendarEvent[] = [];
    hearings.forEach(h => {
      evts.push({
        id: `hearing-${h.id}`,
        date: new Date(h.hearingDate),
        type: 'hearing',
        title: h.case.caseNumber,
        subtitle: h.court,
        linkHref: `/litigation/${h.case.id}`,
        color: h.case.riskLevel === 'CRITICAL' ? '#991b1b' : h.case.riskLevel === 'HIGH' ? '#dc2626' : '#2563eb',
        riskLevel: h.case.riskLevel,
      });
    });
    expiringContracts.forEach(c => {
      evts.push({
        id: `contract-${c.id}`,
        date: new Date(c.endDate),
        type: 'contract_expiry',
        title: c.contractNumber,
        subtitle: c.title,
        linkHref: `/contracts/${c.id}`,
        color: '#f59e0b',
      });
    });
    return evts;
  }, [hearings, expiringContracts]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day));

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const upcoming = hearings.filter(h => !isPast(new Date(h.hearingDate)) || isToday(new Date(h.hearingDate)));
  const upcomingContracts = expiringContracts.filter(c => differenceInDays(new Date(c.endDate), new Date()) >= 0 && differenceInDays(new Date(c.endDate), new Date()) <= 60);

  return (
    <AppLayout title="Calendar & Deadlines">
      <div className="space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Gavel className="w-5 h-5 text-blue-600" />
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
            <p className="text-3xl font-bold text-foreground">{loading ? '–' : upcomingContracts.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Events</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? '–' : events.length}</p>
          </div>
        </div>

        {/* View toggle + month navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="ml-2 text-xs" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[500px] rounded-xl" />
        ) : viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Calendar Grid */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative min-h-[90px] p-1.5 border-b border-r border-border text-left transition-colors
                        ${!isCurrentMonth ? 'bg-muted/30' : 'hover:bg-muted/50'}
                        ${isSelected ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}
                      `}
                    >
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${today ? 'bg-primary text-primary-foreground' : ''}
                        ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {/* Event dots */}
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 3).map(evt => (
                          <div
                            key={evt.id}
                            className="text-[10px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium"
                            style={{ backgroundColor: evt.color }}
                            title={evt.title}
                          >
                            {evt.type === 'hearing' ? '⚖ ' : '📄 '}{evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar - Selected day detail / Upcoming */}
            <div className="space-y-4">
              {/* Selected day events */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground text-sm">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a day'}
                  </h3>
                </div>
                {selectedDate && selectedEvents.length > 0 ? (
                  <div className="divide-y divide-border">
                    {selectedEvents.map(evt => (
                      <Link key={evt.id} href={evt.linkHref}>
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: evt.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{evt.title}</p>
                            <p className="text-xs text-muted-foreground">{evt.subtitle}</p>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 inline-block">
                              {evt.type === 'hearing' ? '⚖ Hearing' : '📄 Contract Expiry'}
                            </span>
                          </div>
                          {evt.riskLevel && <StatusBadge status={evt.riskLevel} />}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {selectedDate ? 'No events on this day' : 'Click a date to see events'}
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs text-foreground">Hearing (Low/Medium Risk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-xs text-foreground">Hearing (High Risk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-900" />
                    <span className="text-xs text-foreground">Hearing (Critical Risk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-foreground">Contract Expiry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Hearings */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                <Gavel className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Upcoming Hearings</h3>
              </div>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <CalendarIcon className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming hearings</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcoming.slice(0, 10).map(h => {
                    const daysUntil = differenceInDays(new Date(h.hearingDate), new Date());
                    const label = isToday(new Date(h.hearingDate)) ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
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
                            <p className="text-xs font-medium text-blue-600">{label}</p>
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
              {upcomingContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Briefcase className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No contracts expiring soon</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingContracts.map(c => {
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
        )}
      </div>
    </AppLayout>
  );
}
