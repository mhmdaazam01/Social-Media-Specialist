'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlatformStore } from '@/lib/store/platform-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { calcER, fmt, fmtPercent } from '@/lib/utils/analytics';
import { formatDate } from '@/lib/utils/formatting';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Post } from '@/types';

interface PostRowProps {
  post: Post;
  index: number;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}

export function PostRow({ post, index, onEdit, onDelete }: PostRowProps) {
  const { platforms } = usePlatformStore();
  const { settings } = useSettingsStore();
  const platform = platforms.find(p => p.platform_id === post.platform);
  const er = calcER(post, settings.er_mode);

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
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(post.id)}>
              <Trash2Icon />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
