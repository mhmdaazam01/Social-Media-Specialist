'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalEventModal } from '@/components/calendar/CalEventModal';
import { useEvents } from '@/lib/hooks/useEvents';
import { today } from '@/lib/utils/formatting';
import type { CalendarEvent } from '@/types';

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const { events, deleteEvent } = useEvents();

  function handlePrevMonth() {
    if (month === 1) {
      setYear(y => y - 1);
      setMonth(12);
    } else {
      setMonth(m => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      setYear(y => y + 1);
      setMonth(1);
    } else {
      setMonth(m => m + 1);
    }
  }

  function handleDateClick(date: string) {
    setSelectedDate(date);
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

  return (
    <AppShell title="Kalender">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kalender Konten</h2>
          <Button onClick={handleAdd}>
            <PlusIcon />
            Event
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-muted-foreground">Belum ada jadwal konten. Yuk rencanakan!</p>
            <Button variant="outline" onClick={handleAdd}>Buat Event Pertama</Button>
          </div>
        ) : null}

        <CalendarGrid
          year={year}
          month={month}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <CalEventModal
          open={modalOpen}
          onOpenChange={handleClose}
          editEvent={editEvent}
          defaultDate={selectedDate}
        />
      </div>
    </AppShell>
  );
}
