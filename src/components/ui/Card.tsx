import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  stitch?: boolean;
  hoverable?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Card({
  children,
  stitch = false,
  hoverable = false,
  className,
  style,
}: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        'bg-white rounded-lg shadow-sm transition-[transform,box-shadow]',
        stitch ? 'border-stitch' : 'border border-warm-200',
        hoverable && 'hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}
