import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { Button, Spinner } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlist } from '@/store/useWishlist';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useAsync } from '@/hooks/useAsync';
import { getProduct } from '@/api';
import { ApiError } from '@/lib/api';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';

export function Wishlist() {
  const navigate = useNavigate();
  const { isMobile } = useLayoutContext();
  const { t } = useI18n();
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);

  const idsKey = ids.join(',');

  // Fetch each saved product; tolerate ones that 404 (deleted/inactive).
  const { data, loading } = useAsync<Product[]>(
    async (signal) => {
      if (ids.length === 0) return [];
      const results = await Promise.all(
        ids.map((id) =>
          getProduct(id, signal).catch((err) => {
            if (err instanceof ApiError && err.status === 404) return null;
            throw err;
          }),
        ),
      );
      return results.filter((p): p is Product => p !== null);
    },
    [idsKey],
  );

  const items = data ?? [];

  return (
    <main
      className={cn(
        'max-w-[1240px] mx-auto',
        isMobile ? 'px-4 pt-6 pb-25' : 'px-8 pt-10 pb-20',
      )}
    >
      <div className="flex items-baseline gap-3.5 mb-7">
        <h1
          className={cn(
            'font-display font-semibold text-ink-900 m-0',
            isMobile ? 'text-3xl' : 'text-[40px]',
          )}
        >
          {t('wishlist.title')}
        </h1>
        {items.length > 0 && (
          <span className="text-ink-500 text-sm">
            {t(items.length === 1 ? 'shop.countOne' : 'shop.countMany', { count: items.length })}
          </span>
        )}
      </div>

      {loading && ids.length > 0 ? (
        <Spinner label={t('wishlist.loading')} />
      ) : items.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-17 h-17 rounded-full bg-pink-50 grid place-items-center mx-auto mb-4.5 border-2 border-dashed border-pink-200 text-ink-400">
            <Heart size={26} strokeWidth={1.8} />
          </div>
          <div className="font-display text-2xl font-semibold text-ink-900 mb-2">
            {t('wishlist.emptyTitle')}
          </div>
          <p className="text-ink-500 max-w-[280px] mx-auto mb-5.5 text-sm">
            {t('wishlist.emptyBody')}
          </p>
          <Button onClick={() => navigate('/shop')} iconRight={<ArrowRight size={18} className="rtl:-scale-x-100" />}>
            {t('wishlist.discoverPieces')}
          </Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'grid mb-8',
              isMobile ? 'grid-cols-2 gap-3.5' : 'grid-cols-4 gap-7',
            )}
          >
            {items.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} isMobile={isMobile} />
                <div className="mt-2">
                  <Button
                    variant="stitch"
                    full
                    size="sm"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    {t('wishlist.addToBag')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-warm-300 pt-5 flex justify-between items-center flex-wrap gap-2.5">
            <span className="text-ink-500 text-[13px]">
              {t('wishlist.notReserved')}
            </span>
            <Button
              variant="ghost"
              onClick={clear}
              className="text-ink-400 text-[13px]"
            >
              {t('wishlist.clear')}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
