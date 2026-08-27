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
import { ShareButton } from '@/components/collaboration/ShareButton';
import { useUser } from '@/lib/hooks/useUser';
import { useCollaboration } from '@/lib/context/CollaborationContext';
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
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(true);
  const { events, deleteEvent } = useEvents();
  const { user } = useUser();
  const { activeWorkspaceId, getRoleInWorkspace } = useCollaboration();

  const isOwnWorkspace = !activeWorkspaceId || activeWorkspaceId === user?.id;
  const roleInActiveWorkspace = isOwnWorkspace ? 'owner' : getRoleInWorkspace(activeWorkspaceId ?? '');
  const isViewer = !isOwnWorkspace && roleInActiveWorkspace === 'viewer';

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const rawStartDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const startDay = weekStartsOnMonday ? (rawStartDay + 6) % 7 : rawStartDay;
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
  }, [year, month, events, weekStartsOnMonday]);

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
    if (isViewer) return;
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
      <style jsx global>{`
        .calendar-typography h1,
        .calendar-typography h2,
        .calendar-typography h3,
        .calendar-typography button[class*="font-bold"],
        .calendar-typography span[class*="font-semibold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .calendar-typography button[class*="font-medium"],
        .calendar-typography span[class*="font-medium"],
        .calendar-typography [class*="uppercase"][class*="tracking"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .calendar-typography p,
        .calendar-typography span:not([class*="font-bold"]):not([class*="font-semibold"]):not([class*="font-medium"]),
        .calendar-typography div[class*="text-xs"]:not([class*="font-bold"]):not([class*="font-semibold"]) {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-[18px] p-[18px] calendar-typography">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-cly-text">Kalender Konten</h2>
          <div className="flex items-center gap-2">
            {!isViewer && <ShareButton targetType="calendar" />}
            {!isViewer && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
              >
                <PlusIcon className="size-4" />
                Event Baru
              </button>
            )}
          </div>
        </div>

        {/* Two-column layout: Calendar + Agenda */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[2fr_1fr]">
          
          {/* Calendar Grid */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {/* Month navigation */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold capitalize text-cly-text">{monthName}</h3>
                {(year !== now.getFullYear() || month !== now.getMonth() + 1) && (
                  <button
                    onClick={() => {
                      const cur = new Date();
                      setYear(cur.getFullYear());
                      setMonth(cur.getMonth() + 1);
                    }}
                    className="rounded-md border border-cly-border bg-cly-muted/60 px-2 py-0.5 text-[11px] font-semibold text-cly-text-2 hover:bg-cly-brand-tint hover:text-cly-brand transition-all"
                  >
                    Bulan Ini
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Week Start Toggle */}
                <div className="flex items-center rounded-lg border border-cly-border bg-cly-muted/40 p-0.5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setWeekStartsOnMonday(true)}
                    className={`rounded-md px-2 py-0.5 transition-all ${
                      weekStartsOnMonday
                        ? 'bg-white font-semibold text-cly-brand shadow-xs'
                        : 'text-cly-text-3 hover:text-cly-text'
                    }`}
                  >
                    Senin
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekStartsOnMonday(false)}
                    className={`rounded-md px-2 py-0.5 transition-all ${
                      !weekStartsOnMonday
                        ? 'bg-white font-semibold text-cly-brand shadow-xs'
                        : 'text-cly-text-3 hover:text-cly-text'
                    }`}
                  >
                    Minggu
                  </button>
                </div>

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
                    aria-label="Bulan sebelumnya"
                    className="rounded-lg border border-cly-border bg-white p-1.5 text-cly-text-3 transition-all hover:border-cly-brand hover:text-cly-brand hover:shadow-sm"
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
                    aria-label="Bulan berikutnya"
                    className="rounded-lg border border-cly-border bg-white p-1.5 text-cly-text-3 transition-all hover:border-cly-brand hover:text-cly-brand hover:shadow-sm"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {(weekStartsOnMonday
                ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
                : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
              ).map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-cly-text-3">
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
                    className={`min-h-[80px] rounded-xl border p-2 transition-all ${
                      day.date
                        ? 'cursor-pointer border-cly-border bg-white hover:border-cly-brand hover:shadow-sm'
                        : 'border-transparent bg-gradient-to-br from-cly-muted to-white'
                    }`}
                    onClick={() => day.dateStr && handleDateClick(day.dateStr)}
                  >
                    {day.date && (
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              isToday ? 'text-cly-brand' : 'text-cly-text'
                            }`}
                          >
                            {day.date}
                          </span>
                          {hasConflict && (
                            <span className="size-2 rounded-full bg-gradient-to-br from-[#FFB5A0] to-[#FF9680]" title="Multiple events" />
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
                              className="truncate rounded-lg bg-gradient-to-br from-cly-brand-tint to-white px-1.5 py-0.5 text-left text-xs text-cly-brand hover:from-cly-brand/10 hover:to-cly-brand/5 transition-all font-medium"
                            >
                              {evt.title}
                            </button>
                          ))}
                          {day.events.length > 2 && (
                            <span className="px-1.5 text-xs text-cly-text-3 font-medium">
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
          <div className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {/* Sidebar header with select mode controls */}
            <div className="px-6 pt-6 pb-3 shrink-0 flex items-center justify-between">
              <h3 className="text-base font-bold text-cly-text">Semua Event</h3>
              {agenda.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {selectMode ? (
                    <>
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-cly-text-2 hover:bg-cly-muted transition-all"
                        title={selectedIds.size === agenda.length ? 'Batal pilih semua' : 'Pilih semua'}
                      >
                        {selectedIds.size === agenda.length ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                        Semua
                      </button>
                      {selectedIds.size > 0 && (
                        <button
                          onClick={() => setBulkDeleteOpen(true)}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#FFB5A0] to-[#FF9680] px-2.5 py-1 text-xs font-semibold text-white hover:shadow-md transition-all"
                        >
                          <Trash2 className="size-3" />
                          Hapus ({selectedIds.size})
                        </button>
                      )}
                      <button
                        onClick={exitSelectMode}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-cly-text-2 hover:bg-cly-muted transition-all"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-cly-text-2 hover:bg-cly-muted transition-all"
                    >
                      <CheckSquare className="size-3.5" />
                      Pilih
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="overflow-y-auto px-6 pb-6 flex-1">
            {agenda.length === 0 ? (
              <p className="text-sm text-cly-text-3">Tidak ada event yang dijadwalkan</p>
            ) : (() => {
              const todayStr = today();
              const upcomingItems = agenda.filter(e => e.scheduled_date >= todayStr);
              const pastItems = agenda.filter(e => e.scheduled_date < todayStr);

              function renderEventCard(evt: CalendarEvent, variant: 'upcoming' | 'past') {
                const dateObj = new Date(evt.scheduled_date + 'T00:00:00');
                const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                const isChecked = selectedIds.has(evt.id);
                const cardClass = variant === 'upcoming'
                  ? `flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all hover:shadow-sm ${
                      isChecked && selectMode
                        ? 'border-[#FFB5A0] bg-gradient-to-br from-[#FFB5A0]/10 to-[#FF9680]/5'
                        : 'border-cly-brand/20 bg-gradient-to-br from-cly-brand-tint to-white hover:border-cly-brand'
                    }`
                  : `flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all hover:shadow-sm ${
                      isChecked && selectMode
                        ? 'border-[#FFB5A0] bg-gradient-to-br from-[#FFB5A0]/10 to-[#FF9680]/5'
                        : 'border-cly-border bg-gradient-to-br from-cly-muted-2 to-white hover:border-cly-brand'
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
                          ? <CheckSquare className="size-4 text-[#FFB5A0]" />
                          : <Square className="size-4 text-cly-text-3" />}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-${variant === 'upcoming' ? 'semibold' : 'medium'} ${variant === 'upcoming' ? 'text-cly-text' : 'text-cly-text-2'} truncate block`}>{evt.title}</span>
                      <span className={`text-[10px] font-medium ${variant === 'upcoming' ? 'text-cly-brand' : 'text-cly-text-3'}`}>{dateStr}{evt.scheduled_time ? ` · ${evt.scheduled_time}` : ''}</span>
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
          readOnly={isViewer}
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
