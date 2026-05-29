import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, ErMode, Theme } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface SettingsState {
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        display_name: 'Kreator',
        niche: '',
        er_mode: 'impression' as ErMode,
        theme: 'dark' as Theme,
      },
      updateSettings: (data) => {
        set(s => ({ settings: { ...s.settings, ...data } }));
      },
    }),
    { name: `${STORAGE_PREFIX}:settings` }
  )
);
