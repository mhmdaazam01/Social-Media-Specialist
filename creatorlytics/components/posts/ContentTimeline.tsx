'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useUser } from '@/lib/hooks/useUser';
import { calcER, fmt, fmtPercent } from '@/lib/utils/analytics';
import { formatDate } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import type { Post } from '@/types';

interface ContentTimelineProps {
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export function ContentTimeline({ onEditPost, onDeletePost }: ContentTimelineProps) {
  const { posts } = usePosts();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const { profile } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts]
  );
  const erMode = profile?.er_mode || 'impression';

  function getPlatform(platformId: string) {
    return platforms.find(p => p.platform_id === platformId);
  }

  function getPillar(pillarId: string) {
    return pillars.find(p => p.pillar_id === pillarId);
  }

  function handleDelete(post: Post) {
    if (onDeletePost) {
      onDeletePost(post);
    } else {
      toast.error('Tidak dapat menghapus postingan');
    }
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Belum ada postingan. Tambahkan post pertama kamu!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(post => {
        const platform = getPlatform(post.platform);
        const pillar = getPillar(post.pillar);
        const er = calcER(post, erMode);
        const isExpanded = expandedId === post.id;

        return (
          <Card key={post.id} size="sm" className={cn(isExpanded && 'border-primary/30')}>
            <CardContent>
              <div className="flex w-full items-start gap-3">
                <button
                  type="button"
                  className="flex flex-1 items-start gap-3 text-left min-w-0"
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">{platform?.name || post.platform}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{post.name || 'Tanpa Judul'}</span>
                      {pillar && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px]"
                          style={{
                            borderColor: pillar.color,
                            color: pillar.color,
                            backgroundColor: pillar.bg,
                          }}
                        >
                          {pillar.label}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <span>Reach: {fmt(post.reach)}</span>
                      <span>ER: {fmtPercent(er)}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-auto">
                    {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                  </span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  {onEditPost && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={e => {
                        e.stopPropagation();
                        onEditPost(post);
                      }}
                    >
                      <PencilIcon />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(post);
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground text-xs">Reach</span>
                    <p className="font-medium">{fmt(post.reach)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Impression</span>
                    <p className="font-medium">{fmt(post.impression)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">ER ({erMode})</span>
                    <p className="font-medium">{fmtPercent(er)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Likes</span>
                    <p className="font-medium">{fmt(post.like)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Comments</span>
                    <p className="font-medium">{fmt(post.comment)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Shares</span>
                    <p className="font-medium">{fmt(post.share)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Saves</span>
                    <p className="font-medium">{fmt(post.save)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Reposts</span>
                    <p className="font-medium">{fmt(post.repost)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Followers Gained</span>
                    <p className="font-medium">{fmt(post.followers_gained)}</p>
                  </div>
                  {post.format && (
                    <div>
                      <span className="text-muted-foreground text-xs">Format</span>
                      <p className="font-medium capitalize">{post.format}</p>
                    </div>
                  )}
                  {post.caption_len > 0 && (
                    <div>
                      <span className="text-muted-foreground text-xs">Caption</span>
                      <p className="font-medium">{post.caption_len} karakter</p>
                    </div>
                  )}
                  {post.link && (
                    <div className="col-span-full">
                      <span className="text-muted-foreground text-xs">Link</span>
                      <p className="font-medium truncate">{post.link}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
