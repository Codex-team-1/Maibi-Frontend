import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Eye, Package, Truck, CheckCircle2, XCircle, Clock,
  CreditCard, Phone, Mail, MapPin, ShoppingBag, ChevronRight,
  Printer, MessageSquare, RotateCcw, ArrowRight, User,
  Calendar, Hash, Receipt, Star,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import {
  adminListOrders,
  adminUpdateOrder,
  adminCancelOrder,
  adminRefundOrder,
} from '@/api';
import type { OrderDTO, OrderStatus, PaymentStatus } from '@/api';
import { ApiError } from '@/lib/api';
import { Spinner, ErrorState } from '@/components/ui';

type AdminOrder = OrderDTO;

/* ── Status config ─────────────────────────────────────────────────────────── */
const ORDER_STATUS: Record<OrderStatus, {
  label: string; icon: React.ReactNode;
  bg: string; text: string; dot: string; ring: string; rowBorder: string; rowBg: string;
  activeBg: string; activeBorder: string; activeText: string; activeShadow: string;
  doneBg: string; doneBorder: string; doneText: string;
}> = {
  pending:   { label: 'Pending',   icon: <Clock size={13} />,        bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400',  ring: 'ring-amber-300',   rowBorder: 'border-l-amber-400',   rowBg: 'hover:bg-amber-50/40',   activeBg: 'bg-amber-400',   activeBorder: 'border-amber-400',   activeText: 'text-amber-500',  activeShadow: '0 0 0 4px rgba(251,191,36,0.2)',  doneBg: 'bg-amber-50',   doneBorder: 'border-amber-200',  doneText: 'text-amber-400'  },
  confirmed: { label: 'Confirmed', icon: <CheckCircle2 size={13} />, bg: 'bg-sky-50',      text: 'text-sky-700',    dot: 'bg-sky-400',    ring: 'ring-sky-300',     rowBorder: 'border-l-sky-400',     rowBg: 'hover:bg-sky-50/40',     activeBg: 'bg-sky-500',     activeBorder: 'border-sky-500',     activeText: 'text-sky-600',    activeShadow: '0 0 0 4px rgba(14,165,233,0.2)',   doneBg: 'bg-sky-50',     doneBorder: 'border-sky-200',    doneText: 'text-sky-400'    },
  shipped:   { label: 'Shipped',   icon: <Truck size={13} />,        bg: 'bg-violet-50',   text: 'text-violet-700', dot: 'bg-violet-400', ring: 'ring-violet-300',  rowBorder: 'border-l-violet-400',  rowBg: 'hover:bg-violet-50/40',  activeBg: 'bg-violet-500',  activeBorder: 'border-violet-500',  activeText: 'text-violet-600', activeShadow: '0 0 0 4px rgba(139,92,246,0.2)',   doneBg: 'bg-violet-50',  doneBorder: 'border-violet-200', doneText: 'text-violet-400' },
  delivered: { label: 'Delivered', icon: <Package size={13} />,      bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-400',ring: 'ring-emerald-300', rowBorder: 'border-l-emerald-400', rowBg: 'hover:bg-emerald-50/40', activeBg: 'bg-emerald-500', activeBorder: 'border-emerald-500', activeText: 'text-emerald-600',activeShadow: '0 0 0 4px rgba(16,185,129,0.2)',   doneBg: 'bg-emerald-50', doneBorder: 'border-emerald-200',doneText: 'text-emerald-400'},
  cancelled: { label: 'Cancelled', icon: <XCircle size={13} />,      bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-400',    ring: 'ring-red-300',     rowBorder: 'border-l-red-400',     rowBg: 'hover:bg-red-50/40',     activeBg: 'bg-red-500',     activeBorder: 'border-red-500',     activeText: 'text-red-600',    activeShadow: '0 0 0 4px rgba(239,68,68,0.2)',    doneBg: 'bg-red-50',     doneBorder: 'border-red-200',    doneText: 'text-red-400'    },
};

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  unpaid:   { label: 'Unpaid',   bg: 'bg-amber-50',  text: 'text-amber-700' },
  paid:     { label: 'Paid',     bg: 'bg-emerald-50',text: 'text-emerald-700' },
  refunded: { label: 'Refunded', bg: 'bg-sky-50',    text: 'text-sky-700' },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full', s.bg, s.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {s.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const s = PAYMENT_STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full', s.bg, s.text)}>
      <CreditCard size={9} />
      {s.label}
    </span>
  );
}

/* ── Order Modal (complete redesign) ───────────────────────────────────────── */
function OrderModal({ order, onClose, onStatusChange, onCancel, onRefund, onSaveNote, busy }: {
  order: AdminOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onCancel: (id: string) => void;
  onRefund: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState(order.note ?? '');
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canAdvance = !isCancelled && currentIdx < STATUS_FLOW.length - 1;
  const nextStatus = canAdvance ? STATUS_FLOW[currentIdx + 1] : null;

  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = order.shippingFee ?? 0;

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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* ── Modal header ── */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-warm-100 bg-linear-to-r from-pink-50/60 to-white">
            <div className="flex items-center gap-4">
              {/* Order icon */}
              <div className="w-11 h-11 rounded-2xl bg-pink-400 flex items-center justify-center shadow-brand shrink-0">
                <Receipt size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-base font-bold text-ink-900">{order.id}</span>
                  <StatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                </div>
                <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={11} />
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="mx-1">·</span>
                  {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
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
            {!isCancelled ? (
              <div className="px-6 py-5 border-b border-warm-100">
                <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-4">Order Progress</p>
                <div className="flex items-center gap-0">
                  {STATUS_FLOW.map((st, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const s = ORDER_STATUS[st];
                    const currentS = ORDER_STATUS[order.status as OrderStatus] ?? ORDER_STATUS.pending;
                    return (
                      <div key={st} className="flex items-center flex-1">
                        <button
                          onClick={() => !isCancelled && onStatusChange(order.id, st)}
                          disabled={isCancelled}
                          className="flex flex-col items-center gap-2 group min-w-0"
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: active ? 1.1 : 1,
                              boxShadow: active ? currentS.activeShadow : 'none',
                            }}
                            className={cn(
                              'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
                              done
                                ? active
                                  ? `${currentS.activeBg} ${currentS.activeBorder} text-white`
                                  : `${s.doneBg} ${s.doneBorder} ${s.doneText}`
                                : 'bg-white border-warm-200 text-ink-300 hover:border-warm-300',
                            )}
                          >
                            {done && !active ? <CheckCircle2 size={16} /> : s.icon}
                          </motion.div>
                          <span className={cn(
                            'text-[10px] font-bold text-center w-16 leading-tight',
                            active ? currentS.activeText : done ? s.doneText : 'text-ink-300',
                          )}>
                            {s.label}
                          </span>
                        </button>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className="flex-1 mx-1 mb-5">
                            <div className="h-0.5 bg-warm-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: i < currentIdx ? '100%' : '0%' }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className={cn('h-full rounded-full', currentS.dot)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 border-b border-warm-100">
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl">
                  <XCircle size={18} />
                  <div>
                    <p className="font-semibold text-sm">Order Cancelled</p>
                    <p className="text-xs text-red-500 mt-0.5">This order has been cancelled and cannot be modified.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-warm-100">

              {/* Left column */}
              <div className="p-6 space-y-5">

                {/* Customer card */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Customer</p>
                  <div className="bg-warm-50 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                        <User size={15} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="font-bold text-ink-900 text-sm">{order.customer}</p>
                        <p className="text-xs text-ink-400">Returning customer</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <a href={`mailto:${order.email}`} className="flex items-center gap-2.5 text-sm text-ink-600 hover:text-pink-500 transition-colors group">
                        <div className="w-6 h-6 rounded-lg bg-warm-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                          <Mail size={12} className="text-ink-400 group-hover:text-pink-400" />
                        </div>
                        <span className="truncate">{order.email}</span>
                      </a>
                      <a href={`tel:${order.phone}`} className="flex items-center gap-2.5 text-sm text-ink-600 hover:text-pink-500 transition-colors group">
                        <div className="w-6 h-6 rounded-lg bg-warm-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                          <Phone size={12} className="text-ink-400 group-hover:text-pink-400" />
                        </div>
                        <span>{order.phone}</span>
                      </a>
                      <div className="flex items-start gap-2.5 text-sm text-ink-600">
                        <div className="w-6 h-6 rounded-lg bg-warm-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={12} className="text-ink-400" />
                        </div>
                        <div className="leading-snug">
                          {order.address && <span className="block">{order.address}</span>}
                          {order.city && <span className="block">{order.city}</span>}
                          <span className="block">{order.wilaya}, Algeria</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Payment</p>
                  <div className="bg-warm-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-500 flex items-center gap-1.5">
                        <CreditCard size={13} /> Method
                      </span>
                      <span className="text-sm font-semibold text-ink-700">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-500">Status</span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-500 flex items-center gap-1.5">
                        <Truck size={13} /> Delivery
                      </span>
                      <span className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        order.shippingType === 'home' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700',
                      )}>
                        {order.shippingType === 'home' ? 'Home delivery' : 'Desk pickup'}
                      </span>
                    </div>
                    <div className="border-t border-warm-200 pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm text-ink-500">
                        <span>Subtotal</span><span>{fmt(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-ink-500">
                        <span>Shipping</span><span>{fmt(shipping)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink-900 pt-1 border-t border-warm-200">
                        <span>Total</span>
                        <span className="text-pink-500 text-base font-display">{fmt(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="p-6 space-y-5">

                {/* Items */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">
                    Items · {order.items.reduce((s, i) => s + i.qty, 0)} pieces
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-pink-50/50 transition-colors"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-warm-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-linear-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center shrink-0">
                            <ShoppingBag size={16} className="text-pink-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink-700 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] bg-warm-200 text-ink-600 font-bold px-1.5 py-0.5 rounded">
                              Size {item.size}
                            </span>
                            {item.color && (
                              <span className="flex items-center gap-1 text-[11px] text-ink-500">
                                <span
                                  className="w-3 h-3 rounded-full border border-warm-300 shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                {item.color}
                              </span>
                            )}
                            <span className="text-xs text-ink-400">× {item.qty}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-ink-900 shrink-0">{fmt(item.price * item.qty)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Notes / feedback area */}
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Internal Note</p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this order (visible only to you)…"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition resize-none"
                  />
                  {note !== (order.note ?? '') && (
                    <button
                      onClick={() => onSaveNote(order.id, note)}
                      disabled={busy}
                      className="mt-2 text-xs font-bold text-pink-500 hover:text-pink-600 disabled:opacity-50"
                    >
                      Save note
                    </button>
                  )}
                </div>

                {/* Quick customer actions */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${order.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${order.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
                  >
                    <Mail size={13} /> Email
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-warm-100 border border-warm-200 text-ink-600 text-xs font-bold hover:bg-warm-200 transition-colors">
                    <Star size={13} /> Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Modal footer / actions ── */}
          <div className="px-6 py-4 border-t border-warm-100 bg-warm-50 flex items-center gap-3">
            {/* Cancel */}
            {!isCancelled && order.status !== 'delivered' && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <XCircle size={15} /> Cancel order
              </button>
            )}

            {/* Refund */}
            {order.paymentStatus === 'paid' && (
              <button
                onClick={() => onRefund(order.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-sky-200 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={15} /> Issue refund
              </button>
            )}

            <div className="flex-1" />

            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm font-semibold text-ink-500 hover:bg-white transition-colors">
              Close
            </button>

            {/* Advance status */}
            {canAdvance && nextStatus && (
              <button
                onClick={() => { onStatusChange(order.id, nextStatus); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-bold hover:brightness-105 transition shadow-brand"
              >
                Mark as {ORDER_STATUS[nextStatus].label}
                <ArrowRight size={15} />
              </button>
            )}

            {order.status === 'delivered' && (
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
export function Orders() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce the search box → API query.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useAsync(
    (signal) =>
      adminListOrders(
        {
          limit: 100,
          status: statusFilter === 'all' ? undefined : statusFilter,
          q: debouncedSearch || undefined,
        },
        signal,
      ),
    [statusFilter, debouncedSearch],
  );

  const orders = data?.items ?? [];
  const filtered = orders;
  const selected = orders.find((o) => o.id === selectedId) ?? null;

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

  const handleStatusChange = (id: string, status: OrderStatus) =>
    runAction(() => adminUpdateOrder(id, { status }));

  const handleCancel = (id: string) =>
    runAction(async () => {
      await adminCancelOrder(id);
      setSelectedId(null);
    });

  const handleRefund = (id: string) => runAction(() => adminRefundOrder(id));

  const handleSaveNote = (id: string, note: string) =>
    runAction(() => adminUpdateOrder(id, { note }));

  // Status counts are only available for the current (filtered) page from the API,
  // so derive them from the loaded set.
  const counts = useMemo(() => {
    const c: Partial<Record<OrderStatus | 'all', number>> = { all: data?.total ?? orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders, data?.total]);

  /* ── Summary mini-cards ── */
  const summaryCards = [
    { label: 'Total Orders', value: orders.length, color: 'text-ink-900', bg: 'bg-warm-100' },
    { label: 'Pending', value: counts.pending ?? 0, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Shipped', value: (counts.shipped ?? 0) + (counts.confirmed ?? 0), color: 'text-violet-700', bg: 'bg-violet-50' },
    { label: 'Delivered', value: counts.delivered ?? 0, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Orders</h1>
          <p className="text-sm text-ink-400 mt-0.5">{orders.length} orders total · last updated just now</p>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </div>

      {/* Mini summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className={cn('rounded-2xl border border-warm-200 p-4 bg-white shadow-sm flex items-center gap-3')}>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg font-display font-bold', c.bg, c.color)}>
              {c.value}
            </div>
            <p className="text-sm text-ink-500 font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
        {(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((s) => {
          const active = statusFilter === s;
          const cfg = s !== 'all' ? ORDER_STATUS[s] : null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border',
                active
                  ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                  : 'bg-white text-ink-500 border-warm-200 hover:border-pink-200 hover:text-pink-500',
              )}
            >
              {cfg && <span className={active ? 'text-white' : cfg.text}>{cfg.icon}</span>}
              {s === 'all' ? 'All orders' : ORDER_STATUS[s].label}
              <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold', active ? 'bg-white/25 text-white' : 'bg-warm-100 text-ink-400')}>
                {counts[s] ?? 0}
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
          placeholder="Search by order ID, customer, wilaya…"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition shadow-sm"
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

      {loading && orders.length === 0 ? (
        <Spinner label="Loading orders…" />
      ) : error && orders.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
      /* Table */
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/60">
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
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
                    <td colSpan={8} className="py-20 text-center">
                      <ShoppingBag size={40} className="text-warm-200 mx-auto mb-3" />
                      <p className="text-ink-400 font-semibold text-sm">No orders found</p>
                      <p className="text-ink-300 text-xs mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => setSelectedId(order.id)}
                      className={cn(
                        'border-b border-warm-50 cursor-pointer transition-colors group border-l-2',
                        ORDER_STATUS[order.status].rowBorder,
                        ORDER_STATUS[order.status].rowBg,
                      )}
                    >
                      {/* ID */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Hash size={11} className="text-ink-300" />
                          <span className="font-mono text-sm font-bold text-pink-500">{order.id.replace('ORD-', '')}</span>
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

                      {/* Items */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-ink-700 font-medium">{order.items.reduce((s, i) => s + i.qty, 0)} pcs</p>
                        <p className="text-xs text-ink-400 truncate max-w-32">{order.items.map((i) => i.name).join(', ')}</p>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-ink-900">{fmt(order.total)}</span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-ink-500 font-medium">
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
                            <Eye size={12} /> View
                          </div>
                          <ChevronRight size={14} className="text-pink-300" />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-warm-100 bg-warm-50/40 flex items-center justify-between">
            <p className="text-xs text-ink-400">
              Showing <span className="font-bold text-ink-700">{filtered.length}</span> of <span className="font-bold">{orders.length}</span> orders
            </p>
            <p className="text-xs font-bold text-ink-700">
              Subtotal: {fmt(filtered.reduce((s, o) => s + o.total, 0))}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Order modal */}
      <AnimatePresence>
        {selected && (
          <OrderModal
            order={selected}
            busy={busy}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
            onRefund={handleRefund}
            onSaveNote={handleSaveNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
