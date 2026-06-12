'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
import { daysInMonth, firstDayOfMonth, getMonthName, today } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const DAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Status color map
const STATUS_COLOR: Record<string, string> = {
  idea:      'bg-slate-400/20 text-slate-600 dark:text-slate-300',
  scheduled: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  published: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  cancelled: 'bg-red-500/15 text-red-500 line-through',
};

const STATUS_DOT: Record<string, string> = {
  idea:      'bg-slate-400',
  scheduled: 'bg-blue-500',
  published: 'bg-emerald-500',
  cancelled: 'bg-red-400',
};

function getStatusColor(status: string) {
  return STATUS_COLOR[status] ?? STATUS_COLOR.idea;
}
function getStatusDot(status: string) {
  return STATUS_DOT[status] ?? STATUS_DOT.idea;
}

// ── Overflow popover for days with many events ────────────────────────────
interface OverflowPopoverProps {
  date: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onClose: () => void;
}

function OverflowPopover({ date, events, onEventClick, onClose }: OverflowPopoverProps) {
  const [d, m, y] = date.split('-').reverse().map(Number);
  const label = `${d} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m - 1]} ${y}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      <div
        className="relative z-10 w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">{label}</p>
          <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="Tutup">
            <X className="size-4" />
          </Button>
        </div>

        {/* Event list */}
        <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
          {events.map(ev => (
            <button
              key={ev.id}
              type="button"
              onClick={() => { onEventClick(ev); onClose(); }}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:brightness-95',
                getStatusColor(ev.status)
              )}
            >
              <span className={cn('size-2 rounded-full shrink-0', getStatusDot(ev.status))} />
              <span className="flex-1 truncate">{ev.title}</span>
              {ev.scheduled_time && (
                <span className="text-[10px] opacity-60 shrink-0">{ev.scheduled_time.slice(0, 5)}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main CalendarGrid ─────────────────────────────────────────────────────
export function CalendarGrid({
  year,
  month,
  events,
  onDateClick,
  onEventClick,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const todayStr = today();
  const [overflowDate, setOverflowDate] = useState<string | null>(null);

  const cells = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const result: { date: string; day: number; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    for (let i = 0; i < startDay; i++) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear  = month === 1 ? year - 1 : year;
      const prevTotal = daysInMonth(prevYear, prevMonth);
      const d = prevTotal - startDay + 1 + i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ date: dateStr, day: d, isCurrentMonth: false, events: [] });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events
        .filter(e => e.scheduled_date === dateStr)
        .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
      result.push({ date: dateStr, day: d, isCurrentMonth: true, events: dayEvents });
    }

    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear  = month === 12 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ date: dateStr, day: d, isCurrentMonth: false, events: [] });
    }

    return result;
  }, [year, month, events]);

  const overflowCell = overflowDate
    ? cells.find(c => c.date === overflowDate)
    : null;

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{getMonthName(month)} {year}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onPrevMonth}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNextMonth}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {/* Day headers */}
          {DAY_HEADERS.map(d => (
            <div
              key={d}
              className="bg-muted/50 px-2 py-1.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
            >
              {d}
            </div>
          ))}

          {/* Day cells */}
          {cells.map((cell, i) => {
            const isToday = cell.date === todayStr;
            const visible = cell.events.slice(0, 2);
            const overflow = cell.events.length - 2;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onDateClick(cell.date)}
                className={cn(
                  'group flex flex-col items-start gap-0.5 bg-card px-1.5 py-1.5 text-left transition-colors hover:bg-accent/40 min-h-[76px]',
                  !cell.isCurrentMonth && 'opacity-35',
                  isToday && 'bg-primary/5'
                )}
              >
                {/* Day number */}
                <span
                  className={cn(
                    'mb-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground group-hover:bg-muted'
                  )}
                >
                  {cell.day}
                </span>

                {/* Events */}
                {visible.map(ev => (
                  <span
                    key={ev.id}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    className={cn(
                      'w-full truncate rounded-md px-1.5 py-[2px] text-[10px] font-medium cursor-pointer transition-opacity hover:opacity-80',
                      getStatusColor(ev.status)
                    )}
                    title={ev.title}
                  >
                    {ev.scheduled_time && (
                      <span className="opacity-50 mr-1">{ev.scheduled_time.slice(0, 5)}</span>
                    )}
                    {ev.title}
                  </span>
                ))}

                {/* Overflow badge */}
                {overflow > 0 && (
                  <span
                    onClick={e => {
                      e.stopPropagation();
                      setOverflowDate(cell.date);
                    }}
                    className="w-full rounded-md px-1.5 py-[2px] text-[10px] font-semibold text-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                  >
                    +{overflow} lainnya
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pt-1">
          {Object.entries(STATUS_DOT).map(([status, dotClass]) => (
            <span key={status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize">
              <span className={cn('size-2 rounded-full', dotClass)} />
              {status === 'idea' ? 'Ide' : status === 'scheduled' ? 'Terjadwal' : status === 'published' ? 'Publish' : 'Dibatalkan'}
            </span>
          ))}
        </div>
      </div>

      {/* Overflow popover */}
      {overflowDate && overflowCell && (
        <OverflowPopover
          date={overflowDate}
          events={overflowCell.events}
          onEventClick={onEventClick}
          onClose={() => setOverflowDate(null)}
        />
      )}
    </>
  );
}
