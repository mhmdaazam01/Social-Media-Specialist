'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import { toast } from 'sonner';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Gagal memuat akun');
    } else if (data) {
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

    if (error) {
      toast.error('Gagal menambahkan akun');
      return null;
    }
    if (data) {
      setAccounts(prev => [...prev, data]);
      return data;
    }
    return null;
  }

  async function removeAccount(id: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus akun');
    } else {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  }

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
  };
}
