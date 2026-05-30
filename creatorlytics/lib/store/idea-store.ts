import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { ContentIdea } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<ContentIdea>('content_ideas');

interface IdeaState {
  ideas: ContentIdea[];
  getIdeas: () => ContentIdea[];
  createIdea: (data: Omit<ContentIdea, 'id' | 'created_at'>) => ContentIdea;
  updateIdea: (id: string, data: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const useIdeaStore = create<IdeaState>()(
  persist(
    (set, get) => ({
      ideas: [],
      getIdeas: () => get().ideas,
      createIdea: (data) => {
        const idea: ContentIdea = { ...data, id: uuid(), created_at: new Date().toISOString() };
        set(s => ({ ideas: [idea, ...s.ideas] }));
        sync.upsert([idea]);
        return idea;
      },
      updateIdea: (id, data) => {
        set(s => ({ ideas: s.ideas.map(i => i.id === id ? { ...i, ...data } : i) }));
        const updated = get().ideas.find(i => i.id === id);
        if (updated) sync.upsert([updated]);
      },
      deleteIdea: (id) => {
        set(s => ({ ideas: s.ideas.filter(i => i.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ ideas: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:ideas` }
  )
);
