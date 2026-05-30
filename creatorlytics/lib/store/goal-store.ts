import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Goal } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<Goal>('goals');

interface GoalState {
  goals: Goal[];
  getGoals: () => Goal[];
  createGoal: (data: Omit<Goal, 'id' | 'created_at'>) => Goal;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      getGoals: () => get().goals,
      createGoal: (data) => {
        const goal: Goal = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ goals: [...s.goals, goal] }));
        sync.upsert([goal]);
        return goal;
      },
      updateGoal: (id, data) => {
        set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...data } : g) }));
        const updated = get().goals.find(g => g.id === id);
        if (updated) sync.upsert([updated]);
      },
      deleteGoal: (id) => {
        set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ goals: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:goals` }
  )
);
