import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Competitor } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface CompetitorState {
  competitors: Competitor[];
  createCompetitor: (data: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => Competitor;
  updateCompetitor: (id: string, data: Partial<Competitor>) => void;
  deleteCompetitor: (id: string) => void;
}

export const useCompetitorStore = create<CompetitorState>()(
  persist(
    (set, get) => ({
      competitors: [],
      createCompetitor: (data) => {
        const now = new Date().toISOString();
        const comp: Competitor = { ...data, id: uuid(), created_at: now, updated_at: now };
        set(s => ({ competitors: [...s.competitors, comp] }));
        return comp;
      },
      updateCompetitor: (id, data) => {
        set(s => ({ competitors: s.competitors.map(c => c.id === id ? { ...c, ...data } : c) }));
      },
      deleteCompetitor: (id) => {
        set(s => ({ competitors: s.competitors.filter(c => c.id !== id) }));
      },
    }),
    { name: `${STORAGE_PREFIX}:competitors` }
  )
);
