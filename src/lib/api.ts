/* ──────────────────────────────────────────────────────────────────────────
   Maibi API client
   Thin typed wrapper around the backend documented in backend/API_DOC.md.
   Base URL comes from VITE_API_URL (default: http://localhost:3000/api).
   ────────────────────────────────────────────────────────────────────────── */

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'maibi-admin-token';

/* ── Token storage (admin JWT) ─────────────────────────────────────────────── */
export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/* ── Error shape ───────────────────────────────────────────────────────────── */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code || 'INTERNAL_ERROR';
    this.details = body.details;
  }
}

/* ── Core request ──────────────────────────────────────────────────────────── */
interface RequestOptions {
  method?: string;
  /** JSON body — serialized automatically. Mutually exclusive with `form`. */
  body?: unknown;
  /** FormData body — sent as multipart, no JSON header. */
  form?: FormData;
  /** Attach the admin Bearer token. */
  auth?: boolean;
  /**
   * Query params (undefined/null/'' values are skipped; arrays repeat the key).
   * Accepts any plain object whose values are scalars or scalar arrays.
   */
  query?: Record<string, QueryValue> | object;
  signal?: AbortSignal;
}

type QueryValue = string | number | boolean | undefined | null | Array<string | number>;

function buildQuery(query: object | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, form, auth, query, signal } = options;

  const headers: Record<string, string> = {};
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (form) {
    payload = form; // browser sets multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: 'Cannot reach the server. Check your connection and try again.',
    });
  }

  // 204 / empty body
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const errBody = (data as { error?: ApiErrorBody })?.error ?? {
      code: 'INTERNAL_ERROR',
      message: res.statusText || 'Request failed',
    };
    // Surface auth failures so callers can clear the session.
    throw new ApiError(res.status, errBody);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ── Paginated response ────────────────────────────────────────────────────── */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
