'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const trendConfig = {
  up: { icon: TrendingUp, className: 'text-green-500' },
  down: { icon: TrendingDown, className: 'text-red-500' },
  neutral: { icon: Minus, className: 'text-muted-foreground' },
};

export function KPICard({ title, value, icon, subtitle, trend }: KPICardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{title}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
          {TrendIcon && (
            <TrendIcon
              size={14}
              className={cn(
                trend && trendConfig[trend].className
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
