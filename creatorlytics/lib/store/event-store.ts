import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { CalendarEvent } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface EventState {
  events: CalendarEvent[];
  getEvents: () => CalendarEvent[];
  createEvent: (data: Omit<CalendarEvent, 'id' | 'created_at'>) => CalendarEvent;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      getEvents: () => get().events,
      createEvent: (data) => {
        const event: CalendarEvent = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ events: [...s.events, event] }));
        return event;
      },
      updateEvent: (id, data) => {
        set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...data } : e) }));
      },
      deleteEvent: (id) => {
        set(s => ({ events: s.events.filter(e => e.id !== id) }));
      },
    }),
    { name: `${STORAGE_PREFIX}:events` }
  )
);
