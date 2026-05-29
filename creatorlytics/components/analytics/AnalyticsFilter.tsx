'use client';

import { RotateCcw } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AnalyticsFilterProps {
  platform: string;
  onPlatformChange: (p: string) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (r: { from: string; to: string }) => void;
}

export function AnalyticsFilter({
  platform,
  onPlatformChange,
  dateRange,
  onDateRangeChange,
}: AnalyticsFilterProps) {
  const platforms = usePlatformStore((s) => s.platforms);

  const handleReset = () => {
    onPlatformChange('all');
    onDateRangeChange({ from: '', to: '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Platform</span>
        <Select value={platform} onValueChange={(v) => v && onPlatformChange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Platform</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p.id} value={p.platform_id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dari</span>
        <Input
          type="date"
          value={dateRange.from}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, from: e.target.value })
          }
          className="w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sampai</span>
        <Input
          type="date"
          value={dateRange.to}
          onChange={(e) =>
            onDateRangeChange({ ...dateRange, to: e.target.value })
          }
          className="w-40"
        />
      </div>

      <Button variant="outline" size="sm" onClick={handleReset}>
        <RotateCcw className="size-3.5 mr-1" />
        Reset
      </Button>
    </div>
  );
}
