'use client';

import { useData } from '@/lib/context/DataContext';

export function usePlatforms() {
  const {
    platforms,
    platformsLoading: loading,
    addPlatform,
    removePlatform,
  } = useData();

  return {
    platforms,
    loading,
    addPlatform,
    removePlatform,
  };
}
