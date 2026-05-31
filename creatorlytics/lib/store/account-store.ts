import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Account } from '@/types';
import { STORAGE_PREFIX } from '@/lib/constants';

interface AccountState {
  accounts: Account[];
  addAccount: (name: string) => Account;
  removeAccount: (id: string) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      addAccount: (name) => {
        const acc: Account = { id: uuid(), name, created_at: new Date().toISOString() };
        set(s => ({ accounts: [...s.accounts, acc] }));
        return acc;
      },
      removeAccount: (id) => {
        set(s => ({ accounts: s.accounts.filter(a => a.id !== id) }));
      },
    }),
    { name: `${STORAGE_PREFIX}:accounts` }
  )
);
