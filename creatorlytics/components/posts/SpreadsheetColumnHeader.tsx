'use client';

import React from 'react';
import { ChevronDown, ArrowDown, ArrowUp } from 'lucide-react';

export type ColumnDataType = 'number' | 'date' | 'text';

export interface SpreadsheetColumnHeaderProps {
  title: string;
  field: string;
  type?: ColumnDataType;
  align?: 'left' | 'center' | 'right';
  className?: string;
  currentSortField: string | null;
  currentSortDirection: 'asc' | 'desc' | null;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onResetSort?: () => void;
}

export function SpreadsheetColumnHeader({
  title,
  field,
  type = 'number',
  align = 'center',
  className = '',
  currentSortField,
  currentSortDirection,
  onSort,
  onResetSort,
}: SpreadsheetColumnHeaderProps) {
  const isSorted = currentSortField === field;
  const isAsc = isSorted && currentSortDirection === 'asc';
  const isDesc = isSorted && currentSortDirection === 'desc';

  // Toggle sort directly when button or header is clicked:
  // For numbers: 1st click -> 'desc' (terbanyak), 2nd click -> 'asc' (tersedikit), 3rd click -> reset
  // For dates: 1st click -> 'asc' (terlama), 2nd click -> 'desc' (terbaru)
  // For text: 1st click -> 'asc' (A-Z), 2nd click -> 'desc' (Z-A), 3rd click -> reset
  const handleToggleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isSorted) {
      if (type === 'number') {
        onSort(field, 'desc');
      } else if (type === 'date') {
        onSort(field, 'asc');
      } else {
        onSort(field, 'asc');
      }
    } else if (type === 'number') {
      if (isDesc) {
        onSort(field, 'asc');
      } else if (onResetSort) {
        onResetSort();
      } else {
        onSort(field, 'desc');
      }
    } else if (type === 'date') {
      if (isAsc) {
        onSort(field, 'desc');
      } else {
        onSort(field, 'asc');
      }
    } else {
      // text
      if (isAsc) {
        onSort(field, 'desc');
      } else if (onResetSort) {
        onResetSort();
      } else {
        onSort(field, 'asc');
      }
    }
  };

  // Tooltip description
  const getTooltip = () => {
    if (!isSorted) {
      return type === 'number'
        ? `Klik untuk urutkan ${title} terbanyak`
        : type === 'date'
        ? `Klik untuk urutkan ${title} terlama`
        : `Klik untuk urutkan ${title} (A-Z)`;
    }
    if (isDesc) {
      return type === 'number'
        ? `${title} terbanyak aktif. Klik untuk urutkan tersedikit.`
        : `${title} (Z-A) aktif. Klik untuk reset.`;
    }
    return type === 'number'
      ? `${title} tersedikit aktif. Klik untuk reset.`
      : `${title} (A-Z) aktif. Klik untuk urutkan (Z-A).`;
  };

  const justifyClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <th 
      onClick={handleToggleSort}
      className={`py-3 px-2 text-xs font-semibold uppercase tracking-wider select-none cursor-pointer group transition-colors hover:bg-cly-muted/60 ${className}`}
      title={getTooltip()}
    >
      <div className={`flex items-center gap-1.5 ${justifyClass}`}>
        {/* Title */}
        <span 
          className={`transition-colors inline-flex items-center gap-1 group-hover:text-cly-brand ${
            isSorted ? 'text-cly-brand font-bold' : 'text-cly-text-3'
          }`}
        >
          {title}
        </span>

        {/* Spreadsheet-style Sort Button */}
        <button
          type="button"
          onClick={handleToggleSort}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-150 outline-none cursor-pointer shrink-0 ${
            isSorted
              ? 'bg-cly-brand text-white shadow-xs scale-105 ring-1 ring-cly-brand/40'
              : 'bg-[#2B354F] hover:bg-[#1E2738] text-white opacity-85 hover:opacity-100 shadow-2xs hover:scale-105'
          }`}
          aria-label={`Sortir kolom ${title}`}
        >
          {isDesc ? (
            <ArrowDown size={12} className="stroke-[2.5]" />
          ) : isAsc ? (
            <ArrowUp size={12} className="stroke-[2.5]" />
          ) : (
            <ChevronDown size={12} className="stroke-[2.5]" />
          )}
        </button>
      </div>
    </th>
  );
}
