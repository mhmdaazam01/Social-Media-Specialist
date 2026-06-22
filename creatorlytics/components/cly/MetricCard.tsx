'use client';

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tone?: 'green' | 'blue' | 'amber';
  caption?: string;
}

export function MetricCard({ 
  label, 
  value, 
  delta, 
  deltaLabel = '', 
  icon: Icon, 
  tone = 'green', 
  caption 
}: MetricCardProps) {
  const negative = typeof delta === 'number' && delta < 0;
  
  const colorMap = {
    green: { icon: 'text-cly-green', bg: 'bg-cly-green-tint' },
    blue: { icon: 'text-cly-blue', bg: 'bg-cly-blue-tint' },
    amber: { icon: 'text-cly-amber', bg: 'bg-cly-amber-tint' },
  };
  
  const colors = negative 
    ? { icon: 'text-cly-red', bg: 'bg-cly-red-tint' }
    : colorMap[tone];

  return (
    <div className="bg-cly-surface border border-cly-border rounded-lg p-3.5 shadow-[0_1px_2px_rgba(29,33,27,0.05),0_10px_24px_rgba(29,33,27,0.04)] min-h-[120px]">
      <div className="flex justify-between items-start mb-5">
        <div className="text-[11px] font-bold text-cly-text-3 uppercase tracking-wider">
          {label}
        </div>
        <div className={`w-[30px] h-[30px] rounded-lg ${colors.bg} ${colors.icon} grid place-items-center`}>
          <Icon size={15} />
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2.5">
        <div>
          <div className="text-[27px] font-extrabold text-cly-text leading-none tracking-tight">
            {value}
          </div>
          {caption && (
            <div className="text-[11px] text-cly-text-3 mt-1.5">{caption}</div>
          )}
        </div>
        
        {delta !== undefined && (
          <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${colors.icon}`}>
            {negative ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {negative ? '' : '+'}{delta}{deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
}
