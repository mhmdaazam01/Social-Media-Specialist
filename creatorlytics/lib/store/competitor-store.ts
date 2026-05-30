import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Competitor } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<Competitor>('competitors');

interface CompetitorState {
  competitors: Competitor[];
  getCompetitors: () => Competitor[];
  createCompetitor: (data: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => Competitor;
  updateCompetitor: (id: string, data: Partial<Competitor>) => void;
  deleteCompetitor: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const useCompetitorStore = create<CompetitorState>()(
  persist(
    (set, get) => ({
      competitors: [],
      getCompetitors: () => get().competitors,
      createCompetitor: (data) => {
        const now = new Date().toISOString();
        const comp: Competitor = { ...data, id: uuid(), updated_at: now, created_at: now };
        set(s => ({ competitors: [...s.competitors, comp] }));
        sync.upsert([comp]);
        return comp;
      },
      updateCompetitor: (id, data) => {
        set(s => ({
          competitors: s.competitors.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
        }));
        const updated = get().competitors.find(c => c.id === id);
        if (updated) sync.upsert([updated]);
      },
      deleteCompetitor: (id) => {
        set(s => ({ competitors: s.competitors.filter(c => c.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ competitors: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:competitors` }
  )
);
