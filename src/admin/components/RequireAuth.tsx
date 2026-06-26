import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store/useAuth';

/** Gate admin routes behind a valid JWT session. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const admin = useAuth((s) => s.admin);
  const initializing = useAuth((s) => s.initializing);
  const location = useLocation();

  // Wait for the startup token check before deciding.
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <Loader2 size={28} className="animate-[spin_0.8s_linear_infinite] text-pink-400" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
