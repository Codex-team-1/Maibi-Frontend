import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'stitch';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
  > {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

const sizes: Record<Size, string> = {
  sm: 'px-[18px] py-2 text-sm',
  md: 'px-[26px] py-3 text-base',
  lg: 'px-[34px] py-[15px] text-lg',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-pink-400 text-white border-2 border-transparent shadow-brand hover:brightness-105',
  secondary:
    'bg-white text-pink-600 border-2 border-pink-200 shadow-sm hover:bg-pink-50',
  ghost: 'bg-transparent text-pink-600 border-2 border-transparent',
  stitch: 'bg-pink-50 text-pink-600 border-stitch',
};

/** Maibi primary action button — rounded, soft, feminine. */
export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  className,
  style,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.14, ease: [0.34, 1.2, 0.4, 1] }}
      disabled={disabled}
      style={style}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-ui font-semibold rounded-full',
        'transition-[filter,background-color] cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-45',
        full && 'w-full',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </motion.button>
  );
}
