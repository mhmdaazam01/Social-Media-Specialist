'use client';
import { useData } from '@/lib/context/DataContext';

export function useCompetitors() {
  const { competitors, competitorsLoading, createCompetitor, updateCompetitor, deleteCompetitor } = useData();
  return { competitors, loading: competitorsLoading, createCompetitor, updateCompetitor, deleteCompetitor };
}
