import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Interactive 1–5 star selector with hover preview. */
export function StarRating({ value, onChange, size = 38 }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Rate ${s} out of 5`}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            className="flex cursor-pointer p-0.5 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={size}
              strokeWidth={1.6}
              className={cn('transition-colors', s <= shown ? 'text-gold' : 'text-warm-300')}
              fill={s <= shown ? 'var(--color-gold)' : 'none'}
            />
          </button>
        ))}
      </div>
      <span
        className={cn(
          'text-sm font-semibold transition-colors',
          shown ? 'text-gold' : 'text-ink-400',
        )}
      >
        {shown ? LABELS[shown] : 'Tap to rate'}
      </span>
    </div>
  );
}
