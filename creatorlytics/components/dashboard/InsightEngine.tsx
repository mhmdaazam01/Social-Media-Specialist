'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { useUser } from '@/lib/hooks/useUser';
import { generateInsights } from '@/lib/utils/insights';
import { cn } from '@/lib/utils';
import { Lightbulb, Trophy, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

const typeConfig = {
  tip: { icon: Lightbulb, className: 'text-blue-500 bg-blue-500/10' },
  achievement: { icon: Trophy, className: 'text-amber-500 bg-amber-500/10' },
  warning: { icon: AlertTriangle, className: 'text-red-500 bg-red-500/10' },
  trend: { icon: TrendingUp, className: 'text-purple-500 bg-purple-500/10' },
};

export function InsightEngine() {
  const { posts } = usePosts();
  const { goals } = useGoals();
  const { profile } = useUser();
  const erMode = profile?.er_mode || 'impression';

  const insights = useMemo(
    () => generateInsights(posts, goals, erMode),
    [posts, goals, erMode]
  );

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-muted-foreground" />
          Insight & Rekomendasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;

            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    config.className
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
