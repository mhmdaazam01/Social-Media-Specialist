'use client';
import { useData } from '@/lib/context/DataContext';

export function useEvents() {
  const { events, eventsLoading, createEvent, updateEvent, deleteEvent } = useData();
  return { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent };
}
