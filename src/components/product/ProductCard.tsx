import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { Badge, Button, Stars } from '@/components/ui';
import { useWishlist } from '@/store/useWishlist';
import { cn } from '@/lib/cn';

interface ProductCardProps {
  product: Product;
  isMobile?: boolean;
  isTablet?: boolean;
}

const BADGE_VARIANT: Record<string, 'brand' | 'gold' | 'soft'> = {
  Featured: 'brand',
  Trending: 'soft',
  New:      'gold',
};

export function ProductCard({ product, isMobile, isTablet }: ProductCardProps) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const liked  = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  const open    = () => navigate(`/product/${product.id}`);
  const compact = isMobile || isTablet;
  const image   = product.images?.[0]?.url;

  return (
    <div
      onClick={open}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer transition-transform duration-200"
      style={{ transform: hover ? 'translateY(-4px)' : 'none' }}
    >
      <div className="relative rounded-lg overflow-hidden aspect-[3/4] bg-warm-100">
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{ transform: hover ? 'scale(1.05)' : 'none' }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-warm-100">
              <span className="font-script text-5xl text-warm-300">Maibi</span>
            </div>
          )}
        </div>

        {product.badgeLabel && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={BADGE_VARIANT[product.badgeLabel] ?? 'gold'}>
              {product.badgeLabel}
            </Badge>
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-ink-900/40 flex items-center justify-center">
            <span className="bg-white/90 text-ink-700 text-xs font-bold px-3 py-1 rounded-full">
              Sold out
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className={cn(
            'absolute top-2.5 right-2.5 rounded-full border-0 cursor-pointer',
            'bg-white/90 backdrop-blur-sm shadow-sm grid place-items-center',
            isMobile ? 'w-8 h-8' : 'w-9 h-9',
            liked ? 'text-pink-500' : 'text-ink-400',
          )}
        >
          <Heart size={18} fill={liked ? 'var(--color-pink-500)' : 'none'} />
        </button>

        {!isMobile && (
          <div
            className="absolute inset-x-3 bottom-3 transition-all duration-200"
            style={{
              opacity:   hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <Button full size="sm" onClick={(e) => { e.stopPropagation(); open(); }}>
              View piece
            </Button>
          </div>
        )}
      </div>

      <div className="pt-2.5">
        <div className={cn('font-semibold text-ink-900', compact ? 'text-sm' : 'text-base')}>
          {product.name}
        </div>
        <div className="flex gap-1.5 items-baseline mt-0.5">
          <span className={cn('font-bold text-pink-600', compact ? 'text-sm' : 'text-base')}>
            {product.price}
          </span>
        </div>
        {!isMobile && (
          <div className="mt-1">
            <Stars rating={4} />
          </div>
        )}
      </div>
    </div>
  );
}
