'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';
import type { ContentIdea } from '@/types';

export function useIdeas() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchIdeas();
    } else {
      setIdeas([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchIdeas() {
    const { data, error } = await supabase
      .from('content_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat ide konten');
    } else if (data) {
      setIdeas(data);
    }
    setLoading(false);
  }

  async function createIdea(idea: Omit<ContentIdea, 'id' | 'created_at'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('content_ideas')
      .insert([{ ...idea, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error('Gagal menambahkan ide');
      return null;
    }
    if (data) {
      setIdeas(prev => [data, ...prev]);
      return data;
    }
    return null;
  }

  async function updateIdea(id: string, updates: Partial<ContentIdea>) {
    const { error } = await supabase
      .from('content_ideas')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui ide');
    } else {
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  }

  async function deleteIdea(id: string) {
    const { error } = await supabase
      .from('content_ideas')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus ide');
    } else {
      setIdeas(prev => prev.filter(i => i.id !== id));
    }
  }

  return {
    ideas,
    loading,
    createIdea,
    updateIdea,
    deleteIdea,
  };
}
