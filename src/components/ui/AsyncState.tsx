import { Loader2 } from 'lucide-react';
import { Button } from './Button';

/** Centered spinner for full-page / section loading. */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-400">
      <Loader2 size={28} className="animate-[spin_0.8s_linear_infinite] text-pink-400" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

/** Inline error block with a retry action. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center py-16 px-6 text-ink-500">
      <div className="font-display text-xl font-semibold text-ink-700 mb-2">
        Something went wrong
      </div>
      <p className="max-w-[320px] mx-auto mb-4 text-sm">{message}</p>
      {onRetry && (
        <Button variant="stitch" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
