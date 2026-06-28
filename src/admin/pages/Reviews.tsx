import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Search, X, Trash2, Eye, EyeOff, RotateCcw,
  MessageSquare, ShoppingBag, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAsync } from '@/hooks/useAsync';
import { adminListReviews, adminDeleteReview, adminToggleApproveReview } from '@/api';
import type { AdminReviewDTO } from '@/api';
import { ApiError } from '@/lib/api';
import { Spinner, ErrorState } from '@/components/ui';

/* ── Star display ─────────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-warm-200 fill-warm-200'}
        />
      ))}
    </div>
  );
}

/* ── Delete confirmation modal ────────────────────────────────────────────── */
function DeleteModal({ review, onConfirm, onCancel, busy }: {
  review: AdminReviewDTO;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Delete review?</h3>
            <p className="text-sm text-ink-400 mb-3">
              This will permanently remove the review by <strong>{review.name}</strong> from {review.wilaya}.
            </p>
            <div className="bg-warm-50 rounded-xl p-3 text-sm text-ink-600 text-left line-clamp-2">
              "{review.comment}"
            </div>
          </div>
          <div className="flex border-t border-warm-100">
            <button
              onClick={onCancel}
              disabled={busy}
              className="flex-1 py-3.5 text-sm font-semibold text-ink-500 hover:bg-warm-50 transition-colors border-r border-warm-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="flex-1 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Review card ──────────────────────────────────────────────────────────── */
function ReviewCard({ review, onDelete, onToggle, busy }: {
  review: AdminReviewDTO;
  onDelete: (r: AdminReviewDTO) => void;
  onToggle: (id: string) => void;
  busy: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        'bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all',
        review.approved ? 'border-warm-200' : 'border-warm-300 opacity-70',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0 text-pink-500 font-bold text-sm">
            {review.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink-900 text-sm">{review.name}</p>
            <p className="text-xs text-ink-400">{review.wilaya} · {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn(
            'text-[11px] font-bold px-2.5 py-1 rounded-full',
            review.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-warm-100 text-ink-400',
          )}>
            {review.approved ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>

      {/* Rating */}
      <Stars rating={review.rating} />

      {/* Comment */}
      <p className="text-sm text-ink-600 leading-relaxed">{review.comment}</p>

      {/* Order link */}
      {review.orderCode && (
        <div className="flex items-center gap-2 text-xs text-ink-400 bg-warm-50 rounded-lg px-3 py-2">
          <ShoppingBag size={12} />
          <span>Order:</span>
          <span className="font-mono font-bold text-ink-700">{review.orderCode}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-warm-100 mt-1">
        <button
          onClick={() => onToggle(review.id)}
          disabled={busy}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50',
            review.approved
              ? 'bg-warm-100 text-ink-500 hover:bg-warm-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
          )}
        >
          {review.approved ? <EyeOff size={12} /> : <Eye size={12} />}
          {review.approved ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={() => onDelete(review)}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
        >
          <Trash2 size={12} /> Delete
        </button>
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
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-200 bg-white text-ink-500 text-xs font-semibold hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all shadow-sm disabled:opacity-50"
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
export function Reviews() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewDTO | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useAsync(
    (signal) =>
      adminListReviews(
        {
          limit: 100,
          approved: approvedFilter !== 'all' ? approvedFilter : undefined,
          q: debouncedSearch || undefined,
        },
        signal,
      ),
    [approvedFilter, debouncedSearch],
  );

  const reviews = data?.items ?? [];

  const runAction = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (review: AdminReviewDTO) => setDeleteTarget(review);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    runAction(async () => {
      await adminDeleteReview(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  const handleToggle = (id: string) => runAction(() => adminToggleApproveReview(id));

  const totalVisible = reviews.filter((r) => r.approved).length;
  const totalHidden = reviews.filter((r) => !r.approved).length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const summaryCards = [
    { label: 'Total Reviews', value: data?.total ?? reviews.length, color: 'text-ink-900', bg: 'bg-warm-100' },
    { label: 'Visible', value: totalVisible, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Hidden', value: totalHidden, color: 'text-ink-400', bg: 'bg-warm-200' },
    { label: 'Avg Rating', value: avgRating, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Reviews</h1>
          <p className="text-sm text-ink-400 mt-0.5">{data?.total ?? reviews.length} reviews total</p>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-warm-200 p-4 bg-white shadow-sm flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-display font-bold', c.bg, c.color)}>
              {c.value}
            </div>
            <p className="text-sm text-ink-500 font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
        {([
          { key: 'all', label: 'All reviews', count: data?.total ?? reviews.length },
          { key: 'true', label: 'Visible', count: totalVisible },
          { key: 'false', label: 'Hidden', count: totalHidden },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setApprovedFilter(key)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border',
              approvedFilter === key
                ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                : 'bg-white text-ink-500 border-warm-200 hover:border-pink-200 hover:text-pink-500',
            )}
          >
            {label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
              approvedFilter === key ? 'bg-white/25 text-white' : 'bg-warm-100 text-ink-400',
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, wilaya, comment…"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
            <X size={14} />
          </button>
        )}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm">
          <AlertTriangle size={15} />
          {actionError}
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <Spinner label="Loading reviews…" />
      ) : error && reviews.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-warm-200 py-20 text-center shadow-sm">
          <MessageSquare size={40} className="text-warm-200 mx-auto mb-3" />
          <p className="text-ink-400 font-semibold text-sm">No reviews found</p>
          <p className="text-ink-300 text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDelete}
                onToggle={handleToggle}
                busy={busy}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            review={deleteTarget}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            busy={busy}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
