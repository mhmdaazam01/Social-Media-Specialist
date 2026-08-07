'use client';
import { useData } from '@/lib/context/DataContext';

export function usePillars() {
  const { pillars, pillarsLoading, addPillar, updatePillar, removePillar } = useData();
  return { pillars, loading: pillarsLoading, addPillar, updatePillar, removePillar };
}
