'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { CollabTargetType } from '@/types';

const ShareModal = dynamic(() => import('./ShareModal').then(m => m.ShareModal), { ssr: false });

interface ShareButtonProps {
  targetType: CollabTargetType;
}

export function ShareButton({ targetType }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id={`share-button-${targetType}`}
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-cly-border bg-white dark:bg-cly-surface px-3 text-xs font-medium text-cly-text-2 transition-all hover:border-cly-brand hover:text-cly-brand hover:bg-cly-muted active:scale-95 shadow-sm"
      >
        <Users size={14} className="shrink-0" />
        <span>Share</span>
      </button>

      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
      />
    </>
  );
}
