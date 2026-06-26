import type { CSSProperties, ReactNode } from 'react';
import type { BadgeVariant } from '@/types';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: CSSProperties;
}

const variants: Record<BadgeVariant, string> = {
  brand: 'bg-pink-400 text-white',
  soft: 'bg-pink-100 text-pink-700',
  neutral: 'bg-warm-100 text-ink-700',
  gold: 'text-[#8A5E1E]',
  sale: 'bg-rose-red text-white',
};

export function Badge({ children, variant = 'brand', className, style }: BadgeProps) {
  return (
    <span
      style={{
        letterSpacing: 'var(--tracking-wide)',
        ...(variant === 'gold' ? { background: '#F6EAD6' } : null),
        ...style,
      }}
      className={cn(
        'inline-flex items-center gap-1 font-ui text-xs font-semibold uppercase',
        'px-3 py-1 rounded-full',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
