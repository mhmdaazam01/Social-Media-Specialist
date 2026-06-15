'use client';
import { useData } from '@/lib/context/DataContext';

export function useAccounts() {
  const { accounts, accountsLoading, addAccount, removeAccount } = useData();
  return { accounts, loading: accountsLoading, addAccount, removeAccount };
}
