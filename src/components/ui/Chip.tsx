import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Selectable filter chip / category pill. */
export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-ui text-sm font-medium px-4 py-2 rounded-full cursor-pointer',
        'transition-all border-2',
        selected
          ? 'bg-pink-400 text-white border-pink-400'
          : 'bg-white text-ink-700 border-warm-200 hover:border-pink-200',
        className,
      )}
    >
      {children}
    </button>
  );
}
