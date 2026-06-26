import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Plus, Edit3, Eye, EyeOff, AlertTriangle,
  TrendingUp, Package, DollarSign, Layers, LayoutGrid,
  List, ChevronUp, ChevronDown, Save, Trash2, BarChart3,
  Star, ShoppingBag, ChevronLeft, ChevronRight, Loader2,
  ImagePlus, Tag, Megaphone, RotateCcw, Check,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import { BADGE_LABELS, CATEGORIES } from '@/types';
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImages,
  adminDeleteImage,
} from '@/api';
import type { AdminProductDTO } from '@/api';
import type { BadgeLabel } from "@/types";
import { ApiError } from '@/lib/api';
import { Spinner, ErrorState } from '@/components/ui';
import { useConfig } from '@/store/useConfig';

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46', 'Unique'];

type AdminProduct = AdminProductDTO;
type BadgeLabelOption = BadgeLabel | '';

/* ── Stock badge ─────────────────────────────────────────────────────────── */
function StockBadge({ stock, inStock }: { stock: number; inStock: boolean }) {
  if (!inStock) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-warm-100 text-ink-400">
      <EyeOff size={10} /> Out of stock
    </span>
  );
  const level = stock <= 3 ? 'critical' : stock <= 7 ? 'low' : 'ok';
  const cfg = {
    critical: { label: `${stock} left`,     bg: 'bg-red-50',     text: 'text-red-600',     icon: <AlertTriangle size={10} /> },
    low:      { label: `${stock} left`,     bg: 'bg-amber-50',   text: 'text-amber-600',   icon: <AlertTriangle size={10} /> },
    ok:       { label: `${stock} in stock`, bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <Package size={10} /> },
  }[level];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.text)}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={cn('w-10 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none', on ? 'bg-pink-400' : 'bg-warm-200')}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm pointer-events-none"
      />
    </button>
  );
}

/* ── Photo tile ─────────────────────────────────────────────────────────── */
function PhotoTile({ src, main, pending, onRemove }: { src: string; main?: boolean; pending?: boolean; onRemove: () => void }) {
  return (
    <div className="relative aspect-square">
      <div className="w-full h-full rounded-xl overflow-hidden border-2 border-pink-200 relative group">
        <img src={src} alt="Product image" className="w-full h-full object-cover" />
        {main && <span className="absolute top-1.5 left-1.5 bg-pink-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Main</span>}
        {pending && <span className="absolute bottom-1.5 left-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Pending</span>}
        <button
          type="button" onClick={onRemove}
          className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 hover:text-red-500"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function PhotoAddSlot({ label, onPick }: { label: string; onPick: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative aspect-square">
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
      <button type="button" onClick={() => ref.current?.click()}
        className="w-full h-full rounded-xl border-2 border-dashed border-warm-200 hover:border-pink-300 hover:bg-pink-50/30 transition-all flex flex-col items-center justify-center gap-1.5 group"
      >
        <div className="w-7 h-7 rounded-lg bg-warm-100 group-hover:bg-pink-100 flex items-center justify-center transition-colors">
          <ImagePlus size={14} className="text-ink-400 group-hover:text-pink-400 transition-colors" />
        </div>
        <span className="text-[11px] font-semibold text-ink-400 group-hover:text-pink-500 transition-colors">{label}</span>
      </button>
    </div>
  );
}

/* ── Delete confirm ─────────────────────────────────────────────────────── */
function DeleteModal({ product, onConfirm, onCancel }: { product: AdminProduct; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel} className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }} transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">Delete product?</h3>
            <p className="text-sm text-ink-400">
              <span className="font-semibold text-ink-700">"{product.name}"</span> will be permanently removed.
            </p>
          </div>
          <div className="flex border-t border-warm-100">
            <button onClick={onCancel} className="flex-1 py-3.5 text-sm font-semibold text-ink-500 hover:bg-warm-50 transition-colors border-r border-warm-100">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Product Modal ──────────────────────────────────────────────────────── */
interface ProductForm {
  name: string;
  price: string;
  category: string;
  description: string;
  stock: number;
  inStock: boolean;
  badgeLabel: BadgeLabelOption;
  sizes: string[];
  colors: string[];
  active: boolean;
  promoted: boolean;
}

const CREATE_STEPS = [
  { id: 'basics',  label: 'Basics',  icon: <Tag size={13} /> },
  { id: 'details', label: 'Details', icon: <Layers size={13} /> },
  { id: 'images',  label: 'Images',  icon: <ImagePlus size={13} /> },
  { id: 'promo',   label: 'Promo',   icon: <Megaphone size={13} /> },
] as const;
type CreateStep = (typeof CREATE_STEPS)[number]['id'];

const EDIT_TABS = [
  { id: 'info'   as const, label: 'Details', icon: <Tag size={14} />        },
  { id: 'images' as const, label: 'Images',  icon: <ImagePlus size={14} />  },
  { id: 'promo'  as const, label: 'Promo',   icon: <Megaphone size={14} />  },
];

function ProductModal({ product, onClose, onSaved }: {
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !product;
  const { colors: paletteColors } = useConfig();

  const [form, setForm] = useState<ProductForm>(() => ({
    name:        product?.name ?? '',
    price:       product?.price ?? '',
    category:    product?.category ?? CATEGORIES[0],
    description: product?.description ?? '',
    stock:       product?.stock ?? 0,
    inStock:     product?.inStock ?? true,
    badgeLabel:  (product?.badgeLabel ?? '') as BadgeLabelOption,
    sizes:       product?.sizes ?? [],
    colors:      product?.colors ?? [],
    active:      product?.active ?? true,
    promoted:    product?.promoted ?? false,
  }));

  const toggleSize = (s: string) =>
    setForm((p) => ({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : [...p.sizes, s] }));

  const toggleColor = (name: string) =>
    setForm((p) => ({ ...p, colors: p.colors.includes(name) ? p.colors.filter((x) => x !== name) : [...p.colors, name] }));

  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>(product?.images ?? []);
  const [newFiles,       setNewFiles]       = useState<File[]>([]);
  const [step,    setStep]    = useState(0);
  const [editTab, setEditTab] = useState<'info' | 'images' | 'promo'>('info');
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  const currentStepId: CreateStep = CREATE_STEPS[step]?.id ?? 'basics';

  const set = <K extends keyof ProductForm>(key: K, val: ProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const imageCount = existingImages.length + newFiles.length;
  const queueFile  = (file: File) => { if (imageCount < 10) setNewFiles((p) => [...p, file]); };
  const removeNewFile = (i: number) => setNewFiles((p) => p.filter((_, j) => j !== i));
  const removeExistingImage = async (i: number) => {
    if (!product) return;
    setSaveError(null);
    try {
      const updated = await adminDeleteImage(product.id, i);
      setExistingImages(updated.images);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not remove image.');
    }
  };

  const basicsOk  = form.name.trim().length > 0 && form.price.trim().length > 0;
  const detailsOk = !!form.category;
  const canSave   = basicsOk && detailsOk;

  const stepDone = (s: CreateStep) => {
    if (s === 'basics')  return basicsOk;
    if (s === 'details') return detailsOk;
    return true;
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        name:        form.name.trim(),
        price:       form.price.trim(),
        category:    form.category as AdminProductDTO['category'],
        description: form.description.trim(),
        stock:       form.stock,
        inStock:     form.inStock,
        badgeLabel:  (form.badgeLabel || null) as AdminProductDTO['badgeLabel'] | null,
        sizes:       form.sizes,
        colors:      form.colors,
        active:      form.active,
        promoted:    form.promoted,
      };

      const saved = isNew
        ? await adminCreateProduct(body)
        : await adminUpdateProduct(product.id, body);

      if (newFiles.length > 0) {
        await adminUploadImages(saved.id, newFiles.slice(0, 10 - existingImages.length));
      }

      onSaved();
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Field groups ──────────────────────────────────────────────────────── */
  const BasicsFields = (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">
          Product Name <span className="text-pink-400">*</span>
        </label>
        <input
          value={form.name} onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Yasmin Abaya" autoFocus
          className={cn(
            'w-full px-3.5 py-2.5 bg-warm-50 border rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 transition',
            form.name.trim() ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100' : 'border-warm-200 focus:border-pink-300 focus:ring-pink-100',
          )}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">
          Price <span className="text-pink-400">*</span>
          <span className="ml-1 text-ink-300 font-normal normal-case">(e.g. "8 900 DA")</span>
        </label>
        <input
          value={form.price} onChange={(e) => set('price', e.target.value)}
          placeholder="8 900 DA"
          className={cn(
            'w-full px-3.5 py-2.5 bg-warm-50 border rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 transition',
            form.price.trim() ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100' : 'border-warm-200 focus:border-pink-300 focus:ring-pink-100',
          )}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">Description</label>
        <textarea
          value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder="Handcrafted Abaya with traditional embroidery…"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition resize-none"
        />
      </div>
    </div>
  );

  const DetailsFields = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">Category</label>
          <div className="relative">
            <select
              value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition appearance-none"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">Stock</label>
          <input
            type="number" min={0} value={form.stock}
            onChange={(e) => { const n = parseInt(e.target.value) || 0; set('stock', n); if (form.inStock && n === 0) set('inStock', false); if (!form.inStock && n > 0) set('inStock', true); }}
            className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
          />
          {form.stock <= 3 && form.inStock && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={10} />Critical stock</p>
          )}
        </div>
      </div>

      {/* In-stock toggle */}
      <div
        onClick={() => set('inStock', !form.inStock)}
        className={cn('flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
          form.inStock ? 'border-emerald-200 bg-emerald-50' : 'border-warm-200 bg-warm-50 hover:border-warm-300')}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', form.inStock ? 'bg-emerald-100 text-emerald-600' : 'bg-warm-100 text-ink-400')}>
          {form.inStock ? <Eye size={15} /> : <EyeOff size={15} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-700">In stock</p>
          <p className="text-[11px] text-ink-400 mt-0.5">{form.inStock ? 'Product is available to buy' : 'Product is marked as sold out'}</p>
        </div>
        <Toggle on={form.inStock} onChange={() => set('inStock', !form.inStock)} />
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">
          Sizes
          {form.sizes.length > 0 && (
            <span className="ml-2 font-normal normal-case text-pink-400">{form.sizes.length} selected</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map((s) => {
            const active = form.sizes.includes(s);
            return (
              <button
                key={s} type="button" onClick={() => toggleSize(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all',
                  active
                    ? 'bg-pink-400 border-pink-400 text-white shadow-sm'
                    : 'bg-warm-50 border-warm-200 text-ink-500 hover:border-pink-300 hover:text-pink-500',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">
          Colors
          {form.colors.length > 0 && (
            <span className="ml-2 font-normal normal-case text-pink-400">{form.colors.length} selected</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {paletteColors.map((c) => {
            const active = form.colors.includes(c.name);
            return (
              <button
                key={c.name} type="button" onClick={() => toggleColor(c.name)}
                title={c.name}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all',
                  active
                    ? 'border-pink-400 bg-pink-50 text-pink-600 shadow-sm'
                    : 'border-warm-200 bg-warm-50 text-ink-500 hover:border-pink-200 hover:text-ink-700',
                )}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-warm-300 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
                {active && <Check size={10} className="text-pink-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge label */}
      <div>
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-1.5">Badge</label>
        <div className="relative">
          <select
            value={form.badgeLabel} onChange={(e) => set('badgeLabel', e.target.value as BadgeLabel)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition appearance-none"
          >
            <option value="">None</option>
            {BADGE_LABELS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        </div>
      </div>

      {/* Visibility */}
      <div
        onClick={() => set('active', !form.active)}
        className={cn('flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
          form.active ? 'border-emerald-200 bg-emerald-50' : 'border-warm-200 bg-warm-50 hover:border-warm-300')}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', form.active ? 'bg-emerald-100 text-emerald-600' : 'bg-warm-100 text-ink-400')}>
          {form.active ? <Eye size={15} /> : <EyeOff size={15} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-700">Visible on store</p>
          <p className="text-[11px] text-ink-400 mt-0.5">{form.active ? 'Customers can find and buy this product' : 'Hidden — not shown in the shop'}</p>
        </div>
        <Toggle on={form.active} onChange={() => set('active', !form.active)} />
      </div>
    </div>
  );

  const ImagesFields = (
    <>
      <div>
        <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-1">Product Images</p>
        <p className="text-xs text-ink-400 mb-4">Up to 10 images. First is the main listing image.</p>
        <div className="grid grid-cols-2 gap-3">
          {existingImages.map((img, i) => (
            <PhotoTile key={`ex-${i}`} src={img.url} main={i === 0} onRemove={() => removeExistingImage(i)} />
          ))}
          {newFiles.map((file, i) => (
            <PhotoTile key={`new-${i}`} src={URL.createObjectURL(file)} main={existingImages.length === 0 && i === 0} pending onRemove={() => removeNewFile(i)} />
          ))}
          {imageCount < 10 && (
            <PhotoAddSlot label={imageCount === 0 ? 'Main image' : `Image ${imageCount + 1}`} onPick={queueFile} />
          )}
        </div>
      </div>
      <div className="bg-warm-50 rounded-xl p-4 flex items-start gap-3 mt-4">
        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-ink-500 space-y-1">
          <p className="font-semibold text-ink-700">Image tips</p>
          <p>• JPEG, PNG, or WebP, max 5 MB each</p>
          <p>• First image = main listing image</p>
          {!isNew && <p>• Removing an existing image deletes it immediately</p>}
        </div>
      </div>
    </>
  );

  const PromoFields = (
    <div className="space-y-4">
      <div className="bg-linear-to-br from-pink-50 to-pink-100/50 border border-pink-100 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-pink-400 flex items-center justify-center shadow-brand">
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-ink-900">Promote this product</p>
            <p className="text-xs text-ink-400 mt-0.5">Promoted products appear at the top of the shop and homepage</p>
          </div>
        </div>
        <div
          onClick={() => set('promoted', !form.promoted)}
          className={cn('flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all',
            form.promoted ? 'border-pink-400 bg-white shadow-sm' : 'border-pink-100 bg-white/60 hover:bg-white')}
        >
          <div className="flex items-center gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', form.promoted ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-400')}>
              <Star size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-700">Featured product</p>
              <p className="text-[11px] text-ink-400 mt-0.5">Show in homepage hero & shop top</p>
            </div>
          </div>
          <Toggle on={form.promoted} onChange={() => set('promoted', !form.promoted)} />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-ink-700 mb-0.5">Badge labels</p>
          <p className="text-xs text-ink-500">Set "Featured", "Trending" or "New" badge in the Details tab to highlight this product.</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">Badge Preview</p>
        <div className="flex flex-wrap gap-2">
          {form.promoted && (
            <span className="flex items-center gap-1 bg-pink-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Star size={10} /> Featured
            </span>
          )}
          {form.badgeLabel && (
            <span className="bg-pink-50 text-pink-500 border border-pink-200 text-xs font-bold px-2.5 py-1 rounded-full">
              {form.badgeLabel}
            </span>
          )}
          {!form.promoted && !form.badgeLabel && (
            <p className="text-xs text-ink-400">No active promotions</p>
          )}
        </div>
      </div>
    </div>
  );

  const mainImage = existingImages[0]?.url;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-warm-100 bg-linear-to-r from-pink-50/60 to-white shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl shadow-brand shrink-0 overflow-hidden bg-warm-100 flex items-center justify-center">
                {isNew
                  ? <Plus size={20} className="text-pink-400" />
                  : mainImage
                    ? <img src={mainImage} alt="" className="w-full h-full object-cover" />
                    : <span className="font-script text-2xl text-warm-300">M</span>
                }
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  {isNew ? 'New product' : form.name}
                </h2>
                <p className="text-xs text-ink-400 mt-0.5">
                  {isNew ? `Step ${step + 1} of ${CREATE_STEPS.length}` : 'Edit product information'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-ink-400 hover:bg-warm-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Steps / Tabs */}
          {isNew ? (
            <div className="flex items-center gap-0 px-6 py-3 border-b border-warm-100 bg-warm-50/40 shrink-0">
              {CREATE_STEPS.map((s, i) => {
                const done      = stepDone(s.id);
                const active    = i === step;
                const reachable = i === 0 || stepDone(CREATE_STEPS[i - 1]!.id);
                return (
                  <button
                    key={s.id} onClick={() => reachable && setStep(i)} disabled={!reachable}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      active ? 'bg-pink-400 text-white shadow-sm'
                        : done ? 'text-emerald-600 hover:bg-emerald-50'
                        : reachable ? 'text-ink-400 hover:bg-warm-100'
                        : 'text-ink-200 cursor-not-allowed',
                    )}
                  >
                    {s.icon} {s.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] shrink-0">
                {canSave
                  ? <span className="text-emerald-600">Ready to create</span>
                  : <span className="text-ink-300 flex items-center gap-1"><AlertTriangle size={11} className="text-amber-400" />Name & price required</span>
                }
              </span>
            </div>
          ) : (
            <div className="flex border-b border-warm-100 px-6 shrink-0">
              {EDIT_TABS.map((t) => (
                <button key={t.id} onClick={() => setEditTab(t.id)}
                  className={cn('flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors -mb-px',
                    editTab === t.id ? 'border-pink-400 text-pink-500' : 'border-transparent text-ink-400 hover:text-ink-700')}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={isNew ? currentStepId : editTab}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                className="p-6"
              >
                {isNew ? (
                  <>
                    {currentStepId === 'basics'  && BasicsFields}
                    {currentStepId === 'details' && DetailsFields}
                    {currentStepId === 'images'  && ImagesFields}
                    {currentStepId === 'promo'   && PromoFields}
                  </>
                ) : (
                  <>
                    {editTab === 'info'   && <div className="space-y-5">{BasicsFields}{DetailsFields}</div>}
                    {editTab === 'images' && ImagesFields}
                    {editTab === 'promo'  && PromoFields}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-warm-100 bg-warm-50 shrink-0">
            {saveError && (
              <div className="mb-3 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2 rounded-xl text-sm">{saveError}</div>
            )}
            <div className="flex gap-3">
              {isNew && step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} disabled={saving}
                  className="px-5 py-2.5 rounded-xl border-2 border-warm-200 text-ink-500 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  <ChevronLeft size={15} /> Back
                </button>
              ) : (
                <button onClick={onClose} disabled={saving}
                  className="px-5 py-2.5 rounded-xl border-2 border-warm-200 text-ink-500 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                  Cancel
                </button>
              )}
              {isNew && step < CREATE_STEPS.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !basicsOk}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-400 text-white text-sm font-bold hover:brightness-105 transition shadow-brand disabled:opacity-40 disabled:cursor-not-allowed">
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving || !canSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-400 text-white text-sm font-bold hover:brightness-105 transition shadow-brand disabled:opacity-40 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={15} className="animate-[spin_0.7s_linear_infinite]" /> : <Save size={15} />}
                  {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Photo carousel (admin card) ─────────────────────────────────────────── */
function PhotoCarousel({ images }: { images: { url: string; publicId: string }[] }) {
  const [idx, setIdx] = useState(0);
  const valid = images.filter((img) => img.url);

  if (!valid.length) {
    return (
      <div className="h-36 w-full bg-warm-100 flex items-center justify-center">
        <span className="font-script text-3xl text-warm-300">M</span>
      </div>
    );
  }

  return (
    <div className="relative h-36 w-full overflow-hidden group/carousel">
      <img src={valid[idx]?.url} alt="" className="w-full h-full object-cover" />
      {valid.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + valid.length) % valid.length); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm"
          ><ChevronLeft size={12} /></button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % valid.length); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm"
          ><ChevronRight size={12} /></button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {valid.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={cn('w-1 h-1 rounded-full transition-all', i === idx ? 'bg-white w-3' : 'bg-white/60')} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Product card (admin grid) ───────────────────────────────────────────── */
function ProductCard({ product, onEdit, onToggle, onDelete, onPromote }: {
  product: AdminProduct;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPromote: () => void;
}) {
  return (
    <motion.div
      layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      className={cn('bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group', !product.active && 'opacity-55')}
    >
      <div className="relative">
        <PhotoCarousel images={product.images ?? []} />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          {product.promoted && (
            <span className="text-[10px] font-bold bg-pink-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Star size={8} /> Featured
            </span>
          )}
          {product.badgeLabel && (
            <span className="text-[10px] font-bold bg-white/90 text-ink-700 px-2 py-0.5 rounded-full shadow-sm">
              {product.badgeLabel}
            </span>
          )}
        </div>
        <div className={cn('absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white shadow-sm', product.active && product.inStock ? 'bg-emerald-400' : 'bg-warm-300')} />
        <div className="absolute inset-0 bg-ink-900/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-9 h-9 rounded-xl bg-white text-ink-700 flex items-center justify-center hover:bg-pink-50 hover:text-pink-500 transition-colors shadow-sm" title="Edit"><Edit3 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onPromote(); }} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm', product.promoted ? 'bg-pink-400 text-white hover:bg-pink-500' : 'bg-white text-ink-700 hover:bg-pink-50 hover:text-pink-500')} title={product.promoted ? 'Remove from featured' : 'Feature'}><Star size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-9 h-9 rounded-xl bg-white text-ink-700 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors shadow-sm" title={product.active ? 'Hide' : 'Show'}>{product.active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-9 h-9 rounded-xl bg-white text-ink-700 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm" title="Delete"><Trash2 size={14} /></button>
        </div>
        {product.stock <= 3 && product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[10px] font-bold py-0.5 text-center">
            Only {product.stock} left!
          </div>
        )}
        {!product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-ink-700/80 text-white text-[10px] font-bold py-0.5 text-center">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-ink-800 truncate">{product.name}</p>
          <span className="text-[10px] font-bold bg-warm-100 text-ink-500 px-1.5 py-0.5 rounded-full shrink-0">{product.category}</span>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-sm font-bold text-ink-900">{product.price}</p>
          <StockBadge stock={product.stock} inStock={product.inStock} />
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-warm-100">
          <div className="flex items-center gap-1 text-xs text-ink-400">
            <ShoppingBag size={10} className="text-pink-400" />
            <span className="font-semibold text-ink-600">{product.totalSold}</span> sold
          </div>
          <span className="text-xs font-bold text-pink-500">{fmt(product.revenue)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Refresh button ───────────────────────────────────────────────────────── */
function RefreshButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title="Refresh"
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-200 bg-white text-ink-500 text-xs font-semibold hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <motion.span
        animate={{ rotate: loading ? 360 : 0 }}
        transition={loading ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
      >
        <RotateCcw size={13} />
      </motion.span>
      Refresh
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
type SortKey   = 'name' | 'stock' | 'totalSold' | 'revenue';
type ViewMode  = 'grid' | 'table';

export function Products() {
  const CATS = useMemo(() => ['All', ...CATEGORIES] as const, []);

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [sortKey,   setSortKey]   = useState<SortKey>('totalSold');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [view,      setView]      = useState<ViewMode>('grid');
  const [editing,   setEditing]   = useState<AdminProduct | null | 'new'>(null);
  const [deleting,  setDeleting]  = useState<AdminProduct | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsync(
    (signal) => adminListProducts({ limit: 100 }, signal),
    [],
  );
  const products = data?.items ?? [];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    const q    = search.toLowerCase();
    const list = products.filter((p) =>
      (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (catFilter === 'All' || p.category === catFilter),
    );
    return [...list].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [products, search, catFilter, sortKey, sortDir]);

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    try { await fn(); reload(); }
    catch (err) { setActionError(err instanceof ApiError ? err.message : 'Action failed.'); }
  };

  const handleToggle  = (id: number) => { const p = products.find((x) => x.id === id); if (!p) return; runAction(() => adminUpdateProduct(id, { active: !p.active })); };
  const handleDelete  = (id: number) => runAction(() => adminDeleteProduct(id));
  const handlePromote = (id: number) => { const p = products.find((x) => x.id === id); if (!p) return; runAction(() => adminUpdateProduct(id, { promoted: !p.promoted })); };

  const SortTh = ({ label, k }: { label: string; k: SortKey }) => (
    <th onClick={() => toggleSort(k)} className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest cursor-pointer hover:text-ink-700 select-none whitespace-nowrap">
      <div className="flex items-center gap-1">
        {label}
        <span className="flex flex-col gap-px">
          <ChevronUp   size={8} className={sortKey === k && sortDir === 'asc'  ? 'text-pink-400' : 'text-warm-200'} />
          <ChevronDown size={8} className={sortKey === k && sortDir === 'desc' ? 'text-pink-400' : 'text-warm-200'} />
        </span>
      </div>
    </th>
  );

  const kpis = [
    { label: 'Total Revenue', val: fmt(products.reduce((s, p) => s + p.revenue, 0)),       icon: <DollarSign size={16} />,   bg: 'bg-pink-50',   text: 'text-pink-500'   },
    { label: 'Units Sold',    val: String(products.reduce((s, p) => s + p.totalSold, 0)),  icon: <BarChart3 size={16} />,    bg: 'bg-amber-50',  text: 'text-amber-600'  },
    { label: 'Low Stock',     val: String(products.filter((p) => p.stock <= 7).length),    icon: <AlertTriangle size={16}/>, bg: 'bg-red-50',    text: 'text-red-500'    },
    { label: 'Featured',      val: String(products.filter((p) => p.promoted).length),      icon: <Star size={16} />,         bg: 'bg-violet-50', text: 'text-violet-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {products.length} products · {products.filter((p) => p.stock <= 3).length} critically low
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton onClick={reload} loading={loading} />
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-bold hover:brightness-105 transition shadow-brand"
          >
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-warm-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg, s.text)}>{s.icon}</div>
            <div>
              <p className="text-xl font-display font-semibold text-ink-900">{s.val}</p>
              <p className="text-xs text-ink-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition shadow-sm"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"><X size={14} /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn('px-3 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                catFilter === c ? 'bg-pink-400 text-white border-pink-400 shadow-sm' : 'bg-white text-ink-500 border-warm-200 hover:border-pink-200 hover:text-pink-500')}
            >{c}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 bg-warm-100 rounded-xl p-1">
          {(['grid', 'table'] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setView(m)}
              className={cn('p-2 rounded-lg transition-all', view === m ? 'bg-white text-pink-500 shadow-sm' : 'text-ink-400 hover:text-ink-700')}>
              {m === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm">{actionError}</div>
      )}

      {loading && products.length === 0 ? (
        <Spinner label="Loading products…" />
      ) : error && products.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id} product={product}
                    onEdit={() => setEditing(product)}
                    onToggle={() => handleToggle(product.id)}
                    onDelete={() => setDeleting(product)}
                    onPromote={() => handlePromote(product.id)}
                  />
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <Package size={40} className="text-warm-200 mx-auto mb-3" />
                  <p className="text-ink-400 font-semibold text-sm">No products found</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead>
                    <tr className="border-b border-warm-100 bg-warm-50/60">
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">Product</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">Price</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">Category</th>
                      <SortTh label="Stock"   k="stock"     />
                      <SortTh label="Sold"    k="totalSold" />
                      <SortTh label="Revenue" k="revenue"   />
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold text-ink-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={8} className="py-20 text-center"><Package size={40} className="text-warm-200 mx-auto mb-3" /><p className="text-ink-400 font-semibold text-sm">No products found</p></td></tr>
                      ) : filtered.map((p, i) => {
                        const mainPhoto = p.images?.[0]?.url;
                        return (
                          <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn('border-b border-warm-50 hover:bg-pink-50/20 transition-colors group', !p.active && 'opacity-55')}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden bg-warm-100">
                                  {mainPhoto
                                    ? <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><span className="font-script text-lg text-warm-300">M</span></div>
                                  }
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-ink-700">{p.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    {p.promoted   && <span className="text-[10px] font-bold text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Featured</span>}
                                    {p.badgeLabel && <span className="text-[10px] font-bold text-ink-500 bg-warm-100 px-1.5 py-0.5 rounded-full">{p.badgeLabel}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5"><p className="text-sm font-bold text-ink-900">{p.price}</p></td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-warm-100 text-ink-600 px-2 py-0.5 rounded-full">
                                <Layers size={9} />{p.category}
                              </span>
                            </td>
                            <td className="px-4 py-3.5"><StockBadge stock={p.stock} inStock={p.inStock} /></td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-pink-400 rounded-full" style={{ width: `${Math.min(100, (p.totalSold / 40) * 100)}%` }} />
                                </div>
                                <span className="text-sm font-bold text-ink-700 tabular-nums">{p.totalSold}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5"><span className="text-sm font-bold text-ink-900">{fmt(p.revenue)}</span></td>
                            <td className="px-4 py-3.5">
                              <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-warm-100 text-ink-400')}>
                                {p.active ? <Eye size={10} /> : <EyeOff size={10} />}
                                {p.active ? 'Live' : 'Hidden'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditing(p)}          className="p-1.5 rounded-lg text-ink-400 hover:bg-pink-100 hover:text-pink-500 transition-colors" title="Edit"><Edit3 size={14} /></button>
                                <button onClick={() => handlePromote(p.id)}    className={cn('p-1.5 rounded-lg transition-colors', p.promoted ? 'text-pink-400 bg-pink-50 hover:bg-pink-100' : 'text-ink-400 hover:bg-pink-50 hover:text-pink-500')} title="Toggle featured"><Star size={14} /></button>
                                <button onClick={() => handleToggle(p.id)}     className="p-1.5 rounded-lg text-ink-400 hover:bg-sky-50 hover:text-sky-500 transition-colors" title={p.active ? 'Hide' : 'Show'}>{p.active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                <button onClick={() => setDeleting(p)}         className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-warm-100 bg-warm-50/40 flex items-center justify-between">
                  <p className="text-xs text-ink-400">{filtered.length} of {products.length} products</p>
                  <p className="text-xs font-bold text-ink-700">Revenue: {fmt(filtered.reduce((s, p) => s + p.revenue, 0))}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {editing !== null && (
          <ProductModal
            product={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={reload}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleting && (
          <DeleteModal
            product={deleting}
            onConfirm={() => { handleDelete(deleting.id); setDeleting(null); }}
            onCancel={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
