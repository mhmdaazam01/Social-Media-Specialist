'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Pillar } from '@/types';

export function usePillars() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchPillars();
    } else {
      setPillars([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchPillars() {
    const { data, error } = await supabase
      .from('pillars')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPillars(data);
    }
    setLoading(false);
  }

  async function addPillar(pillar: Omit<Pillar, 'id'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('pillars')
      .insert([{ ...pillar, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setPillars([...pillars, data]);
      return data;
    }
    return null;
  }

  async function removePillar(id: string) {
    const { error } = await supabase
      .from('pillars')
      .delete()
      .eq('id', id);

    if (!error) {
      setPillars(pillars.filter(p => p.id !== id));
    }
  }

  return {
    pillars,
    loading,
    addPillar,
    removePillar,
  };
}
