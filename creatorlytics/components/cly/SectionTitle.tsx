import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  note?: string;
  action?: ReactNode;
}

export function SectionTitle({ title, note, action }: SectionTitleProps) {
  return (
    <div className="flex justify-between gap-3 items-start mb-4">
      <div>
        <div className="text-base font-bold text-cly-text tracking-tight">{title}</div>
        {note && (
          <div className="text-sm text-cly-text-3 mt-1 leading-relaxed">
            {note}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
