'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Goal } from '@/types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  }

  async function createGoal(goal: Omit<Goal, 'id' | 'created_at'>) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setGoals([data, ...goals]);
      return data;
    }
    return null;
  }

  async function updateGoal(id: string, updates: Partial<Goal>) {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
    }
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      setGoals(goals.filter(g => g.id !== id));
    }
  }

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
