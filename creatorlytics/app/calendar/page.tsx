'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CalEventModal } from '@/components/calendar/CalEventModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useEvents } from '@/lib/hooks/useEvents';
import { today } from '@/lib/utils/formatting';
import { PlatformBadge, Badge } from '@/components/cly';
import type { CalendarEvent } from '@/types';

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const { events, deleteEvent } = useEvents();

  const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days: Array<{ date: number | null; dateStr: string | null; events: CalendarEvent[] }> = [];

    // Empty cells for days before first of month
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, dateStr: null, events: [] });
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.scheduled_date === dateStr);
      days.push({ date: d, dateStr, events: dayEvents });
    }

    return days;
  }, [year, month, events]);

  // Conflict detection: multiple events on same day
  const conflicts = useMemo(() => {
    const conflictDates = new Set<string>();
    calendarDays.forEach(day => {
      if (day.events.length > 1) {
        conflictDates.add(day.dateStr!);
      }
    });
    return conflictDates;
  }, [calendarDays]);

  // Agenda list (upcoming events sorted by date)
  const agenda = useMemo(() => {
    const todayStr = today();
    return events
      .filter(e => e.scheduled_date >= todayStr)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 10);
  }, [events]);

  function handleDateClick(dateStr: string) {
    setSelectedDate(dateStr);
    setEditEvent(null);
    setModalOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedDate(event.scheduled_date);
    setEditEvent(event);
    setModalOpen(true);
  }

  function handleClose(open: boolean) {
    setModalOpen(open);
    if (!open) {
      setEditEvent(null);
      setSelectedDate(undefined);
    }
  }

  function handleAdd() {
    setSelectedDate(today());
    setEditEvent(null);
    setModalOpen(true);
  }

  function handleDeleteConfirmed() {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  }

  return (
    <AppShell title="Calendar">
      <div className="flex flex-col gap-[18px] p-[18px]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-cly-lg font-semibold text-cly-text">Kalender Konten</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
          >
            <PlusIcon className="size-4" />
            Event Baru
          </button>
        </div>

        {/* Two-column layout: Calendar + Agenda */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[2fr_1fr]">
          
          {/* Calendar Grid */}
          <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
            {/* Month navigation */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-cly-base font-semibold capitalize text-cly-text">{monthName}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    if (month === 1) {
                      setYear(y => y - 1);
                      setMonth(12);
                    } else {
                      setMonth(m => m - 1);
                    }
                  }}
                  className="rounded-lg border border-cly-border p-1.5 text-cly-text-muted transition-colors hover:border-cly-brand hover:text-cly-brand"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button
                  onClick={() => {
                    if (month === 12) {
                      setYear(y => y + 1);
                      setMonth(1);
                    } else {
                      setMonth(m => m + 1);
                    }
                  }}
                  className="rounded-lg border border-cly-border p-1.5 text-cly-text-muted transition-colors hover:border-cly-brand hover:text-cly-brand"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="py-2 text-center text-cly-xs font-medium text-cly-text-muted">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isToday = day.dateStr === today();
                const hasConflict = day.dateStr ? conflicts.has(day.dateStr) : false;

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] rounded-lg border p-2 transition-all ${
                      day.date
                        ? 'cursor-pointer border-cly-border bg-cly-surface hover:border-cly-brand hover:shadow-cly'
                        : 'border-transparent bg-cly-muted'
                    }`}
                    onClick={() => day.dateStr && handleDateClick(day.dateStr)}
                  >
                    {day.date && (
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={`text-cly-sm font-medium ${
                              isToday ? 'text-cly-brand' : 'text-cly-text'
                            }`}
                          >
                            {day.date}
                          </span>
                          {hasConflict && (
                            <span className="size-2 rounded-full bg-red-500" title="Multiple events" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {day.events.slice(0, 2).map(evt => (
                            <button
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(evt);
                              }}
                              className="truncate rounded bg-cly-brand/10 px-1.5 py-0.5 text-left text-cly-xs text-cly-brand hover:bg-cly-brand/20"
                            >
                              {evt.title}
                            </button>
                          ))}
                          {day.events.length > 2 && (
                            <span className="px-1.5 text-cly-xs text-cly-text-muted">
                              +{day.events.length - 2} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda Sidebar */}
          <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
            <h3 className="mb-4 text-cly-base font-semibold text-cly-text">Agenda Mendatang</h3>
            {agenda.length === 0 ? (
              <p className="text-cly-sm text-cly-text-muted">Tidak ada event yang dijadwalkan</p>
            ) : (
              <div className="flex flex-col gap-2">
                {agenda.map(evt => {
                  const dateObj = new Date(evt.scheduled_date + 'T00:00:00');
                  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  return (
                    <button
                      key={evt.id}
                      onClick={() => handleEventClick(evt)}
                      className="flex flex-col gap-1.5 rounded-lg border border-cly-border bg-cly-muted p-3 text-left transition-all hover:border-cly-brand hover:shadow-cly"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-cly-sm font-medium text-cly-text">{evt.title}</span>
                        <PlatformBadge platform={evt.platform} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cly-xs text-cly-text-muted">{dateStr}</span>
                        {evt.scheduled_time && (
                          <>
                            <span className="text-cly-text-muted">·</span>
                            <span className="text-cly-xs text-cly-text-muted">{evt.scheduled_time}</span>
                          </>
                        )}
                      </div>
                      <Badge tone={evt.status === 'published' ? 'green' : evt.status === 'scheduled' ? 'blue' : 'neutral'}>
                        {evt.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <CalEventModal
          open={modalOpen}
          onOpenChange={handleClose}
          editEvent={editEvent}
          defaultDate={selectedDate}
          onDelete={(evt) => {
            setEventToDelete(evt);
            setDeleteDialogOpen(true);
            setModalOpen(false);
          }}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirmed}
          title="Hapus Event"
          description="Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          cancelText="Batal"
        />
      </div>
    </AppShell>
  );
}
