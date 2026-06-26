import { Star } from 'lucide-react';

interface StarsProps {
  /** Number of filled stars out of 5. */
  rating?: number;
  size?: number;
}

/** Gold 5-star rating row. */
export function Stars({ rating = 4, size = 15 }: StarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          strokeWidth={1.8}
          className="text-gold"
          fill={s <= rating ? 'var(--color-gold)' : 'none'}
        />
      ))}
    </div>
  );
}
