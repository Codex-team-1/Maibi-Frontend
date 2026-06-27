import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { Badge, Button, Stars } from '@/components/ui';
import { useWishlist } from '@/store/useWishlist';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/cn';

const BADGE_VARIANT: Record<string, 'brand' | 'gold' | 'soft'> = {
  Featured: 'brand',
  Trending: 'soft',
  New:      'gold',
};

export function ProductListCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [hover, setHover] = useState(false);
  const liked  = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const open   = () => navigate(`/product/${product.id}`);
  const image  = product.images?.[0]?.url;

  return (
    <div
      onClick={open}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'flex gap-4 bg-white rounded-lg border border-warm-200 p-3.5 cursor-pointer transition-shadow',
        hover ? 'shadow-md' : 'shadow-sm',
      )}
    >
      <div className="relative w-25 flex-none rounded-md overflow-hidden aspect-[3/4] basis-[100px] bg-warm-100">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-script text-2xl text-warm-300">M</span>
          </div>
        )}
        {product.badgeLabel && (
          <div className="absolute top-2 start-2">
            <Badge variant={BADGE_VARIANT[product.badgeLabel] ?? 'gold'}>{t(`badge.${product.badgeLabel}` as TranslationKey)}</Badge>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="font-display text-xl font-semibold text-ink-900">{product.name}</div>
        <Stars rating={4} />
        <div className="text-[13px] text-ink-500 line-clamp-2">{product.description || product.category}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-pink-600 text-[17px]">{product.price}</span>
          {!product.inStock && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{t('common.soldOut')}</span>
          )}
        </div>
        {(product.sizes?.length ?? 0) > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {product.sizes.map((s) => (
              <span key={s} className="text-[10px] font-semibold bg-warm-100 text-ink-500 px-1.5 py-0.5 rounded">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 justify-center">
        <Button size="sm" onClick={(e) => { e.stopPropagation(); open(); }}>{t('product.view')}</Button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className={cn(
            'border-2 border-pink-200 rounded-full bg-white px-3 py-1.5 cursor-pointer',
            'flex items-center gap-1.5 text-xs font-semibold',
            liked ? 'text-pink-500' : 'text-ink-400',
          )}
        >
          <Heart size={14} fill={liked ? 'var(--color-pink-500)' : 'none'} /> {t('common.save')}
        </button>
      </div>
    </div>
  );
}
