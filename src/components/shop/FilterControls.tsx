import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { FILTER_LABELS } from '@/data/products';
import type { Category } from '@/types';

/* ── Collapsible filter section ───────────────────────────────────────────── */
export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-warm-200 pb-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center border-0 bg-transparent cursor-pointer p-0"
        style={{ marginBottom: open ? 12 : 0 }}
      >
        <span className="font-bold text-[13px] text-ink-900 uppercase tracking-[0.08em]">
          {title}
        </span>
        {open
          ? <ChevronUp size={14} strokeWidth={2.5} className="text-ink-500" />
          : <ChevronDown size={14} strokeWidth={2.5} className="text-ink-500" />
        }
      </button>
      {open && children}
    </div>
  );
}

/* ── Checkbox row ─────────────────────────────────────────────────────────── */
function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-[5px]">
      <span
        className="w-[18px] h-[18px] rounded-md grid place-items-center flex-none transition-all"
        style={{
          border:     checked ? 'none' : '2px solid var(--color-warm-300)',
          background: checked ? 'var(--color-pink-400)' : 'transparent',
        }}
      >
        {checked && <Check size={11} strokeWidth={2.6} color="#fff" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      <span className="flex-1 text-sm text-ink-700">{label}</span>
    </label>
  );
}

/* ── Dual-thumb price range ───────────────────────────────────────────────── */
export function PriceRange({
  min, max, setMin, setMax,
}: {
  min: number; max: number; setMin: (v: number) => void; setMax: (v: number) => void;
}) {
  const lo  = 0;
  const hi  = 20000;
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <div>
      <div className="flex justify-between text-[13px] text-ink-500 mb-2.5">
        <span>{min.toLocaleString('fr-FR')} DA</span>
        <span>{max.toLocaleString('fr-FR')} DA</span>
      </div>
      <div className="relative h-1 bg-warm-200 rounded-full mb-3.5">
        <div
          className="absolute h-full bg-pink-400 rounded-full"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <input
          type="range" min={lo} max={hi} step={500} value={min}
          onChange={(e) => setMin(Math.min(+e.target.value, max - 500))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Minimum price"
        />
        <input
          type="range" min={lo} max={hi} step={500} value={max}
          onChange={(e) => setMax(Math.max(+e.target.value, min + 500))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}

/* ── Combined filter content ──────────────────────────────────────────────── */
export interface FilterContentProps {
  categories: string[];
  cats: Set<Category>;
  toggleCat: (c: Category) => void;
  priceMin: number;
  priceMax: number;
  setPriceMin: (v: number) => void;
  setPriceMax: (v: number) => void;
  badgeLabels: Set<string>;
  toggleBadgeLabel: (b: string) => void;
  inStockOnly: boolean;
  toggleInStock: () => void;
}

export function FilterContent({
  categories, cats, toggleCat,
  priceMin, priceMax, setPriceMin, setPriceMax,
  badgeLabels, toggleBadgeLabel,
  inStockOnly, toggleInStock,
}: FilterContentProps) {
  return (
    <>
      <FilterSection title="Category">
        {categories.map((c) => (
          <CheckRow key={c} label={c} checked={cats.has(c as Category)} onChange={() => toggleCat(c as Category)} />
        ))}
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <CheckRow label="In stock only" checked={inStockOnly} onChange={toggleInStock} />
      </FilterSection>

      <FilterSection title="Labels" defaultOpen={false}>
        {FILTER_LABELS.map((b) => (
          <CheckRow key={b} label={b} checked={badgeLabels.has(b)} onChange={() => toggleBadgeLabel(b)} />
        ))}
      </FilterSection>
    </>
  );
}
