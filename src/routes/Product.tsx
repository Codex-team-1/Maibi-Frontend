import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, Star, Check } from 'lucide-react';
import { Badge, Button, Chip, QuantityStepper, Stars, Spinner, ErrorState } from '@/components/ui';
import { useCart } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { useWishlist } from '@/store/useWishlist';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useAsync } from '@/hooks/useAsync';
import { getProduct } from '@/api';
import { cn } from '@/lib/cn';

const BADGE_VARIANT: Record<string, 'brand' | 'gold' | 'soft'> = {
  Featured: 'brand',
  Trending: 'soft',
  New:      'gold',
};

export function Product() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isMobile } = useLayoutContext();
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
        <Spinner label="Loading piece…" />
      </main>
    );
  }

  if (apiError && (apiError.status === 404 || apiError.status === 400)) {
    return <Navigate to="/shop" replace />;
  }

  if (error || !product) {
    return (
      <main className={cn('max-w-[1240px] mx-auto', isMobile ? 'pt-4 pb-25' : 'px-8 pt-6 pb-16')}>
        <ErrorState message={error ?? 'Product not found.'} onRetry={reload} />
      </main>
    );
  }

  const photos    = (product.images ?? []).map((img) => img?.url).filter(Boolean) as string[];
  const safeIdx   = activePhoto < photos.length ? activePhoto : 0;
  const mainPhoto = photos[safeIdx];

  const onAdd = () => {
    add(product, qty, size, color);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1400);
  };

  const canAdd = product.inStock && product.stock > 0;

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
        <ChevronLeft size={20} strokeWidth={1.8} /> Back to shop
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
              isMobile ? 'aspect-[4/3] rounded-none' : 'aspect-[3/4] rounded-lg',
              !isMobile && photos.length <= 1 && 'col-span-2',
            )}
          >
            {mainPhoto ? (
              <img src={mainPhoto} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-script text-8xl text-warm-300">Maibi</span>
              </div>
            )}

            {/* Mobile thumbnail strip */}
            {isMobile && photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      i === safeIdx ? 'bg-white w-4' : 'bg-white/60',
                    )}
                  />
                ))}
              </div>
            )}

            {product.badgeLabel && (
              <div className="absolute top-3.5 left-3.5">
                <Badge variant={BADGE_VARIANT[product.badgeLabel] ?? 'gold'}>
                  {product.badgeLabel}
                </Badge>
              </div>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 bg-ink-900/40 flex items-center justify-center">
                <span className="bg-white/90 text-ink-700 text-sm font-bold px-4 py-2 rounded-full">
                  Sold out
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

          <div className="mb-2">
            <Stars rating={4} />
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className={cn('font-bold text-pink-600', isMobile ? 'text-[22px]' : 'text-[26px]')}>
              {product.price}
            </span>
            {!product.inStock ? (
              <span className="text-sm font-semibold text-red-500">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm font-semibold text-amber-600">Only {product.stock} left</span>
            ) : null}
          </div>

          {product.description && (
            <p className={cn('text-ink-700 leading-relaxed my-3.5', isMobile ? 'text-sm' : 'text-base')}>
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-ink-500 text-[13px] border-stitch border-x-0 py-3 mb-4.5">
            <Star size={15} className="text-gold" fill="var(--color-gold)" />
            {product.inStock ? `${product.stock} in stock` : 'Currently unavailable'} · ships in 3–5 days
          </div>

          {/* Sizes */}
          {(product.sizes?.length ?? 0) > 0 && (
            <>
              <div className="font-semibold text-ink-900 mb-2 text-[15px]">Size</div>
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
                Color <span className="font-normal text-ink-500 text-sm">— {color || 'select one'}</span>
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
                    {color === c && <Check size={12} className="inline mr-1" />}
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 items-center">
            <QuantityStepper value={qty} onChange={setQty} />
            <div className="flex-1">
              <Button full size={isMobile ? 'md' : 'lg'} onClick={onAdd} disabled={!canAdd}>
                {!product.inStock ? 'Sold out' : added ? '♥ Added' : 'Add to bag'}
              </Button>
            </div>
            <Button
              variant="secondary"
              size={isMobile ? 'md' : 'lg'}
              aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => toggle(product.id)}
              className="!px-4 grid place-items-center"
            >
              <Heart size={20} fill={liked ? 'var(--color-pink-500)' : 'none'} />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
