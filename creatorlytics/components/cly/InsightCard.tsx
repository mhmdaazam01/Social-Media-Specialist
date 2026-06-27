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
    green: { color: 'text-cly-green', bg: 'bg-cly-green-tint' },
    blue: { color: 'text-cly-blue', bg: 'bg-cly-blue-tint' },
    amber: { color: 'text-cly-amber', bg: 'bg-cly-amber-tint' },
    red: { color: 'text-cly-red', bg: 'bg-cly-red-tint' },
    purple: { color: 'text-cly-purple', bg: 'bg-cly-purple-tint' },
  };

  const style = toneStyles[tone];

  if (loading) {
    return <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 h-[90px] animate-pulse" />;
  }

  return (
    <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 flex gap-3 items-start">
      <div className={`w-[34px] h-[34px] rounded-lg grid place-items-center ${style.color} ${style.bg} shrink-0`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-cly-base font-bold text-cly-text mb-1">{title}</div>
        <div className="text-cly-sm text-cly-text-2 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
