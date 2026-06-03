'use client';

// Re-export from centralized context — all consumers share the same auth state
export { useUser } from '@/lib/context/UserContext';
