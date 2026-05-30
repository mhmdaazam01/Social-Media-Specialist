import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { CalendarEvent } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<CalendarEvent>('calendar_events');

interface EventState {
  events: CalendarEvent[];
  getEvents: () => CalendarEvent[];
  createEvent: (data: Omit<CalendarEvent, 'id' | 'created_at'>) => CalendarEvent;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      getEvents: () => get().events,
      createEvent: (data) => {
        const event: CalendarEvent = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ events: [...s.events, event] }));
        sync.upsert([event]);
        return event;
      },
      updateEvent: (id, data) => {
        set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...data } : e) }));
        const updated = get().events.find(e => e.id === id);
        if (updated) sync.upsert([updated]);
      },
      deleteEvent: (id) => {
        set(s => ({ events: s.events.filter(e => e.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ events: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:events` }
  )
);
