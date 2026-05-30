import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Account } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';
import { createSync } from '@/lib/supabase/sync';

const sync = createSync<Account>('accounts');

interface AccountState {
  accounts: Account[];
  getAccounts: () => Account[];
  addAccount: (name: string) => Account;
  removeAccount: (id: string) => void;
  syncFromSupabase: () => Promise<void>;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [{ id: uuid(), name: 'Akun Utama', created_at: new Date().toISOString() }],
      getAccounts: () => get().accounts,
      addAccount: (name) => {
        const acc: Account = { id: uuid(), name, created_at: new Date().toISOString() };
        set(s => ({ accounts: [...s.accounts, acc] }));
        sync.upsert([acc]);
        return acc;
      },
      removeAccount: (id) => {
        set(s => ({ accounts: s.accounts.filter(a => a.id !== id) }));
        sync.remove([id]);
      },
      syncFromSupabase: async () => {
        const data = await sync.loadAll();
        if (data.length) set({ accounts: data });
      },
    }),
    { name: `${STORAGE_PREFIX}:accounts` }
  )
);
