'use client';

interface PlatformBadgeProps {
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'LinkedIn' | string;
}

const platforms: Record<string, { color: string; bg: string }> = {
  TikTok: { color: 'text-platform-tiktok', bg: 'bg-platform-tiktok-tint' },
  Instagram: { color: 'text-platform-instagram', bg: 'bg-platform-instagram-tint' },
  YouTube: { color: 'text-platform-youtube', bg: 'bg-platform-youtube-tint' },
  LinkedIn: { color: 'text-platform-linkedin', bg: 'bg-platform-linkedin-tint' },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const p = platforms[platform] || { color: 'text-cly-text-2', bg: 'bg-cly-muted' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${p.color} ${p.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {platform}
    </span>
  );
}
