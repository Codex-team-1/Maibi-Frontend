import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, LayoutGrid, List, X } from 'lucide-react';
import { SORT_OPTS } from '@/data/products';
import type { Category, Product, SortValue } from '@/types';
import { Button, Spinner, ErrorState } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductListCard } from '@/components/product/ProductListCard';
import { FilterContent } from '@/components/shop/FilterControls';
import { FilterSheet } from '@/components/shop/FilterSheet';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useConfig } from '@/store/useConfig';
import { useAsync } from '@/hooks/useAsync';
import { listProducts } from '@/api';
import { cn } from '@/lib/cn';

const PRICE_MAX = 20000;

export function Shop() {
  const { isMobile, isTablet, w } = useLayoutContext();
  const { categories }            = useConfig();
  const [searchParams]            = useSearchParams();
  const query                     = searchParams.get('q') ?? '';

  const [cats,         setCats]         = useState<Set<Category>>(new Set());
  const [priceMin,     setPriceMin]     = useState(0);
  const [priceMax,     setPriceMax]     = useState(PRICE_MAX);
  const [sort,         setSort]         = useState<SortValue>('featured');
  const [view,         setView]         = useState<'grid' | 'list'>('grid');
  const [badgeLabels,  setBadgeLabels]  = useState<Set<string>>(new Set());
  const [inStockOnly,  setInStockOnly]  = useState(false);
  const [filterOpen,        setFilterOpen]        = useState(false);
  const [tabletFilterOpen,  setTabletFilterOpen]  = useState(false);
  const [page,  setPage]  = useState(1);
  const [items, setItems] = useState<Product[]>([]);

  // Reset to page 1 whenever filters/search/sort change.
  useEffect(() => {
    setPage(1);
  }, [cats, priceMin, priceMax, badgeLabels, inStockOnly, query, sort]);

  const catList        = Array.from(cats);
  const badgeLabelList = Array.from(badgeLabels);

  const { data, loading, error, reload } = useAsync(
    (signal) =>
      listProducts(
        {
          page,
          limit: 24,
          sort,
          category:   catList.length ? catList : undefined,
          badgeLabel: badgeLabelList.length ? badgeLabelList : undefined,
          inStock:    inStockOnly ? 'true' : undefined,
          q:          query || undefined,
        },
        signal,
      ),
    [page, sort, catList.join(','), badgeLabelList.join(','), inStockOnly, query],
  );

  useEffect(() => {
    if (!data) return;
    setItems((prev) => data.page === 1 ? data.items : [...prev, ...data.items]);
  }, [data]);

  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasMore    = page < totalPages;

  const toggleCat        = (c: Category) => setCats((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const toggleBadgeLabel = (b: string)   => setBadgeLabels((s) => { const n = new Set(s); n.has(b) ? n.delete(b) : n.add(b); return n; });
  const toggleInStock    = ()             => setInStockOnly((v) => !v);

  const activeTags = [
    ...Array.from(cats).map((c) => ({ label: c,          clear: () => toggleCat(c) })),
    ...Array.from(badgeLabels).map((b) => ({ label: b,   clear: () => toggleBadgeLabel(b) })),
    ...(inStockOnly ? [{ label: 'In stock', clear: () => setInStockOnly(false) }] : []),
    ...(priceMin > 0 || priceMax < PRICE_MAX ? [{
      label: `${priceMin.toLocaleString('fr-FR')}–${priceMax.toLocaleString('fr-FR')} DA`,
      clear: () => { setPriceMin(0); setPriceMax(PRICE_MAX); },
    }] : []),
  ];

  const clearAll = () => {
    setCats(new Set());
    setPriceMin(0);
    setPriceMax(PRICE_MAX);
    setBadgeLabels(new Set());
    setInStockOnly(false);
  };

  const isWide      = w >= 1400;
  const showSidebar = !isMobile && !isTablet;
  const gridCols    = isMobile ? 2 : isTablet ? 2 : isWide ? 4 : 3;

  const filterProps = {
    categories,
    cats,
    toggleCat,
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    badgeLabels,
    toggleBadgeLabel,
    inStockOnly,
    toggleInStock,
  };

  const sortSelect = (
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value as SortValue)}
      className="font-ui text-sm font-medium text-ink-900 border-2 border-warm-200 rounded-full px-3.5 py-[9px] bg-white cursor-pointer outline-none flex-none"
    >
      {SORT_OPTS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  const viewToggle = (radius: string) => (
    <div className={cn('flex gap-1 bg-warm-100 p-1 flex-none', radius)}>
      {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
        <button
          key={v}
          type="button"
          aria-label={`${v} view`}
          onClick={() => setView(v)}
          className={cn(
            'border-0 cursor-pointer px-2.5 py-1.5 flex transition-all',
            radius,
            view === v ? 'bg-white shadow-sm text-pink-500' : 'text-ink-400',
          )}
        >
          <Icon size={20} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );

  const initialLoading = loading && items.length === 0;

  return (
    <main className={cn('max-w-[1240px] w-full mx-auto', isMobile ? 'pt-6 pb-25' : 'px-8 pt-8 pb-16')}>
      <div className={cn('flex items-baseline gap-3 mb-5', isMobile && 'px-4')}>
        <h1 className={cn('font-display font-semibold text-ink-900 m-0', isMobile ? 'text-3xl' : 'text-[40px]')}>
          Shop all
        </h1>
        <span className="text-ink-500 text-sm">
          {total} piece{total !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
        </span>
      </div>

      {(isMobile || isTablet) && (
        <div className="hide-scroll flex gap-2.5 px-4 mb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => (isMobile ? setFilterOpen(true) : setTabletFilterOpen(true))}
            className={cn(
              'flex items-center gap-1.5 border-2 rounded-full px-4 py-[9px] cursor-pointer font-ui font-semibold text-sm flex-none',
              activeTags.length > 0
                ? 'border-pink-400 bg-pink-50 text-pink-600'
                : 'border-warm-200 bg-white text-ink-700',
            )}
          >
            <Filter size={20} strokeWidth={1.8} /> Filters{activeTags.length > 0 ? ` (${activeTags.length})` : ''}
          </button>
          {sortSelect}
          {viewToggle('rounded-full')}
        </div>
      )}

      {(isMobile || isTablet) && activeTags.length > 0 && (
        <div className="hide-scroll flex gap-2 px-4 mb-3.5 overflow-x-auto">
          {activeTags.map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 rounded-full px-2.5 py-1.5 text-xs font-semibold flex-none"
            >
              {tag.label}
              <button
                type="button"
                aria-label={`Remove ${tag.label} filter`}
                onClick={tag.clear}
                className="border-0 bg-transparent cursor-pointer flex p-0 text-pink-400"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="border-0 bg-transparent text-pink-600 font-semibold text-xs cursor-pointer flex-none"
          >
            Clear all
          </button>
        </div>
      )}

      <div className={cn('flex gap-7 items-start', (isMobile || isTablet) && 'px-4')}>
        {showSidebar && (
          <aside
            className="flex-none sticky top-23 bg-white rounded-lg border border-warm-200 px-[18px] py-5 shadow-sm"
            style={{ width: isWide ? 240 : 220 }}
          >
            <div className="flex justify-between items-center mb-[18px]">
              <span className="font-bold text-[15px] text-ink-900 flex items-center gap-1.5">
                <Filter size={20} strokeWidth={1.8} /> Filters
                {activeTags.length > 0 && (
                  <span className="bg-pink-400 text-white text-[11px] font-bold rounded-full w-[18px] h-[18px] grid place-items-center">
                    {activeTags.length}
                  </span>
                )}
              </span>
              {activeTags.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="border-0 bg-transparent text-pink-600 text-xs font-semibold cursor-pointer p-0"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterContent {...filterProps} />
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {showSidebar && (
            <div className="flex items-center gap-3 mb-[18px] flex-wrap">
              <div className="flex gap-2 flex-1 flex-wrap">
                {activeTags.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200 rounded-full px-3 py-1.5 text-[13px] font-semibold"
                  >
                    {tag.label}
                    <button
                      type="button"
                      aria-label={`Remove ${tag.label} filter`}
                      onClick={tag.clear}
                      className="border-0 bg-transparent cursor-pointer flex p-0 text-pink-400"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <span className="text-[13px] text-ink-500">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                  className="font-ui text-sm font-medium text-ink-900 border-2 border-warm-200 rounded-md px-3 py-2 bg-white cursor-pointer outline-none"
                >
                  {SORT_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {viewToggle('rounded-md')}
              </div>
            </div>
          )}

          {error && items.length === 0 ? (
            <ErrorState message={error} onRetry={reload} />
          ) : initialLoading ? (
            <Spinner label="Loading pieces…" />
          ) : items.length === 0 ? (
            <div className="text-center py-20 px-6 text-ink-500">
              <div className="font-script text-[44px] text-pink-200 mb-2.5">Maibi</div>
              <div className="font-display text-xl font-semibold text-ink-700 mb-2">
                No pieces match your filters
              </div>
              <p className="max-w-[300px] mx-auto mb-4.5 text-sm">
                Try broadening your search or clearing some filters.
              </p>
              <Button variant="stitch" onClick={clearAll}>Clear all filters</Button>
            </div>
          ) : (
            <>
              {view === 'grid' ? (
                <div
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: isMobile ? 12 : 20 }}
                >
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} isMobile={isMobile} isTablet={isTablet} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((p) => <ProductListCard key={p.id} product={p} />)}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button variant="secondary" size="lg" onClick={() => setPage((p) => p + 1)} disabled={loading}>
                    {loading ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(isMobile || isTablet) && (
        <FilterSheet
          open={isMobile ? filterOpen : tabletFilterOpen}
          onClose={() => isMobile ? setFilterOpen(false) : setTabletFilterOpen(false)}
          clearAll={clearAll}
          resultCount={total}
          {...filterProps}
        />
      )}
    </main>
  );
}
