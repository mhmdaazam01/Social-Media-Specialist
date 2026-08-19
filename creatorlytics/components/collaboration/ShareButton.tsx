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
        className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-white px-4 py-2 text-xs font-semibold text-cly-text transition-all hover:border-cly-brand hover:text-cly-brand hover:shadow-md active:scale-95 shadow-sm"
      >
        <Users className="size-5" />
        Share
      </button>

      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
      />
    </>
  );
}
