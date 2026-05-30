import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Pillar } from '@/types';
import { STORAGE_PREFIX, DEFAULT_PILLARS } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<Pillar>('pillars');

interface PillarState {
  pillars: Pillar[];
  getPillars: () => Pillar[];
  addPillar: (data: { pillar_id: string; label: string; emoji: string; color: string; bg: string }) => Pillar;
  removePillar: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const usePillarStore = create<PillarState>()(
  persist(
    (set, get) => ({
      pillars: DEFAULT_PILLARS.map(p => ({ ...p, id: uuid() })),
      getPillars: () => get().pillars,
      addPillar: (data) => {
        const p: Pillar = { ...data, id: uuid() };
        set(s => ({ pillars: [...s.pillars, p] }));
        sync.upsert([p]);
        return p;
      },
      removePillar: (id) => {
        set(s => ({ pillars: s.pillars.filter(p => p.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ pillars: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:pillars` }
  )
);
