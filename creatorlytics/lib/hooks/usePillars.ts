'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchPillars() {
    const { data, error } = await supabase
      .from('pillars')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Gagal memuat pilar konten');
    } else if (data) {
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

    if (error) {
      toast.error('Gagal menambahkan pilar');
      return null;
    }
    if (data) {
      setPillars(prev => [...prev, data]);
      return data;
    }
    return null;
  }

  async function removePillar(id: string) {
    const { error } = await supabase
      .from('pillars')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus pilar');
    } else {
      setPillars(prev => prev.filter(p => p.id !== id));
    }
  }

  return {
    pillars,
    loading,
    addPillar,
    removePillar,
  };
}
