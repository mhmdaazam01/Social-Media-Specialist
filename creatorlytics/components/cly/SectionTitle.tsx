import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  note?: string;
  action?: ReactNode;
}

export function SectionTitle({ title, note, action }: SectionTitleProps) {
  return (
    <div className="flex justify-between gap-3 items-start mb-3.5">
      <div>
        <div className="text-cly-md font-bold text-cly-text">{title}</div>
        {note && (
          <div className="text-cly-sm text-cly-text-3 mt-1 leading-snug">
            {note}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
