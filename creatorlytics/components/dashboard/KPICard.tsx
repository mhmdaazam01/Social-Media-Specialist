'use client';

import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export function KPICard({ title, value, icon }: KPICardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{title}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
