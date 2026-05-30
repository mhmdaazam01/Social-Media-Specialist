import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Platform } from '@/types';
import { STORAGE_PREFIX, DEFAULT_PLATFORMS } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<Platform>('platforms');

interface PlatformState {
  platforms: Platform[];
  getPlatforms: () => Platform[];
  addPlatform: (data: { platform_id: string; name: string; emoji: string }) => Platform;
  removePlatform: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      platforms: DEFAULT_PLATFORMS.map(p => ({ ...p, id: uuid() })),
      getPlatforms: () => get().platforms,
      addPlatform: (data) => {
        const p: Platform = { ...data, id: uuid() };
        set(s => ({ platforms: [...s.platforms, p] }));
        sync.upsert([p]);
        return p;
      },
      removePlatform: (id) => {
        set(s => ({ platforms: s.platforms.filter(p => p.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ platforms: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:platforms` }
  )
);
