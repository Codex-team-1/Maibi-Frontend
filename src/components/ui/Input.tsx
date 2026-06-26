import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
}

/**
 * Labelled text input with the brand's pink focus ring. forwardRef so it
 * composes with React Hook Form's `register`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, iconLeft, className, ...rest },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5 font-ui w-full">
      {label && (
        <span className="text-sm font-semibold text-ink-700">{label}</span>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <span className="absolute left-3.5 text-ink-400 flex">{iconLeft}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full box-border font-ui text-base text-ink-900 bg-white rounded-md outline-none',
            'border-2 transition-[border-color,box-shadow]',
            'focus:border-pink-400 focus:shadow-[0_0_0_4px_var(--color-pink-50)]',
            iconLeft ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
            error ? 'border-rose-red' : 'border-warm-200',
            className,
          )}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span className={cn('text-xs', error ? 'text-rose-red' : 'text-ink-500')}>
          {error || hint}
        </span>
      )}
    </label>
  );
});
