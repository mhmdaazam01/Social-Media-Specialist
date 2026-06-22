'use client';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'blue' | 'amber' | 'red' | 'purple';
  dot?: boolean;
}

const tones = {
  neutral: 'bg-cly-muted text-cly-text-2',
  green: 'bg-cly-green-tint text-cly-green',
  blue: 'bg-cly-blue-tint text-cly-blue',
  amber: 'bg-cly-amber-tint text-cly-amber',
  red: 'bg-cly-red-tint text-cly-red',
  purple: 'bg-cly-purple-tint text-cly-purple',
};

export function Badge({ children, tone = 'neutral', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tones[tone]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
