import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Sparkles, Package, Menu, X,
  ChevronLeft, LogOut, Settings,
  AlertCircle, User, Shield, ChevronDown,
  Check, Loader2, Bell, Star,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/format';
import { useAuth } from '@/store/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { adminGetAnalytics, adminUpdateProfile, adminGetNewOrders, adminGetLowStock } from '@/api';
import type { NewOrderNotification, LowStockProductDTO as LowStockNotification } from '@/api';
import { ApiError } from '@/lib/api';
import maibiLogo from '@/assets/maibi-logo.jpg';

const LAST_SEEN_KEY = 'maibi_admin_last_seen_order';
const POLL_INTERVAL_MS = 30_000;

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

/* ── Order + stock notification bell ─────────────────────────────────────── */
function NotificationBell() {
  const [newOrders, setNewOrders]     = useState<NewOrderNotification[]>([]);
  const [lowStock,  setLowStock]      = useState<LowStockNotification[]>([]);
  const [open,      setOpen]          = useState(false);
  const [tab,       setTab]           = useState<'orders' | 'stock'>('orders');
  const panelRef                      = useRef<HTMLDivElement>(null);

  const fetchNew = useCallback(async () => {
    const since = localStorage.getItem(LAST_SEEN_KEY) ?? new Date(0).toISOString();
    try {
      const [ordersRes, stockRes] = await Promise.all([
        adminGetNewOrders(since),
        adminGetLowStock(),
      ]);
      if (ordersRes.count > 0) setNewOrders(ordersRes.orders);
      setLowStock(stockRes);
    } catch {
      // silent — don't disrupt the admin on poll failure
    }
  }, []);

  useEffect(() => {
    fetchNew();
    const id = setInterval(fetchNew, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNew]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markOrdersSeen = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setNewOrders([]);
  };

  const orderCount = newOrders.length;
  const stockCount = lowStock.length;
  const totalCount = orderCount + stockCount;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          totalCount > 0
            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
            : 'text-ink-400 hover:bg-warm-100',
        )}
        title="Notifications"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
          >
            {totalCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-warm-200 z-50 overflow-hidden"
          >
            {/* Panel header */}
            <div className="px-4 pt-3 pb-0 border-b border-warm-100 bg-warm-50">
              <p className="text-sm font-bold text-ink-900 mb-2.5">Notifications</p>
              {/* Tabs */}
              <div className="flex gap-1">
                {([
                  { key: 'orders', label: 'New Orders', count: orderCount, dot: 'bg-pink-400'  },
                  { key: 'stock',  label: 'Low Stock',  count: stockCount,  dot: 'bg-amber-400' },
                ] as const).map(({ key, label, count: c, dot }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 transition-colors -mb-px',
                      tab === key
                        ? 'border-pink-400 text-pink-600 bg-white'
                        : 'border-transparent text-ink-400 hover:text-ink-700',
                    )}
                  >
                    {label}
                    {c > 0 && (
                      <span className={cn('w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center', dot)}>
                        {c}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders tab */}
            {tab === 'orders' && (
              <>
                {orderCount === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingBag size={28} className="text-warm-200 mx-auto mb-2" />
                    <p className="text-sm text-ink-400">No new orders</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-72 overflow-y-auto divide-y divide-warm-100">
                      {newOrders.map((o) => (
                        <div key={o.id} className="px-4 py-3 hover:bg-warm-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-pink-500">{o.id}</span>
                            <span className="text-xs font-bold text-ink-900">{fmt(o.total)}</span>
                          </div>
                          <p className="text-sm font-semibold text-ink-700 mt-0.5">{o.customer}</p>
                          <p className="text-xs text-ink-400">{o.wilaya} · {new Date(o.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-warm-100 bg-warm-50">
                      <button
                        onClick={markOrdersSeen}
                        className="w-full py-2 bg-pink-400 text-white text-sm font-bold rounded-xl hover:brightness-105 transition"
                      >
                        Dismiss all
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Stock tab */}
            {tab === 'stock' && (
              <>
                {stockCount === 0 ? (
                  <div className="py-10 text-center">
                    <Package size={28} className="text-warm-200 mx-auto mb-2" />
                    <p className="text-sm text-ink-400">All products are well stocked</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-warm-100">
                    {lowStock.map((p) => {
                      const isOut = p.stock === 0;
                      return (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-warm-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center shrink-0">
                              <Package size={13} className="text-ink-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink-700 truncate">{p.name}</p>
                            <p className="text-xs text-ink-400">{p.category}</p>
                          </div>
                          <span className={cn(
                            'text-xs font-bold px-2 py-1 rounded-full shrink-0',
                            isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                          )}>
                            {isOut ? 'Out' : `${p.stock} left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sign-out confirmation modal ─────────────────────────────────────────── */
function SignOutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} className="text-rose-500" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Sign out?</h3>
            <p className="text-sm text-ink-400">You'll be redirected to the storefront. You can sign back in anytime.</p>
          </div>
          <div className="flex border-t border-warm-100">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 text-sm font-semibold text-ink-500 hover:bg-warm-50 transition-colors border-r border-warm-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Settings modal ──────────────────────────────────────────────────────── */
function SettingsModal({ onClose }: { onClose: () => void }) {
  const admin = useAuth((s) => s.admin);
  const setAdmin = useAuth((s) => s.setAdmin);

  const [name, setName] = useState(admin?.name ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [phone, setPhone] = useState(admin?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (name !== admin?.name) body.name = name;
      if (email !== admin?.email) body.email = email;
      if (phone !== admin?.phone) body.phone = phone;
      if (newPassword) {
        body.newPassword = newPassword;
        body.currentPassword = currentPassword;
      }
      const updated = await adminUpdateProfile(body);
      setAdmin(updated);
      setCurrentPassword('');
      setNewPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not save your changes.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100 bg-linear-to-r from-pink-50/60 to-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
                <User size={17} className="text-pink-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">Profile</h2>
                <p className="text-xs text-ink-400">Manage your account information</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-ink-400 hover:bg-warm-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-sm shrink-0">
                <span className="font-script text-white text-3xl leading-none">
                  {(admin?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-ink-900">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-ink-400 mt-0.5">{admin?.email}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Fields */}
            <div>
              <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>

            {/* Password change */}
            <div>
              <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only to change password"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-warm-100 bg-warm-50 shrink-0">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-ink-400" />
              <span className="text-xs text-ink-400">Saved to your account</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-warm-200 text-sm font-semibold text-ink-500 hover:bg-white transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  saved ? 'bg-emerald-500 text-white' : 'bg-pink-400 text-white hover:brightness-105 shadow-sm',
                  saving && 'opacity-70',
                )}
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-[spin_0.7s_linear_infinite]" /> Saving…</>
                ) : saved ? (
                  <><Check size={14} /> Saved!</>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Sidebar nav link ────────────────────────────────────────────────────── */
function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isExact = item.to === '/admin';
  const active = isExact
    ? location.pathname === '/admin'
    : location.pathname.startsWith(item.to);

  return (
    <NavLink
      to={item.to}
      end={isExact}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
        active ? 'bg-pink-400 text-white shadow-brand' : 'text-ink-500 hover:bg-pink-50 hover:text-pink-600',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="font-ui font-semibold text-sm truncate">{item.label}</span>}
      {item.badge !== undefined && item.badge > 0 && (
        <span className={cn(
          'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold',
          active ? 'bg-white/30 text-white ml-auto' : 'bg-pink-400 text-white ml-auto',
          collapsed && 'absolute -top-1 -right-1 min-w-4 h-4 text-[10px]',
        )}>
          {item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 z-50 hidden group-hover:flex items-center pointer-events-none">
          <div className="bg-ink-900 text-white text-xs font-ui font-semibold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            {item.label}
          </div>
        </div>
      )}
    </NavLink>
  );
}

/* ── Layout ──────────────────────────────────────────────────────────────── */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const admin = useAuth((s) => s.admin);
  const logout = useAuth((s) => s.logout);

  // Live nav badges + pending pill from the analytics summary.
  const { data: analytics } = useAsync((signal) => adminGetAnalytics(signal), []);
  const pendingOrders = analytics?.summary.pendingOrders ?? 0;
  const lowStockProducts = analytics?.summary.lowStockProducts ?? 0;

  const NAV: NavItem[] = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Analytics' },
    { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders', badge: pendingOrders },
    { to: '/admin/custom-orders', icon: <Sparkles size={18} />, label: 'Custom Orders' },
    { to: '/admin/products', icon: <Package size={18} />, label: 'Products', badge: lowStockProducts },
    { to: '/admin/reviews', icon: <Star size={18} />, label: 'Reviews' },
  ];

  const currentLabel = NAV.find((n) =>
    n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to),
  )?.label ?? 'Admin';

  const handleSignOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Divider + bottom actions */}
        <div className="pt-4 mt-4 border-t border-warm-100 space-y-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-500 hover:bg-warm-100 hover:text-ink-700 transition-colors text-sm font-semibold',
              collapsed && 'justify-center px-2',
            )}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 hidden group-hover:flex">
                <div className="bg-ink-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">Settings</div>
              </div>
            )}
          </button>
          <button
            onClick={() => setShowSignOut(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors text-sm font-semibold',
              collapsed && 'justify-center px-2',
            )}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!mobileOpen && (
        <div className="px-3 pb-3 border-t border-warm-100 pt-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-400 hover:bg-warm-100 hover:text-ink-700 transition-colors text-sm',
              collapsed && 'justify-center',
            )}
          >
            <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <ChevronLeft size={16} />
            </motion.span>
            {!collapsed && <span className="font-semibold text-xs">Collapse</span>}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex bg-warm-50 font-ui">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 bg-white border-r border-warm-200 shadow-sm overflow-hidden"
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center justify-center border-b border-warm-100 shrink-0',
          collapsed ? 'px-3 py-3' : 'px-5 py-3',
        )}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-pink-100 shadow-sm">
              <img src={maibiLogo} alt="Maibi" className="w-full h-full object-cover scale-[1.8] -translate-x-1" draggable={false} />
            </div>
          ) : (
            <img src={maibiLogo} alt="Maibi" className="h-14 w-auto object-contain" draggable={false} />
          )}
        </div>

        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-warm-200 shadow-xl z-50 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100 shrink-0">
              <img src={maibiLogo} alt="Maibi" className="h-12 w-auto object-contain" draggable={false} />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-ink-400 hover:bg-warm-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden" onClick={() => setMobileOpen(false)}>
              <SidebarContent collapsed={false} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 248 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-warm-200 px-4 lg:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-warm-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-pink-400" />
            <span className="font-display text-lg font-semibold text-ink-900">{currentLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Pending pill */}
            {pendingOrders > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <AlertCircle size={12} />
                {pendingOrders} pending
              </div>
            )}

            {/* Notification bell */}
            <NotificationBell />

            {/* Avatar + name */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-warm-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-sm ring-2 ring-pink-100">
                <span className="font-script text-white text-sm leading-none">
                  {(admin?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-ink-700 leading-tight">{admin?.name || 'Admin'}</p>
                <p className="text-[10px] text-ink-400 leading-tight">Super Admin</p>
              </div>
              <ChevronDown size={12} className="text-ink-400 hidden md:block group-hover:text-ink-700 transition-colors" />
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showSignOut && <SignOutModal onConfirm={handleSignOut} onCancel={() => setShowSignOut(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}
