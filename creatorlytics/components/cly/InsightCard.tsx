import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  tone?: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  loading?: boolean;
}

export function InsightCard({ icon: Icon, title, text, tone = 'green', loading }: InsightCardProps) {
  const toneStyles = {
    green: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/50' },
    blue: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/50' },
    amber: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/50' },
    red: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-100 dark:border-rose-900/50' },
    purple: { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-100 dark:border-purple-900/50' },
  };

  const style = toneStyles[tone];

  if (loading) {
    return <div className="bg-white dark:bg-cly-surface rounded-xl p-3 sm:p-4 h-[80px] sm:h-[90px] animate-pulse shadow-sm" />;
  }

  return (
    <div className={`bg-white dark:bg-cly-surface border ${style.border} rounded-xl shadow-sm p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start hover:shadow-md transition-shadow`}>
      <div className={`size-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl grid place-items-center ${style.color} ${style.bg} shrink-0`}>
        <Icon size={16} className="sm:size-[18px]" strokeWidth={2} />
      </div>
      <div>
        <div className="text-xs sm:text-sm font-bold text-cly-text mb-0.5 sm:mb-1">{title}</div>
        <div className="text-[11px] sm:text-xs text-cly-text-2 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
