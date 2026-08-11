'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, Trash2, CheckSquare, Square } from 'lucide-react';
import dynamic from 'next/dynamic';
const CalEventModal = dynamic(() => import('@/components/calendar/CalEventModal').then(m => m.CalEventModal), { ssr: false });
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useEvents } from '@/lib/hooks/useEvents';
import { today } from '@/lib/utils/formatting';
import { PlatformBadge } from '@/components/cly';
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
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

  // Agenda list: only events in the displayed month, upcoming first then past
  const agenda = useMemo(() => {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthEvents = events.filter(e => e.scheduled_date.startsWith(monthPrefix));
    const todayStr = today();
    const upcoming = monthEvents
      .filter(e => e.scheduled_date >= todayStr)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    const past = monthEvents
      .filter(e => e.scheduled_date < todayStr)
      .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
    return [...upcoming, ...past];
  }, [events, year, month]);

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

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === agenda.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(agenda.map(e => e.id)));
    }
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await deleteEvent(id);
    }
    exitSelectMode();
    setBulkDeleteOpen(false);
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
          <div className="rounded-[10px] bg-cly-surface shadow-cly flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {/* Sidebar header with select mode controls */}
            <div className="px-[18px] pt-[18px] pb-3 shrink-0 flex items-center justify-between">
              <h3 className="text-cly-base font-semibold text-cly-text">Semua Event</h3>
              {agenda.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {selectMode ? (
                    <>
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-cly-text-muted hover:bg-cly-muted transition-colors"
                        title={selectedIds.size === agenda.length ? 'Batal pilih semua' : 'Pilih semua'}
                      >
                        {selectedIds.size === agenda.length ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                        Semua
                      </button>
                      {selectedIds.size > 0 && (
                        <button
                          onClick={() => setBulkDeleteOpen(true)}
                          className="flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="size-3" />
                          Hapus ({selectedIds.size})
                        </button>
                      )}
                      <button
                        onClick={exitSelectMode}
                        className="rounded-md px-2 py-1 text-[11px] font-medium text-cly-text-muted hover:bg-cly-muted transition-colors"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-cly-text-muted hover:bg-cly-muted transition-colors"
                    >
                      <CheckSquare className="size-3.5" />
                      Pilih
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="overflow-y-auto px-[18px] pb-[18px] flex-1">
            {agenda.length === 0 ? (
              <p className="text-cly-sm text-cly-text-muted">Tidak ada event yang dijadwalkan</p>
            ) : (() => {
              const todayStr = today();
              const upcomingItems = agenda.filter(e => e.scheduled_date >= todayStr);
              const pastItems = agenda.filter(e => e.scheduled_date < todayStr);

              function renderEventCard(evt: CalendarEvent, variant: 'upcoming' | 'past') {
                const dateObj = new Date(evt.scheduled_date + 'T00:00:00');
                const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                const isChecked = selectedIds.has(evt.id);
                const cardClass = variant === 'upcoming'
                  ? `flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all hover:shadow-cly ${
                      isChecked && selectMode
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                        : 'border-cly-brand/20 bg-cly-brand-tint hover:border-cly-brand'
                    }`
                  : `flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all hover:shadow-cly ${
                      isChecked && selectMode
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                        : 'border-cly-border bg-cly-muted-2 hover:border-cly-brand'
                    }`;

                return (
                  <button
                    key={evt.id}
                    onClick={() => selectMode ? toggleSelect(evt.id) : handleEventClick(evt)}
                    className={cardClass}
                  >
                    {selectMode && (
                      <span className="shrink-0">
                        {isChecked
                          ? <CheckSquare className="size-4 text-red-500" />
                          : <Square className="size-4 text-cly-text-muted" />}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-cly-xs font-${variant === 'upcoming' ? 'semibold' : 'medium'} ${variant === 'upcoming' ? 'text-cly-text' : 'text-cly-text-2'} truncate block`}>{evt.title}</span>
                      <span className={`text-[10px] ${variant === 'upcoming' ? 'text-cly-brand' : 'text-cly-text-muted'}`}>{dateStr}{evt.scheduled_time ? ` · ${evt.scheduled_time}` : ''}</span>
                    </div>
                    {!selectMode && <PlatformBadge platform={evt.platform} />}
                  </button>
                );
              }

              return (
                <div className="flex flex-col gap-1.5">
                  {upcomingItems.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 py-1">
                        <span className="h-px flex-1 bg-cly-border" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cly-brand">Mendatang ({upcomingItems.length})</span>
                        <span className="h-px flex-1 bg-cly-border" />
                      </div>
                      {upcomingItems.map(evt => renderEventCard(evt, 'upcoming'))}
                    </div>
                  )}

                  {pastItems.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 py-1">
                        <span className="h-px flex-1 bg-cly-border" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cly-text-muted">Lampau ({pastItems.length})</span>
                        <span className="h-px flex-1 bg-cly-border" />
                      </div>
                      {pastItems.map(evt => renderEventCard(evt, 'past'))}
                    </div>
                  )}
                </div>
              );
            })()}
            </div>
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

        <ConfirmDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={handleBulkDelete}
          title={`Hapus ${selectedIds.size} Event`}
          description={`Apakah Anda yakin ingin menghapus ${selectedIds.size} event sekaligus? Tindakan ini tidak dapat dibatalkan.`}
          confirmText={`Hapus ${selectedIds.size} Event`}
          cancelText="Batal"
        />
      </div>
    </AppShell>
  );
}
