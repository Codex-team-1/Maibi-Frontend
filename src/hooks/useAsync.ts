import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** The raw ApiError (when the failure came from the API), for status checks. */
  apiError: ApiError | null;
  /** Re-run the fetcher. */
  reload: () => void;
}

/**
 * Run an async fetcher on mount (and whenever `deps` change), exposing
 * loading / error / data state. The fetcher receives an AbortSignal so
 * in-flight requests are cancelled on unmount or dependency change.
 */
export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  // Keep the latest fetcher without forcing it into the dep array.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setApiError(null);

    fetcherRef.current(ctrl.signal)
      .then((result) => {
        if (!ctrl.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err as Error)?.name === 'AbortError') return;
        setApiError(err instanceof ApiError ? err : null);
        setError(
          err instanceof ApiError ? err.message : 'Something went wrong.',
        );
        setLoading(false);
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, apiError, reload };
}
