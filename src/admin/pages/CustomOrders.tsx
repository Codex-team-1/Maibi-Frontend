import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Sparkles, Eye, Phone, Mail, MapPin, Clock,
  CheckCircle2, XCircle, Truck, Package, MessageSquare,
  Image, Scissors, ChevronRight, ArrowRight,
  Calendar, Palette, Ruler, Banknote, FileText, Hash,
  Printer, RotateCcw, Download, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAsync } from '@/hooks/useAsync';
import {
  adminListCustomOrders,
  adminUpdateCustomOrder,
  adminCancelCustomOrder,
} from '@/api';
import type { CustomOrderDTO, CustomOrderStatus } from '@/api';
import { ApiError } from '@/lib/api';
import { Spinner, ErrorState } from '@/components/ui';

type AdminCustomOrder = CustomOrderDTO;

/* ── Status config ─────────────────────────────────────────────────────────── */
const CUSTOM_STATUS: Record<CustomOrderStatus, {
  label: string; icon: React.ReactNode;
  bg: string; text: string; dot: string; border: string;
}> = {
  new:           { label: 'New',           icon: <Sparkles size={12} />,     bg: 'bg-pink-50',    text: 'text-pink-600',   dot: 'bg-pink-400',   border: 'border-pink-200'   },
  in_review:     { label: 'In Review',     icon: <Eye size={12} />,           bg: 'bg-blue-50',    text: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-200'   },
  quoted:        { label: 'Quoted',        icon: <MessageSquare size={12} />, bg: 'bg-amber-50',   text: 'text-amber-600',  dot: 'bg-amber-400',  border: 'border-amber-200'  },
  accepted:      { label: 'Accepted',      icon: <CheckCircle2 size={12} />,  bg: 'bg-violet-50',  text: 'text-violet-600', dot: 'bg-violet-400', border: 'border-violet-200' },
  in_production: { label: 'In Production', icon: <Scissors size={12} />,     bg: 'bg-orange-50',  text: 'text-orange-600', dot: 'bg-orange-400', border: 'border-orange-200' },
  shipped:       { label: 'Shipped',       icon: <Truck size={12} />,         bg: 'bg-indigo-50',  text: 'text-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-200' },
  delivered:     { label: 'Delivered',     icon: <Package size={12} />,       bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400',border: 'border-emerald-200'},
  cancelled:     { label: 'Cancelled',     icon: <XCircle size={12} />,       bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200'    },
};

const STATUS_FLOW: CustomOrderStatus[] = [
  'new', 'in_review', 'quoted', 'accepted', 'in_production', 'shipped', 'delivered',
];

const COLOR_MAP: Record<string, string> = {
  'Rose pink': '#F45DAB', 'Blush': '#F8C8DE', 'Ivory': '#FAF3E0',
  'Gold': '#D9A45B', 'Sage green': '#8FA98C', 'Lavender': '#C9B8E8',
  'Sky blue': '#A8C8E8', 'Terracotta': '#C4785A', 'Midnight': '#2A2A4A',
  'Cream white': '#FAFAF5', 'Coral': '#E87B6C', 'Forest': '#4A7A5A',
};

function StatusBadge({ status }: { status: CustomOrderStatus }) {
  const s = CUSTOM_STATUS[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border',
      s.bg, s.text, s.border,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {s.label}
    </span>
  );
}

/* ── Custom Order Modal ────────────────────────────────────────────────────── */
function CustomOrderModal({ order, onClose, onStatusChange, onCancel, onSaveNote, onQuote, busy }: {
  order: AdminCustomOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: CustomOrderStatus) => void;
  onCancel: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onQuote: (id: string, quotedPrice: number) => void;
  busy: boolean;
}) {
  const [internalNote, setInternalNote] = useState(order.note ?? '');
  const [quote, setQuote] = useState(
    order.quotedPrice != null ? String(order.quotedPrice) : '',
  );
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'delivered';
  const canAdvance = !isCancelled && !isCompleted;
  const nextStatus = canAdvance && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-warm-100 bg-linear-to-r from-pink-50/60 to-white shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-brand shrink-0">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-base font-bold text-ink-900">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={11} />
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl text-ink-400 hover:bg-warm-100 transition-colors" title="Print">
                <Printer size={16} />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl text-ink-400 hover:bg-warm-100 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Progress stepper */}
            <div className="px-6 py-5 border-b border-warm-100">
              <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-4">
                {isCancelled ? 'Order Cancelled' : 'Progress'}
              </p>

              {isCancelled ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl">
                  <XCircle size={18} className="shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Order Cancelled</p>
                    <p className="text-xs text-red-400 mt-0.5">This bespoke request was cancelled and cannot be modified.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-0 overflow-x-auto pb-1">
                  {STATUS_FLOW.map((st, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const s = CUSTOM_STATUS[st];
                    return (
                      <div key={st} className="flex items-center flex-1 min-w-0">
                        <button
                          onClick={() => !isCancelled && onStatusChange(order.id, st)}
                          disabled={isCancelled}
                          className="flex flex-col items-center gap-2 group shrink-0"
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: active ? 1.15 : 1,
                              boxShadow: active ? '0 0 0 4px rgba(244,93,171,0.2)' : 'none',
                            }}
                            className={cn(
                              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
                              done
                                ? active
                                  ? 'bg-pink-400 border-pink-400 text-white'
                                  : 'bg-pink-100 border-pink-300 text-pink-500'
                                : 'bg-white border-warm-200 text-ink-300 hover:border-pink-200',
                            )}
                          >
                            {done && !active ? <CheckCircle2 size={14} /> : s.icon}
                          </motion.div>
                          <span className={cn(
                            'text-[9px] font-bold text-center leading-tight whitespace-nowrap px-0.5',
                            active ? 'text-pink-500' : done ? 'text-ink-500' : 'text-ink-300',
                          )}>
                            {s.label}
                          </span>
                        </button>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className="flex-1 mx-1 mb-5 min-w-2">
                            <div className="h-0.5 bg-warm-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: i < currentIdx ? '100%' : '0%' }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="h-full bg-pink-400 rounded-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Two-column body */}
            <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-warm-100">

              {/* ── Left: customer + garment ── */}
              <div className="p-6 space-y-5">

                {/* Customer */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Customer</p>
                  <div className="bg-warm-50 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0 text-pink-400 font-bold text-sm">
                        {order.customer[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-ink-900">{order.customer}</p>
                        <p className="text-xs text-ink-400 flex items-center gap-1"><MapPin size={9} />{order.wilaya}, Algeria</p>
                      </div>
                    </div>
                    <a href={`mailto:${order.email}`} className="flex items-center gap-2.5 text-sm text-ink-600 hover:text-pink-500 transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-warm-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors shrink-0">
                        <Mail size={11} className="text-ink-400 group-hover:text-pink-400" />
                      </div>
                      <span className="truncate">{order.email}</span>
                    </a>
                    <a href={`tel:${order.phone}`} className="flex items-center gap-2.5 text-sm text-ink-600 hover:text-pink-500 transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-warm-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors shrink-0">
                        <Phone size={11} className="text-ink-400 group-hover:text-pink-400" />
                      </div>
                      <span>{order.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Garment details */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Garment Details</p>
                  <div className="bg-warm-50 rounded-xl p-4 space-y-3">
                    {[
                      { icon: <Scissors size={13} />, label: 'Type',   value: order.garmentType },
                      { icon: <Ruler size={13} />,    label: 'Size',   value: order.size         },
                      { icon: <Banknote size={13} />, label: 'Budget', value: order.budget || '—' },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-ink-500 shrink-0">
                          <span className="text-ink-400">{icon}</span>
                          {label}
                        </div>
                        <span className="text-sm font-semibold text-ink-700 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color palette */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1.5"><Palette size={11} />Color Palette</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {order.colors.map((c) => (
                      <div
                        key={c}
                        className="flex items-center gap-2 bg-warm-50 border border-warm-200 px-3 py-1.5 rounded-full"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-warm-300 shrink-0"
                          style={{ background: COLOR_MAP[c] ?? '#ccc' }}
                        />
                        <span className="text-xs font-semibold text-ink-700">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference photo */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1.5"><Image size={11} />Reference Photo</span>
                  </p>
                  {order.referenceImageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-warm-200 bg-warm-50">
                      <div className="relative group">
                        <img
                          src={order.referenceImageUrl}
                          alt="Customer reference"
                          className="w-full max-h-64 object-cover block"
                        />
                        {/* hover overlay */}
                        <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <a
                            href={order.referenceImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 backdrop-blur-sm text-ink-800 text-xs font-bold rounded-xl hover:bg-white transition-colors"
                          >
                            <ExternalLink size={13} /> View full
                          </a>
                          <a
                            href={order.referenceImageUrl}
                            download={`${order.id}-reference`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-xl hover:bg-pink-500 transition-colors"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </div>
                      {/* action bar below image */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-warm-200 bg-warm-50">
                        <span className="text-xs text-ink-400 flex items-center gap-1.5">
                          <Image size={11} className="text-emerald-500" />
                          Photo provided
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={order.referenceImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-ink-500 hover:text-pink-500 font-semibold transition-colors"
                          >
                            <ExternalLink size={11} /> Open
                          </a>
                          <span className="w-px h-3 bg-warm-300" />
                          <a
                            href={order.referenceImageUrl}
                            download={`${order.id}-reference`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-bold transition-colors"
                          >
                            <Download size={11} /> Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-warm-50 border border-warm-200 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center shrink-0">
                        <Image size={15} className="text-ink-300" />
                      </div>
                      <p className="text-sm text-ink-400">No reference photo was provided.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: notes + actions ── */}
              <div className="p-6 space-y-5">

                {/* Client notes */}
                {order.notes && (
                  <div>
                    <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-1.5"><FileText size={11} />Client Notes</span>
                    </p>
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 relative">
                      <div className="absolute top-3 left-3 w-1 h-8 bg-pink-300 rounded-full" />
                      <p className="text-sm text-ink-700 leading-relaxed italic pl-4">"{order.notes}"</p>
                    </div>
                  </div>
                )}

                {/* Quoted price */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Quoted Price (DA)</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="e.g. 45000"
                      className="flex-1 px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
                    />
                    {quote !== (order.quotedPrice != null ? String(order.quotedPrice) : '') && quote !== '' && (
                      <button
                        onClick={() => onQuote(order.id, Number(quote))}
                        disabled={busy}
                        className="px-4 rounded-xl bg-pink-400 text-white text-xs font-bold hover:brightness-105 disabled:opacity-50"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {/* Internal note */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Internal Note</p>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add a private note about this request…"
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition resize-none"
                  />
                  {internalNote !== (order.note ?? '') && (
                    <button
                      onClick={() => onSaveNote(order.id, internalNote)}
                      disabled={busy}
                      className="mt-2 text-xs font-bold text-pink-500 hover:text-pink-600 disabled:opacity-50"
                    >
                      Save note
                    </button>
                  )}
                </div>

                {/* Quick contact */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Contact Customer</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${order.phone.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                    <a
                      href={`mailto:${order.email}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
                    >
                      <Mail size={13} /> Email
                    </a>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                      <span className="text-ink-500">Created</span>
                      <span className="ml-auto text-ink-700 font-medium text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-warm-300 shrink-0" />
                      <span className="text-ink-500">Last updated</span>
                      <span className="ml-auto text-ink-700 font-medium text-xs">
                        {new Date(order.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer / actions ── */}
          <div className="px-6 py-4 border-t border-warm-100 bg-warm-50 flex items-center gap-3 shrink-0">
            {/* Cancel */}
            {!isCancelled && !isCompleted && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <XCircle size={15} /> Cancel
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm font-semibold text-ink-500 hover:bg-white transition-colors"
            >
              Close
            </button>

            {/* Advance */}
            {nextStatus && (
              <button
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-bold hover:brightness-105 transition shadow-brand"
              >
                Move to {CUSTOM_STATUS[nextStatus].label}
                <ArrowRight size={15} />
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
                <CheckCircle2 size={15} /> Completed
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
const ALL_STATUSES: Array<CustomOrderStatus | 'all'> = [
  'all', 'new', 'in_review', 'quoted', 'accepted', 'in_production', 'shipped', 'delivered', 'cancelled',
];

export function CustomOrders() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomOrderStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Stable orders cache — persists across reloads so the list never flickers to empty.
  const [ordersCache, setOrdersCache] = useState<AdminCustomOrder[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useAsync(
    (signal) =>
      adminListCustomOrders(
        {
          limit: 100,
          status: statusFilter === 'all' ? undefined : statusFilter,
          q: debouncedSearch || undefined,
        },
        signal,
      ),
    [statusFilter, debouncedSearch],
  );

  // Sync cache only when fetch succeeds — never wipe on reload.
  useEffect(() => {
    if (data?.items) setOrdersCache(data.items);
  }, [data]);

  const orders = ordersCache;
  const filtered = orders;

  // Keep the selected order from cache so the modal stays open during reloads.
  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  // Optimistically patch a single order in the cache so the UI reflects the
  // change instantly while the background reload completes.
  const patchOrder = (id: string, patch: Partial<AdminCustomOrder>) =>
    setOrdersCache((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    );

  const runAction = async (
    fn: () => Promise<AdminCustomOrder | void>,
    optimisticPatch?: { id: string; patch: Partial<AdminCustomOrder> },
  ) => {
    setBusy(true);
    setActionError(null);
    if (optimisticPatch) patchOrder(optimisticPatch.id, optimisticPatch.patch);
    try {
      const result = await fn();
      // Apply server-confirmed data if returned.
      if (result && 'id' in result) patchOrder(result.id, result);
      reload();
    } catch (err) {
      // Roll back the optimistic patch on failure.
      if (optimisticPatch) reload();
      setActionError(err instanceof ApiError ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = (id: string, status: CustomOrderStatus) =>
    runAction(
      () => adminUpdateCustomOrder(id, { status }),
      { id, patch: { status } },
    );

  const handleCancel = (id: string) =>
    runAction(
      async () => {
        await adminCancelCustomOrder(id);
        setSelectedId(null);
      },
      { id, patch: { status: 'cancelled' as CustomOrderStatus } },
    );

  const handleSaveNote = (id: string, note: string) =>
    runAction(
      () => adminUpdateCustomOrder(id, { note }),
      { id, patch: { note } },
    );

  const handleQuote = (id: string, quotedPrice: number) =>
    runAction(
      () => adminUpdateCustomOrder(id, { quotedPrice }),
      { id, patch: { quotedPrice } },
    );

  const counts = useMemo(() => {
    const c: Partial<Record<CustomOrderStatus | 'all', number>> = { all: data?.total ?? orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders, data?.total]);

  /* summary stats */
  const activeCount  = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const urgentCount  = orders.filter((o) => o.status === 'new' || o.status === 'in_review').length;

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Custom Orders</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {orders.length} bespoke requests · {activeCount} active · {urgentCount} need attention
          </p>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: orders.length,                                      bg: 'bg-warm-100',    text: 'text-ink-700',    icon: <Hash size={16} />          },
          { label: 'Active',      value: activeCount,                                         bg: 'bg-pink-50',     text: 'text-pink-600',   icon: <Sparkles size={16} />      },
          { label: 'Need Review', value: urgentCount,                                         bg: 'bg-amber-50',    text: 'text-amber-600',  icon: <Clock size={16} />         },
          { label: 'Delivered',   value: counts.delivered ?? 0,                               bg: 'bg-emerald-50',  text: 'text-emerald-700',icon: <CheckCircle2 size={16} />  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-warm-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg, s.text)}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-display font-semibold text-ink-900">{s.value}</p>
              <p className="text-xs text-ink-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scroll">
        {ALL_STATUSES.map((s) => {
          const active = statusFilter === s;
          const cfg = s !== 'all' ? CUSTOM_STATUS[s] : null;
          const count = counts[s] ?? 0;
          if (s !== 'all' && count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                active
                  ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                  : 'bg-white text-ink-500 border-warm-200 hover:border-pink-200 hover:text-pink-500',
              )}
            >
              {cfg && (
                <span className={active ? 'text-white' : cfg.text}>{cfg.icon}</span>
              )}
              {s === 'all' ? 'All requests' : CUSTOM_STATUS[s].label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                active ? 'bg-white/25 text-white' : 'bg-warm-100 text-ink-400',
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, customer, garment, wilaya…"
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
            <X size={14} />
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm">
          {actionError}
        </div>
      )}

      {loading && ordersCache.length === 0 ? (
        <Spinner label="Loading custom orders…" />
      ) : error && ordersCache.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
      <>
      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/60">
                {['Request ID', 'Customer', 'Garment', 'Colors', 'Budget', 'Reference', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <Sparkles size={40} className="text-warm-200 mx-auto mb-3" />
                      <p className="text-ink-400 font-semibold text-sm">No custom orders found</p>
                      <p className="text-ink-300 text-xs mt-1">Try adjusting your filter or search</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const isUrgent = order.status === 'new' || order.status === 'in_review';
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedId(order.id)}
                        className="border-b border-warm-50 hover:bg-pink-50/30 cursor-pointer transition-colors group"
                      >
                        {/* ID */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {isUrgent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0 animate-pulse" />
                            )}
                            <span className="font-mono text-sm font-bold text-pink-500">{order.id}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center shrink-0 text-pink-500 font-bold text-xs">
                              {order.customer[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink-700 leading-tight">{order.customer}</p>
                              <p className="text-xs text-ink-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin size={9} />{order.wilaya}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Garment */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                              <Scissors size={11} className="text-pink-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink-700">{order.garmentType}</p>
                              <p className="text-xs text-ink-400">Size {order.size}</p>
                            </div>
                          </div>
                        </td>

                        {/* Colors */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            {order.colors.slice(0, 3).map((c) => (
                              <div
                                key={c}
                                title={c}
                                className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-warm-200 -ml-1 first:ml-0"
                                style={{ background: COLOR_MAP[c] ?? '#ccc' }}
                              />
                            ))}
                            {order.colors.length > 3 && (
                              <span className="text-[10px] text-ink-400 font-bold ml-1">+{order.colors.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-ink-900 whitespace-nowrap">{order.budget}</span>
                        </td>

                        {/* Reference */}
                        <td className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
                            order.referenceImage
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-warm-100 text-ink-400',
                          )}>
                            <Image size={10} />
                            {order.referenceImage ? 'Yes' : 'No'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4">
                          <p className="text-xs text-ink-500 font-medium whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[10px] text-ink-300">
                            {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <div className="flex items-center gap-1 bg-pink-50 text-pink-500 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-pink-100">
                              <Eye size={12} /> Manage
                            </div>
                            <ChevronRight size={14} className="text-pink-300" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-warm-100 bg-warm-50/40 flex items-center justify-between">
            <p className="text-xs text-ink-400">
              Showing <span className="font-bold text-ink-700">{filtered.length}</span> of{' '}
              <span className="font-bold">{orders.length}</span> requests
            </p>
            <div className="flex items-center gap-3">
              {(['new', 'in_review'] as CustomOrderStatus[]).map((s) => {
                const c = filtered.filter((o) => o.status === s).length;
                if (!c) return null;
                return (
                  <span key={s} className={cn('text-xs font-bold', CUSTOM_STATUS[s].text)}>
                    {c} {CUSTOM_STATUS[s].label.toLowerCase()}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <CustomOrderModal
            order={selected}
            busy={busy}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
            onSaveNote={handleSaveNote}
            onQuote={handleQuote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
