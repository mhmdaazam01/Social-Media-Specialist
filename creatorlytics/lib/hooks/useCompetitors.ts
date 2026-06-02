'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
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
  }, [user]);

  async function fetchCompetitors() {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
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

    if (!error && data) {
      setCompetitors([data, ...competitors]);
      return data;
    }
    return null;
  }

  async function updateCompetitor(id: string, updates: Partial<Competitor>) {
    const { error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setCompetitors(competitors.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }

  async function deleteCompetitor(id: string) {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (!error) {
      setCompetitors(competitors.filter(c => c.id !== id));
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
