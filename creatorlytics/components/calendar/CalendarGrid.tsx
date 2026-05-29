'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
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

const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

  const cells = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const result: { date: string; day: number; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    for (let i = 0; i < startDay; i++) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevTotal = daysInMonth(prevYear, prevMonth);
      const d = prevTotal - startDay + 1 + i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ date: dateStr, day: d, isCurrentMonth: false, events: [] });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.scheduled_date === dateStr);
      result.push({ date: dateStr, day: d, isCurrentMonth: true, events: dayEvents });
    }

    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ date: dateStr, day: d, isCurrentMonth: false, events: [] });
    }

    return result;
  }, [year, month, events]);

  return (
    <div className="flex flex-col gap-2">
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

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {dayHeaders.map(d => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => onDateClick(cell.date)}
            className={cn(
              'flex flex-col items-start gap-0.5 bg-card px-1.5 py-1.5 text-left transition-colors hover:bg-accent/50 min-h-[72px]',
              !cell.isCurrentMonth && 'opacity-40',
              cell.date === todayStr && 'ring-1 ring-primary'
            )}
          >
            <span className={cn(
              'text-xs font-medium',
              cell.date === todayStr ? 'text-primary' : 'text-foreground'
            )}>
              {cell.day}
            </span>
            {cell.events.length > 0 && (
              <div className="flex flex-col gap-0.5 w-full">
                {cell.events.slice(0, 2).map(ev => (
                  <span
                    key={ev.id}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    className="truncate rounded bg-primary/10 px-1 py-[1px] text-[10px] text-primary cursor-pointer hover:bg-primary/20"
                  >
                    {ev.title}
                  </span>
                ))}
                {cell.events.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{cell.events.length - 2} lainnya</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
