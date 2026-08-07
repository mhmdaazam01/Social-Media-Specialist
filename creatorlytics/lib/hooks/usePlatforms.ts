'use client';

import { useData } from '@/lib/context/DataContext';

export function usePlatforms() {
  const {
    platforms,
    platformsLoading: loading,
    addPlatform,
    updatePlatform,
    removePlatform,
  } = useData();

  return {
    platforms,
    loading,
    addPlatform,
    updatePlatform,
    removePlatform,
  };
}
