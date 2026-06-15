'use client';
import { useData } from '@/lib/context/DataContext';

export function usePillars() {
  const { pillars, pillarsLoading, addPillar, removePillar } = useData();
  return { pillars, loading: pillarsLoading, addPillar, removePillar };
}
