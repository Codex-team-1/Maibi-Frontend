import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Tag } from 'lucide-react';
import type { Product } from '@/types';
import { Badge, Button, Stars } from '@/components/ui';
import { useWishlist } from '@/store/useWishlist';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/cn';

interface ProductCardProps {
  product: Product;
  isMobile?: boolean;
  isTablet?: boolean;
  forceBadge?: 'Featured' | 'Trending' | 'New';
}

const BADGE_VARIANT: Record<string, 'brand' | 'gold' | 'soft'> = {
  Featured: 'brand',
  Trending: 'soft',
  New:      'gold',
};

export function ProductCard({ product, isMobile, isTablet, forceBadge }: ProductCardProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [hover, setHover] = useState(false);
  const liked  = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  const open       = () => navigate(`/product/${product.id}`);
  const compact    = isMobile || isTablet;
  const image      = product.images?.[0]?.url;
  const discount   = product.discount;
  const hasDiscount = !!discount;
  const ratingAvg  = product.rating?.ratingAvg ?? 0;

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

        {hasDiscount ? (
          <div className="absolute top-2.5 start-2.5">
            <Badge variant="sale">
              <Tag size={10} /> -{discount.percent}%
            </Badge>
          </div>
        ) : forceBadge ? (
          <div className="absolute top-2.5 start-2.5">
            <Badge variant={BADGE_VARIANT[forceBadge] ?? 'gold'}>
              {t(`badge.${forceBadge}` as TranslationKey)}
            </Badge>
          </div>
        ) : null}

        {!product.inStock && (
          <div className="absolute inset-0 bg-ink-900/40 flex items-center justify-center">
            <span className="bg-white/90 text-ink-700 text-xs font-bold px-3 py-1 rounded-full">
              {t('common.soldOut')}
            </span>
          </div>
        )}

        {/* Wishlist — top-end corner */}
        <div className="absolute top-2.5 end-2.5">
          <button
            type="button"
            aria-label={liked ? t('product.removeFromWishlist') : t('product.addToWishlist')}
            onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
            className={cn(
              'rounded-full border-0 cursor-pointer',
              'bg-white/90 backdrop-blur-sm shadow-sm grid place-items-center',
              isMobile ? 'w-8 h-8' : 'w-9 h-9',
              liked ? 'text-pink-500' : 'text-ink-400',
            )}
          >
            <Heart size={18} fill={liked ? 'var(--color-pink-500)' : 'none'} />
          </button>
        </div>

        {!isMobile && (
          <div
            className="absolute inset-x-3 bottom-3 transition-all duration-200"
            style={{
              opacity:   hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <Button full size="sm" onClick={(e) => { e.stopPropagation(); open(); }}>
              {t('product.viewPiece')}
            </Button>
          </div>
        )}
      </div>

      <div className="pt-2.5">
        <div className={cn('font-semibold text-ink-900', compact ? 'text-sm' : 'text-base')}>
          {product.name}
        </div>
        <div className="flex gap-1.5 items-baseline mt-0.5 flex-wrap">
          {hasDiscount ? (
            <>
              <span className={cn('font-bold text-rose-600', compact ? 'text-sm' : 'text-base')}>
                {discount.discountedPrice}
              </span>
              <span className="text-xs text-ink-400 line-through">{product.price}</span>
            </>
          ) : (
            <span className={cn('font-bold text-pink-600', compact ? 'text-sm' : 'text-base')}>
              {product.price}
            </span>
          )}
        </div>
        {!isMobile && (
          <div className="mt-1">
            <Stars rating={Math.round(ratingAvg)} />
          </div>
        )}
      </div>
    </div>
  );
}
