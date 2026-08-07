'use client';
import { useData } from '@/lib/context/DataContext';

export function useAccounts() {
  const { accounts, accountsLoading, addAccount, updateAccount, removeAccount } = useData();
  return { accounts, loading: accountsLoading, addAccount, updateAccount, removeAccount };
}
