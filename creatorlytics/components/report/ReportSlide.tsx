'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ReportSlideProps {
  title: string;
  children: React.ReactNode;
}

export function ReportSlide({ title, children }: ReportSlideProps) {
  return (
    <Card className="break-inside-avoid print:shadow-none print:ring-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
