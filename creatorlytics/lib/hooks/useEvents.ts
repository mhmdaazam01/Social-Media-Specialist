'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { CalendarEvent } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  }

  async function createEvent(event: Omit<CalendarEvent, 'id' | 'created_at'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{ ...event, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setEvents([...events, data]);
      return data;
    }
    return null;
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const { error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
    }
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (!error) {
      setEvents(events.filter(e => e.id !== id));
    }
  }

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
