import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, Check, Clock, Tag, Truck } from 'lucide-react';
import { Badge, Button, Chip, QuantityStepper, Stars, Spinner, ErrorState, ShareButton } from '@/components/ui';
import { useCart } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { useWishlist } from '@/store/useWishlist';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useAsync } from '@/hooks/useAsync';
import { getProduct } from '@/api';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/cn';

const BADGE_VARIANT: Record<string, 'brand' | 'gold' | 'soft'> = {
  Featured: 'brand',
  Trending: 'soft',
  New:      'gold',
};

function DiscountCountdown({ activeUntil }: { activeUntil: string }) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(activeUntil).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(''); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h >= 24) {
        const days = Math.floor(h / 24);
        setTimeLeft(t('product.daysLeft', { days, hours: h % 24 }));
      } else {
        const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        setTimeLeft(t('product.timeLeft', { time: clock }));
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [activeUntil, t]);

  if (!timeLeft) return null;
  return (
    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
      <Clock size={12} className="shrink-0" />
      {timeLeft}
    </span>
  );
}

export function Product() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isMobile } = useLayoutContext();
  const { t }        = useI18n();
  const numericId   = Number(id);

  const { data: product, loading, error, apiError, reload } = useAsync(
    (signal) => getProduct(numericId, signal),
    [numericId],
  );

  const add      = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const liked    = useWishlist((s) => (product ? s.ids.includes(product.id) : false));
  const toggle   = useWishlist((s) => s.toggle);

  const [qty,         setQty]         = useState(1);
  const [size,        setSize]        = useState('');
  const [color,       setColor]       = useState('');
  const [added,       setAdded]       = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
    if (product) {
      setSize(product.sizes?.[0] ?? '');
      setColor(product.colors?.[0] ?? '');
    }
  }, [numericId, product]);

  if (loading) {
    return (
      <main className={cn('max-w-[1240px] mx-auto', isMobile ? 'pt-4 pb-25' : 'px-8 pt-6 pb-16')}>
        <Spinner label={t('product.loadingPiece')} />
      </main>
    );
  }

  if (apiError && (apiError.status === 404 || apiError.status === 400)) {
    return <Navigate to="/shop" replace />;
  }

  if (error || !product) {
    return (
      <main className={cn('max-w-[1240px] mx-auto', isMobile ? 'pt-4 pb-25' : 'px-8 pt-6 pb-16')}>
        <ErrorState message={error ?? t('product.notFound')} onRetry={reload} />
      </main>
    );
  }

  const photos    = (product.images ?? []).map((img) => img?.url).filter(Boolean) as string[];
  const safeIdx   = activePhoto < photos.length ? activePhoto : 0;
  const mainPhoto = photos[safeIdx];

  const discount  = product.discount;
  const hasDiscount = !!discount;

  const onAdd = () => {
    add(product, qty, size, color);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1400);
  };

  const canAdd = product.inStock && product.stock > 0;

  const ratingAvg   = product.rating?.ratingAvg   ?? 0;
  const ratingCount = product.rating?.ratingCount ?? 0;

  return (
    <main className={cn('max-w-[1240px] mx-auto', isMobile ? 'pt-4 pb-25' : 'px-8 pt-6 pb-16')}>
      <button
        type="button"
        onClick={() => navigate('/shop')}
        className={cn(
          'border-0 bg-transparent cursor-pointer text-ink-500 text-sm flex items-center gap-1',
          isMobile ? 'mb-3.5 px-4' : 'mb-4.5',
        )}
      >
        <ChevronLeft size={20} strokeWidth={1.8} className="rtl:-scale-x-100" /> {t('common.backToShop')}
      </button>

      <div className={cn('grid items-start', isMobile ? 'grid-cols-1 gap-0' : 'grid-cols-2 gap-12')}>

        {/* ── Images ── */}
        <div
          className={cn(!isMobile && 'grid gap-3.5')}
          style={!isMobile && photos.length > 1 ? { gridTemplateColumns: '72px 1fr' } : undefined}
        >
          {!isMobile && photos.length > 1 && (
            <div className="flex flex-col gap-2.5">
              {photos.slice(0, 6).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className="relative aspect-[3/4] rounded-md overflow-hidden cursor-pointer p-0 border-0"
                  style={{
                    border: i === safeIdx
                      ? '2px solid var(--color-pink-400)'
                      : '2px solid transparent',
                  }}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div
            className={cn(
              'relative overflow-hidden bg-warm-100',
              isMobile ? 'aspect-square rounded-none' : 'aspect-[3/4] rounded-lg',
              !isMobile && photos.length <= 1 && 'col-span-2',
            )}
            {...(isMobile && photos.length > 1 ? {
              onTouchStart: (e: React.TouchEvent) => {
                const touch = e.touches[0];
                (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(touch.clientX);
              },
              onTouchEnd: (e: React.TouchEvent) => {
                const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX ?? 0);
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) < 40) return;
                if (diff > 0) {
                  setActivePhoto((p) => (p + 1) % photos.length);
                } else {
                  setActivePhoto((p) => (p - 1 + photos.length) % photos.length);
                }
              },
            } : {})}
          >
            {photos.length > 0 ? (
              isMobile ? (
                <div
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ width: `${photos.length * 100}%`, transform: `translateX(${(safeIdx / photos.length) * -100}%)` }}
                >
                  {photos.map((url, i) => (
                    <div key={i} className="h-full flex-none" style={{ width: `${100 / photos.length}%` }}>
                      <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <img src={mainPhoto} alt={product.name} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-script text-8xl text-warm-300">Maibi</span>
              </div>
            )}

            {/* Mobile thumbnail strip */}
            {isMobile && photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-200',
                      i === safeIdx ? 'bg-white w-4' : 'bg-white/60 w-1.5',
                    )}
                  />
                ))}
              </div>
            )}

            {product.badgeLabel && !hasDiscount && (
              <div className="absolute top-3.5 start-3.5">
                <Badge variant={BADGE_VARIANT[product.badgeLabel] ?? 'gold'}>
                  {t(`badge.${product.badgeLabel}` as TranslationKey)}
                </Badge>
              </div>
            )}

            {hasDiscount && (
              <div className="absolute top-3.5 start-3.5">
                <Badge variant="sale">
                  <Tag size={11} /> -{discount.percent}%
                </Badge>
              </div>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 bg-ink-900/40 flex items-center justify-center">
                <span className="bg-white/90 text-ink-700 text-sm font-bold px-4 py-2 rounded-full">
                  {t('common.soldOut')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className={cn(isMobile ? 'px-4 pt-5' : 'sticky top-25')}>
          <h1
            className={cn(
              'font-display font-semibold text-ink-900 m-0 mb-1.5',
              isMobile ? 'text-3xl' : 'text-[44px]',
            )}
          >
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mb-2 flex items-center gap-2">
            <Stars rating={Math.round(ratingAvg)} />
            {ratingCount > 0 ? (
              <span className="text-xs text-ink-400">
                {ratingAvg.toFixed(1)} ({t(ratingCount === 1 ? 'product.reviewOne' : 'product.reviewMany', { count: ratingCount })})
              </span>
            ) : (
              <span className="text-xs text-ink-400">{t('product.noReviews')}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            {hasDiscount ? (
              <>
                <span className={cn('font-bold text-rose-600', isMobile ? 'text-[22px]' : 'text-[26px]')}>
                  {discount.discountedPrice}
                </span>
                <span className={cn('font-medium text-ink-400 line-through', isMobile ? 'text-base' : 'text-lg')}>
                  {product.price}
                </span>
              </>
            ) : (
              <span className={cn('font-bold text-pink-600', isMobile ? 'text-[22px]' : 'text-[26px]')}>
                {product.price}
              </span>
            )}
          </div>

          {/* Discount savings callout — with the single countdown */}
          {hasDiscount && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5 mb-3.5">
              <Tag size={14} className="text-rose-500 shrink-0" />
              <p className="text-sm font-semibold text-rose-700">
                {t('product.sale', { percent: discount.percent })}
              </p>
              <span className="ml-auto">
                <DiscountCountdown activeUntil={discount.activeUntil} />
              </span>
            </div>
          )}

          {product.description && (
            <p className={cn('text-ink-700 leading-relaxed my-3.5', isMobile ? 'text-sm' : 'text-base')}>
              {product.description}
            </p>
          )}

          {/* Stock indicator */}
          <div className="py-3 mb-4.5 space-y-2">
            {product.inStock ? (() => {
              const pct   = Math.min(100, Math.round((product.stock / 30) * 100));
              const level = product.stock <= 3 ? 'critical' : product.stock <= 10 ? 'low' : 'ok';
              const bar   = level === 'critical' ? 'bg-red-400' : level === 'low' ? 'bg-amber-400' : 'bg-emerald-400';
              const label = level === 'critical'
                ? t('product.onlyLeft', { count: product.stock })
                : level === 'low'
                ? t('product.leftSellingFast', { count: product.stock })
                : t('product.inStockCount', { count: product.stock });
              const labelColor = level === 'critical' ? 'text-red-600' : level === 'low' ? 'text-amber-600' : 'text-emerald-700';
              return (
                <>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={cn('font-semibold', labelColor)}>{label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${pct}%` }} />
                  </div>
                </>
              );
            })() : (
              <span className="text-sm font-semibold text-ink-400">{t('product.currentlyUnavailable')}</span>
            )}
            <div className="flex items-center gap-1.5 text-ink-400 text-xs">
              <Truck size={12} className="shrink-0" />
              {t('product.shipsIn')}
            </div>
          </div>

          {/* Sizes */}
          {(product.sizes?.length ?? 0) > 0 && (
            <>
              <div className="font-semibold text-ink-900 mb-2 text-[15px]">{t('product.size')}</div>
              <div className="flex gap-2 mb-5 flex-wrap">
                {product.sizes.map((s) => (
                  <Chip key={s} selected={size === s} onClick={() => setSize(s)}>{s}</Chip>
                ))}
              </div>
            </>
          )}

          {/* Colors */}
          {(product.colors?.length ?? 0) > 0 && (
            <>
              <div className="font-semibold text-ink-900 mb-2 text-[15px]">
                {t('product.color')} <span className="font-normal text-ink-500 text-sm">— {color || t('product.selectColor')}</span>
              </div>
              <div className="flex gap-2 mb-5 flex-wrap">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-all',
                      color === c
                        ? 'border-pink-400 bg-pink-50 text-pink-600'
                        : 'border-warm-200 text-ink-600 hover:border-pink-200',
                    )}
                  >
                    {color === c && <Check size={12} className="inline me-1" />}
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 items-center">
            <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
            <div className="flex-1">
              <Button full size={isMobile ? 'md' : 'lg'} onClick={onAdd} disabled={!canAdd}>
                {!product.inStock ? t('common.soldOut') : added ? t('product.added') : t('product.addToBag')}
              </Button>
            </div>
            <Button
              variant="secondary"
              size={isMobile ? 'md' : 'lg'}
              aria-label={liked ? t('product.removeFromWishlist') : t('product.addToWishlist')}
              onClick={() => toggle(product.id)}
              className="!px-4 grid place-items-center"
            >
              <Heart size={20} fill={liked ? 'var(--color-pink-500)' : 'none'} />
            </Button>
            <ShareButton
              productId={product.id}
              productName={product.name}
              price={hasDiscount ? discount.discountedPrice : product.price}
              imageUrl={mainPhoto}
              size={isMobile ? 'sm' : 'md'}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
