'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortMonth } from '@/lib/utils/formatting';

interface TrendChartProps {
  data: {
    month: string;
    totalReach: number;
    totalImpression: number;
    avgER: number;
  }[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Belum ada data tren.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(v) => formatShortMonth(v)}
                fontSize={12}
              />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip
                labelFormatter={(v) => formatShortMonth(v)}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalReach"
                name="Reach"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalImpression"
                name="Impression"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgER"
                name="ER %"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
