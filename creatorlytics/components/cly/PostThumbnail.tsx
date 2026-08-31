'use client';

import { getValidHref } from '@/lib/utils/link';

interface PostThumbnailProps {
  name?: string;
  thumbnail?: string;
  platform?: string;
  link?: string;
  size?: number;
  className?: string;
  asLink?: boolean;
}

function extractIGShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:(?:share|accounts)\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

export function PostThumbnail({
  name,
  thumbnail,
  platform,
  link,
  size = 36,
  className = '',
  asLink = true,
}: PostThumbnailProps) {
  const validUrl = link ? getValidHref(link) : '#';
  const isBrokenIgThumb = thumbnail?.includes('/media/?size=m');
  const showThumbnail = thumbnail && !isBrokenIgThumb;

  let igShortcode: string | null = null;
  if (!showThumbnail && validUrl && validUrl !== '#' && validUrl.includes('instagram.com')) {
    igShortcode = extractIGShortcode(validUrl);
  }

  const containerStyle = { width: size, height: size };

  const inner = (
    <div
      className={`rounded-md bg-cly-muted border border-cly-border/50 shrink-0 overflow-hidden flex items-center justify-center relative ${className}`}
      style={containerStyle}
    >
      {showThumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={name || 'Thumbnail'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (next) next.style.display = 'flex';
          }}
        />
      ) : igShortcode ? (
        <div className="w-full h-full overflow-hidden pointer-events-none bg-white absolute inset-0">
          <iframe
            src={`https://www.instagram.com/p/${igShortcode}/embed/captioned`}
            style={{
              width: '320px',
              height: '400px',
              transform: `scale(${size / 320})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              border: 'none',
            }}
            scrolling="no"
            loading="lazy"
            title={name || 'Instagram post'}
          />
        </div>
      ) : (
        <span className="text-[9px] font-bold text-cly-text-3 uppercase">
          {name ? name.substring(0, 2) : (platform ? platform.substring(0, 2) : '?')}
        </span>
      )}
    </div>
  );

  if (asLink && validUrl && validUrl !== '#') {
    return (
      <a
        href={validUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity shrink-0"
        style={containerStyle}
      >
        {inner}
      </a>
    );
  }

  return inner;
}

