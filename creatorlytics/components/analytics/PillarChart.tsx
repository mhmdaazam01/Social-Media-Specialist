'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmt, fmtPercent } from '@/lib/utils/analytics';
import { usePillars } from '@/lib/hooks/usePillars';

interface PillarChartProps {
  data: {
    pillar: string;
    count: number;
    avgER: number;
    totalReach: number;
  }[];
}

export function PillarChart({ data }: PillarChartProps) {
  const { pillars } = usePillars();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performa Pillar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Belum ada data pillar.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enrich data with pillar colors
  const enrichedData = data.map(item => {
    const pillarInfo = pillars.find(p => p.pillar_id === item.pillar);
    return {
      ...item,
      pillarLabel: pillarInfo?.label || item.pillar,
      pillarColor: pillarInfo?.color || '#3B82F6',
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Pillar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrichedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="pillarLabel"
                fontSize={12}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  if (name === 'avgER') return fmtPercent(Number(value));
                  return fmt(Number(value));
                }}
              />
              <Bar
                dataKey="count"
                name="Jumlah Post"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="avgER"
                name="Rata-rata ER"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
