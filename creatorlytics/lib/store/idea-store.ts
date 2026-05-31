import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { ContentIdea } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface IdeaState {
  ideas: ContentIdea[];
  createIdea: (data: Omit<ContentIdea, 'id' | 'created_at'>) => ContentIdea;
  updateIdea: (id: string, data: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
}

export const useIdeaStore = create<IdeaState>()(
  persist(
    (set, get) => ({
      ideas: [],
      createIdea: (data) => {
        const idea: ContentIdea = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ ideas: [...s.ideas, idea] }));
        return idea;
      },
      updateIdea: (id, data) => {
        set(s => ({ ideas: s.ideas.map(i => i.id === id ? { ...i, ...data } : i) }));
      },
      deleteIdea: (id) => {
        set(s => ({ ideas: s.ideas.filter(i => i.id !== id) }));
      },
    }),
    { name: `${STORAGE_PREFIX}:ideas` }
  )
);
