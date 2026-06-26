import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, Sparkles, Package,
  DollarSign, ArrowUpRight, CheckCircle2, Clock, AlertTriangle,
  Star, BarChart3, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import { adminGetAnalytics } from '@/api';
import type {
  AnalyticsSummary,
  RevenuePointDTO,
  CategorySplitDTO,
  TopProductDTO,
  ActivityDTO,
} from '@/api';
import { Spinner, ErrorState } from '@/components/ui';

/* ── Stat card ────────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
}
function StatCard({ label, value, delta, icon, iconBg, delay = 0 }: StatCardProps) {
  const up = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          {icon}
        </div>
        <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full', up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-semibold text-ink-900 tracking-tight">{value}</p>
        <p className="text-xs text-ink-400 font-ui mt-0.5">{label}</p>
      </div>
      <p className="text-xs text-ink-400 mt-2">vs last month</p>
    </motion.div>
  );
}

/* ── Sparkline bar chart ──────────────────────────────────────────────────── */
function RevenueChart({
  points,
  growth,
}: {
  points: RevenuePointDTO[];
  growth: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.revenue));
  const show = points.slice(-10);
  const up = growth >= 0;

  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">Revenue</h3>
          <p className="text-xs text-ink-400 mt-0.5">Last 14 days</p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full',
            up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50',
          )}
        >
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {up ? '+' : ''}{growth}%
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-40">
        {/* Y-axis hints */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between pr-2 pointer-events-none">
          {[max, max * 0.5, 0].map((v, i) => (
            <span key={i} className="text-xs text-ink-400 font-ui">{v === 0 ? '0' : `${Math.round(v / 1000)}k`}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 pl-8 flex items-end gap-1.5 pb-0">
          {show.map((point, i) => {
            const pct = (point.revenue / max) * 100;
            const isHov = hovered === i;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 bg-ink-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg pointer-events-none"
                  >
                    <p className="font-bold">{fmt(point.revenue)}</p>
                    <p className="text-white/70">{point.orders} orders</p>
                  </motion.div>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 0.61, 0.36, 1] }}
                  className={cn(
                    'w-full rounded-t-lg transition-colors',
                    isHov
                      ? 'bg-pink-400'
                      : 'bg-linear-to-t from-pink-300 to-pink-200',
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex pl-8 gap-1.5 mt-2">
        {show.map((p, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs text-ink-400 font-ui">{p.day.replace('Jun ', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category donut ───────────────────────────────────────────────────────── */
function CategoryChart({ data }: { data: CategorySplitDTO[] }) {
  const total = data.reduce((s, c) => s + c.count, 0) || 1;
  let accumulated = 0;
  const segments = data.map((c) => {
    const pct = (c.count / total) * 100;
    const start = accumulated;
    accumulated += pct;
    return { ...c, pct, start };
  });

  const r = 36;
  const cx = 50;
  const cy = 50;
  const circ = 2 * Math.PI * r;

  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">Categories</h3>
      <p className="text-xs text-ink-400 mb-5">Sales by category</p>

      <div className="flex items-center gap-6">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4efef" strokeWidth="12" />
            {segments.map((seg, i) => (
              <motion.circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${(seg.pct / 100) * circ} ${circ}`}
                strokeDashoffset={-((seg.start / 100) * circ)}
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${(seg.pct / 100) * circ} ${circ}` }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 0.61, 0.36, 1] }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-lg font-bold text-ink-900">{total}</p>
            <p className="text-xs text-ink-400">sold</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {segments.map((seg) => (
            <div key={seg.cat} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                <span className="text-xs font-semibold text-ink-700">{seg.cat}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-ink-900">{seg.count}</span>
                <span className="text-xs text-ink-400 ml-1">({seg.pct.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Top products table ───────────────────────────────────────────────────── */
function TopProducts({ data }: { data: TopProductDTO[] }) {
  const TOP_PRODUCTS = data;
  if (TOP_PRODUCTS.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} className="text-pink-400" />
          <h3 className="font-display text-lg font-semibold text-ink-900">Top Products</h3>
        </div>
        <p className="text-sm text-ink-400">No sales yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={16} className="text-pink-400" />
        <h3 className="font-display text-lg font-semibold text-ink-900">Top Products</h3>
      </div>
      <div className="space-y-3">
        {TOP_PRODUCTS.map((p, i) => {
          const maxRev = TOP_PRODUCTS[0].revenue;
          const pct = (p.revenue / maxRev) * 100;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-bold text-ink-400 w-4 shrink-0">#{i + 1}</span>
              <div className="w-7 h-7 rounded-lg shrink-0 overflow-hidden bg-warm-100 flex items-center justify-center">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  : <span className="font-script text-xs text-warm-300">M</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-ink-700 truncate">{p.name}</p>
                  <p className="text-xs font-bold text-ink-900 ml-2 shrink-0">{fmt(p.revenue)}</p>
                </div>
                <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
                    className="h-full rounded-full bg-linear-to-r from-pink-300 to-pink-400"
                  />
                </div>
              </div>
              <span className="text-xs text-ink-400 shrink-0 w-12 text-right">{p.sold} sold</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity feed ────────────────────────────────────────────────────────── */
const activityMeta: Record<ActivityDTO['severity'], { icon: React.ReactNode; bg: string; text: string }> = {
  success: { icon: <CheckCircle2 size={14} />, bg: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { icon: <AlertTriangle size={14} />, bg: 'bg-amber-50',  text: 'text-amber-600'  },
  info:    { icon: <Clock size={14} />,         bg: 'bg-pink-50',   text: 'text-pink-500'   },
  error:   { icon: <AlertTriangle size={14} />, bg: 'bg-red-50',    text: 'text-red-600'    },
};

function ActivityFeed({ data }: { data: ActivityDTO[] }) {
  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-5">Recent Activity</h3>
      <div className="space-y-3">
        {data.length === 0 && (
          <p className="text-sm text-ink-400">No recent activity.</p>
        )}
        {data.map((item, i) => {
          const meta = activityMeta[item.severity];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors"
            >
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', meta.bg, meta.text)}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-700 leading-snug">{item.message}</p>
                <p className="text-xs text-ink-400 mt-0.5">{item.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
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
export function Analytics() {
  const { data, loading, error, reload } = useAsync(
    (signal) => adminGetAnalytics(signal),
    [],
  );

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error || !data) {
    return <ErrorState message={error ?? 'Could not load analytics.'} onRetry={reload} />;
  }

  const s: AnalyticsSummary = data.summary;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="text-sm text-ink-400 mt-1">Here's what's happening with Maibi today.</p>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={fmt(s.totalRevenue)}
          delta={s.revenueGrowth}
          icon={<DollarSign size={18} className="text-pink-500" />}
          iconBg="bg-pink-50"
          delay={0}
        />
        <StatCard
          label="Total Orders"
          value={String(s.totalOrders)}
          delta={s.ordersGrowth}
          icon={<ShoppingBag size={18} className="text-amber-500" />}
          iconBg="bg-amber-50"
          delay={0.06}
        />
        <StatCard
          label="Custom Orders"
          value={String(s.customOrders)}
          delta={s.customOrdersGrowth}
          icon={<Sparkles size={18} className="text-purple-500" />}
          iconBg="bg-purple-50"
          delay={0.12}
        />
        <StatCard
          label="Avg Order Value"
          value={fmt(s.avgOrderValue)}
          delta={s.aovGrowth}
          icon={<Star size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          delay={0.18}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Orders', value: s.pendingOrders, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14} /> },
          { label: 'Active Products', value: s.activeProducts, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <Package size={14} /> },
          { label: 'Conversion Rate', value: `${s.conversionRate}%`, color: 'text-pink-500', bg: 'bg-pink-50', icon: <ArrowUpRight size={14} /> },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-warm-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', item.bg, item.color)}>
              {item.icon}
            </div>
            <div>
              <p className={cn('text-xl font-display font-semibold', item.color)}>{item.value}</p>
              <p className="text-xs text-ink-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart points={data.revenue} growth={s.revenueGrowth} />
        </div>
        <CategoryChart data={data.categories} />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TopProducts data={data.topProducts} />
        <ActivityFeed data={data.activity} />
      </div>
    </div>
  );
}
