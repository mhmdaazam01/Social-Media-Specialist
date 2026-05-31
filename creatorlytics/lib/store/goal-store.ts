import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Goal } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface GoalState {
  goals: Goal[];
  createGoal: (data: Omit<Goal, 'id' | 'created_at'>) => Goal;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      createGoal: (data) => {
        const goal: Goal = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ goals: [...s.goals, goal] }));
        return goal;
      },
      updateGoal: (id, data) => {
        set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...data } : g) }));
      },
      deleteGoal: (id) => {
        set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
      },
    }),
    { name: `${STORAGE_PREFIX}:goals` }
  )
);
