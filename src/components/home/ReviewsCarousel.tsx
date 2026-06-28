import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, BadgeCheck, Quote } from 'lucide-react';
import { REVIEWS } from '@/data/products';
import { listReviews } from '@/api';
import type { Review } from '@/types';
import { Stars } from '@/components/ui';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';

const GAP = 20;

export function ReviewsCarousel({ isMobile }: { isMobile: boolean }) {
  const { t } = useI18n();
  const visible = isMobile ? 1 : 3;
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  // Prefer live reviews from the API; fall back to static data when empty / on error.
  useEffect(() => {
    const ctrl = new AbortController();
    listReviews(ctrl.signal)
      .then((res) => {
        if (res.items.length > 0) setReviews(res.items);
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => ctrl.abort();
  }, []);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxIndex = reviews.length - visible;
  const px = isMobile ? 'px-4' : 'px-8';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.offsetWidth));
    ro.observe(el);
    setContainerW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Keep active index valid when breakpoint (and thus maxIndex) changes.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, maxIndex)));
  }, [maxIndex]);

  const cardW = containerW > 0 ? (containerW - GAP * (visible - 1)) / visible : 0;
  const stepPx = cardW + GAP;

  const prev = () => setActive((a) => Math.max(0, a - 1));
  const next = () => setActive((a) => Math.min(maxIndex, a + 1));

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStartX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragStartX;
    if (dx < -50) next();
    else if (dx > 50) prev();
  };

  const NavBtn = ({
    onClick,
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-11 h-11 rounded-full border-[1.5px] border-warm-200 grid place-items-center flex-none transition-all',
        disabled
          ? 'bg-warm-50 text-ink-400 cursor-default'
          : 'bg-white text-ink-900 cursor-pointer shadow-sm hover:border-pink-300',
      )}
    >
      {children}
    </button>
  );

  return (
    <section className={cn('max-w-[1240px] mx-auto', px, isMobile ? 'pt-12' : 'pt-22')}>
      <div
        className={cn(
          'flex items-end justify-between',
          isMobile ? 'mb-5' : 'mb-7',
        )}
      >
        <div>
          <h2
            className={cn(
              'font-display font-semibold text-ink-900 m-0 mb-1',
              isMobile ? 'text-[26px]' : 'text-4xl',
            )}
          >
            {t('reviews.title')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm tracking-wide">★★★★★</span>
            <span className="text-ink-500 text-[13px]">
              {t('reviews.summary')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <NavBtn onClick={prev} disabled={active === 0}>
            <ChevronLeft size={18} strokeWidth={2.2} />
          </NavBtn>
          <NavBtn onClick={next} disabled={active >= maxIndex}>
            <ChevronRight size={18} strokeWidth={2.2} />
          </NavBtn>
        </div>
      </div>

      <div
        ref={containerRef}
        dir="ltr"
        className={cn('overflow-hidden', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={(e) => dragging && onPointerUp(e)}
      >
        <div
          className="flex select-none will-change-transform"
          style={{
            gap: GAP,
            transform: `translateX(-${active * stepPx}px)`,
            transition: dragging ? 'none' : 'transform .42s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {reviews.map((r, i) => (
            <div
              key={i}
              dir="auto"
              className="flex-none bg-white rounded-lg border border-warm-200 flex flex-col gap-3.5"
              style={{
                width: cardW || (isMobile ? '100%' : 'calc(33.333% - 14px)'),
                minWidth: cardW || (isMobile ? '100%' : 'calc(33.333% - 14px)'),
                padding: isMobile ? '22px 20px' : '28px 26px',
                boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
              }}
            >
              <Quote size={26} className="text-pink-200 flex-none" fill="var(--color-pink-200)" />
              <Stars rating={r.rating} />
              <p
                className={cn(
                  'text-ink-700 leading-relaxed m-0 italic grow',
                  isMobile ? 'text-sm' : 'text-[15px]',
                )}
              >
                "{r.text}"
              </p>
              <div className="flex items-center gap-2.5 pt-3.5 border-t border-dashed border-warm-200">
                <div className="w-10 h-10 rounded-full grid place-items-center font-script text-white text-xl flex-none bg-gradient-to-br from-pink-200 to-pink-400">
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink-900 text-sm">{r.name}</div>
                  <div className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} strokeWidth={2} />
                    {r.wilaya}
                  </div>
                </div>
                {/* <div className="flex items-center gap-1 bg-sage/15 border border-sage/40 rounded-full px-2.5 py-1 text-[11px] font-semibold text-sage flex-none">
                  <BadgeCheck size={11} strokeWidth={2.5} />
                  Verified
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-1.5 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to review ${i + 1}`}
            onClick={() => setActive(i)}
            className="h-[7px] rounded-full border-0 p-0 cursor-pointer transition-all"
            style={{
              width: active === i ? 24 : 7,
              background: active === i ? 'var(--color-pink-400)' : 'var(--color-warm-300)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
