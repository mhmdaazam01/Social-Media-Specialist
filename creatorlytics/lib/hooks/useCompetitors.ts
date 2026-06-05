'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';
import type { Competitor } from '@/types';

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchCompetitors();
    } else {
      setCompetitors([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchCompetitors() {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat data kompetitor');
    } else if (data) {
      setCompetitors(data);
    }
    setLoading(false);
  }

  async function createCompetitor(competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('competitors')
      .insert([{ ...competitor, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error('Gagal menambahkan kompetitor');
      return null;
    }
    if (data) {
      setCompetitors(prev => [data, ...prev]);
      return data;
    }
    return null;
  }

  async function updateCompetitor(id: string, updates: Partial<Competitor>) {
    const { error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui kompetitor');
    } else {
      setCompetitors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }

  async function deleteCompetitor(id: string) {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus kompetitor');
    } else {
      setCompetitors(prev => prev.filter(c => c.id !== id));
    }
  }

  return {
    competitors,
    loading,
    createCompetitor,
    updateCompetitor,
    deleteCompetitor,
  };
}
