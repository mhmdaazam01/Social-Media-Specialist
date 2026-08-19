'use client';

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tone?: 'green' | 'blue' | 'amber' | 'purple' | 'coral' | 'neutral';
  caption?: string;
  loading?: boolean;
}

export function MetricCard({ 
  label, 
  value, 
  delta, 
  deltaLabel = '', 
  icon: Icon, 
  tone = 'green', 
  caption,
  loading
}: MetricCardProps) {
  if (loading) {
    return <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 min-h-[120px] sm:min-h-[140px] animate-pulse bg-gradient-to-br from-cly-muted to-white dark:to-cly-surface" />;
  }

  const negative = typeof delta === 'number' && delta < 0;
  
  const colorMap = {
    green: { 
      gradient: 'from-[#A8E6CF] to-[#6ECDB0] dark:from-[#86D5BC] dark:to-[#5FD0B2]',
      icon: 'text-white',
      text: 'text-white'
    },
    blue: { 
      gradient: 'from-[#8EC5FC] to-[#6BA3E8] dark:from-[#76ACE8] dark:to-[#60A5FA]',
      icon: 'text-white',
      text: 'text-white'
    },
    amber: { 
      gradient: 'from-[#FFE5B4] to-[#FFD699] dark:from-[#FFD99C] dark:to-[#F5C76A]',
      icon: 'text-[#8B6914] dark:text-white',
      text: 'text-[#8B6914] dark:text-white'
    },
    purple: { 
      gradient: 'from-[#C5B9E8] to-[#A899D8] dark:from-[#B7A5E8] dark:to-[#A78BFA]',
      icon: 'text-white',
      text: 'text-white'
    },
    coral: { 
      gradient: 'from-[#FFB5A0] to-[#FF9680] dark:from-[#FFA590] dark:to-[#FF8F7A]',
      icon: 'text-white',
      text: 'text-white'
    },
    neutral: {
      gradient: 'from-white to-cly-muted dark:from-cly-surface dark:to-cly-muted',
      icon: 'text-cly-text',
      text: 'text-cly-text'
    }
  };
  
  const colors = negative 
    ? { gradient: 'from-[#FFB5A0] to-[#FF9680] dark:from-[#FFA590] dark:to-[#FF8F7A]', icon: 'text-white', text: 'text-white' }
    : (colorMap[tone as keyof typeof colorMap] || colorMap.green);

  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 min-h-[120px] sm:min-h-[140px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className={`text-[10px] sm:text-xs font-semibold ${colors.text} opacity-90 uppercase tracking-wide`}>
          {label}
        </div>
        <div className={`size-8 sm:size-9 rounded-lg sm:rounded-xl ${colors.icon} bg-white/20 backdrop-blur-sm grid place-items-center`}>
          <Icon size={16} className="sm:size-[18px]" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className={`text-2xl sm:text-3xl font-black ${colors.text} leading-none tracking-tight`}>
            {value}
          </div>
          {caption && (
            <div className={`text-[10px] sm:text-xs ${colors.text} opacity-75 mt-1 sm:mt-1.5 font-medium`}>{caption}</div>
          )}
        </div>
        
        {delta !== undefined && (
          <div className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold ${colors.text} bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg`}>
            {negative ? <TrendingDown size={12} className="sm:size-[14px]" strokeWidth={3} /> : <TrendingUp size={12} className="sm:size-[14px]" strokeWidth={3} />}
            {negative ? '' : '+'}{delta}{deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
}
