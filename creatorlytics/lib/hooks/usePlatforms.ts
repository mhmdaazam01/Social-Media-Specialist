'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Platform } from '@/types';

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchPlatforms();
    } else {
      setPlatforms([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchPlatforms() {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPlatforms(data);
    }
    setLoading(false);
  }

  async function addPlatform(platform: Omit<Platform, 'id'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('platforms')
      .insert([{ ...platform, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setPlatforms([...platforms, data]);
      return data;
    }
    return null;
  }

  async function removePlatform(id: string) {
    const { error } = await supabase
      .from('platforms')
      .delete()
      .eq('id', id);

    if (!error) {
      setPlatforms(platforms.filter(p => p.id !== id));
    }
  }

  return {
    platforms,
    loading,
    addPlatform,
    removePlatform,
  };
}
