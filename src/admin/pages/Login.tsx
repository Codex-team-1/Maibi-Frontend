import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/store/useAuth';
import { ApiError } from '@/lib/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useAuth((s) => s.admin);
  const initializing = useAuth((s) => s.initializing);
  const doLogin = useAuth((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  // Already authenticated → straight to the dashboard.
  if (!initializing && admin) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await doLogin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Wrong email or password.'
          : err instanceof ApiError
            ? err.message
            : 'Could not sign in. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full pl-10 pr-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 font-ui p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-warm-200 overflow-hidden"
      >
        <div className="flex flex-col items-center px-8 pt-8 pb-6 border-b border-warm-100 bg-linear-to-b from-pink-50/60 to-white">
          {/* <img src={maibiLogo} alt="Maibi" className="h-25 w-auto object-contain mb-2" /> */}
          <p
            className="font-script my-3 text-pink-400 leading-none flex-none no-underline"
            style={{ fontSize: 34 }}
          >
            Maibi
          </p>
          {/* <h1 className="font-display text-xl font-semibold text-ink-900">
            Admin sign in
          </h1> */}
          <p className="text-xs text-ink-400 mt-0.5">Manage your storefront</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@maibi.dz"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-400 text-white text-sm font-bold shadow-brand transition",
              loading ? "opacity-70" : "hover:brightness-105",
            )}
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  className="animate-[spin_0.7s_linear_infinite]"
                />{" "}
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
