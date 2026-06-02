'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Account } from '@/types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAccounts(data);
    }
    setLoading(false);
  }

  async function addAccount(name: string) {
    if (!user) return null;

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setAccounts([...accounts, data]);
      return data;
    }
    return null;
  }

  async function removeAccount(id: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  }

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
  };
}
