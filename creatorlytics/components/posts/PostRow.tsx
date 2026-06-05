'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useUser } from '@/lib/hooks/useUser';
import { calcER, fmt, fmtPercent } from '@/lib/utils/analytics';
import { formatDate } from '@/lib/utils/formatting';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Post } from '@/types';

interface PostRowProps {
  post: Post;
  index: number;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export function PostRow({ post, index, onEdit, onDelete }: PostRowProps) {
  const { platforms } = usePlatforms();
  const { profile } = useUser();
  const platform = platforms.find(p => p.platform_id === post.platform);
  const er = calcER(post, profile?.er_mode || 'impression');

  return (
    <TableRow>
      <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
      <TableCell className="max-w-[180px] truncate font-medium">{post.name || 'Tanpa Judul'}</TableCell>
      <TableCell><Badge variant="secondary" className="text-[10px]">{platform?.name || post.platform}</Badge></TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatDate(post.date)}</TableCell>
      <TableCell className="text-right">{fmt(post.reach)}</TableCell>
      <TableCell className="text-right font-medium">{fmtPercent(er)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(post)}>
              <PencilIcon />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(post)}>
              <Trash2Icon />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
