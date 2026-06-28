/* ──────────────────────────────────────────────────────────────────────────
   Typed endpoint functions for the Maibi backend.
   ────────────────────────────────────────────────────────────────────────── */
import { apiRequest, type Paginated } from '@/lib/api';
import type {
  ApiConfig,
  ProductDTO,
  AdminProductDTO,
  CreateProductBody,
  UpdateProductBody,
  OrderDTO,
  CheckoutBody,
  UpdateOrderBody,
  CustomOrderDTO,
  UpdateCustomOrderBody,
  ReviewDTO,
  AdminReviewDTO,
  CreateReviewBody,
  NewOrdersSinceResponse,
  LowStockProductDTO,
  LoginResponse,
  AdminProfile,
  UpdateProfileBody,
  AnalyticsOverview,
} from './types';

/* ── Health & config ───────────────────────────────────────────────────────── */
export const getConfig = (signal?: AbortSignal) =>
  apiRequest<ApiConfig>('/config', { signal });

/* ── Products (public) ─────────────────────────────────────────────────────── */
export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'new' | 'limited';
  category?: string[];
  badgeLabel?: string[];
  inStock?: 'true' | 'false';
  q?: string;
}

export const listProducts = (query: ProductQuery = {}, signal?: AbortSignal) =>
  apiRequest<Paginated<ProductDTO>>('/products', { query, signal });

export const getProduct = (id: number, signal?: AbortSignal) =>
  apiRequest<ProductDTO>(`/products/${id}`, { signal });

export const getFeaturedProducts = (limit = 8, signal?: AbortSignal) =>
  apiRequest<{ items: ProductDTO[] }>('/products/featured', { query: { limit }, signal });

export const getNewProducts = (limit = 8, signal?: AbortSignal) =>
  apiRequest<{ items: ProductDTO[] }>('/products/new', { query: { limit }, signal });

/* ── Orders & custom orders (public) ───────────────────────────────────────── */
export const createOrder = (body: CheckoutBody) =>
  apiRequest<OrderDTO>('/orders', { method: 'POST', body });

export const createCustomOrder = (form: FormData) =>
  apiRequest<CustomOrderDTO>('/custom-orders', { method: 'POST', form });

/* ── Reviews (public) ──────────────────────────────────────────────────────── */
export const createReview = (body: CreateReviewBody) =>
  apiRequest<ReviewDTO>('/reviews', { method: 'POST', body });

export const listReviews = (signal?: AbortSignal) =>
  apiRequest<{ items: ReviewDTO[] }>('/reviews', { signal });

/* ── Auth ──────────────────────────────────────────────────────────────────── */
export const login = (email: string, password: string) =>
  apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } });

export const getMe = (signal?: AbortSignal) =>
  apiRequest<AdminProfile>('/auth/me', { auth: true, signal });

/* ── Admin: products ───────────────────────────────────────────────────────── */
export interface AdminProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  active?: 'true' | 'false';
  sort?: 'stock' | 'totalSold' | 'revenue' | 'new';
  order?: 'asc' | 'desc';
}

export const adminListProducts = (query: AdminProductQuery = {}, signal?: AbortSignal) =>
  apiRequest<Paginated<AdminProductDTO>>('/admin/products', { auth: true, query, signal });

export const adminGetProduct = (id: number, signal?: AbortSignal) =>
  apiRequest<AdminProductDTO>(`/admin/products/${id}`, { auth: true, signal });

export const adminCreateProduct = (body: CreateProductBody) =>
  apiRequest<AdminProductDTO>('/admin/products', { method: 'POST', auth: true, body });

export const adminUpdateProduct = (id: number, body: UpdateProductBody) =>
  apiRequest<AdminProductDTO>(`/admin/products/${id}`, { method: 'PATCH', auth: true, body });

export const adminDeleteProduct = (id: number) =>
  apiRequest<{ ok: boolean; id: number }>(`/admin/products/${id}`, { method: 'DELETE', auth: true });

export const adminUploadImages = (id: number, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  return apiRequest<AdminProductDTO>(`/admin/products/${id}/images`, { method: 'POST', auth: true, form });
};

export const adminDeleteImage = (id: number, idx: number) =>
  apiRequest<AdminProductDTO>(`/admin/products/${id}/images/${idx}`, { method: 'DELETE', auth: true });

/* ── Admin: orders ─────────────────────────────────────────────────────────── */
export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  q?: string;
}

export const adminListOrders = (query: AdminOrderQuery = {}, signal?: AbortSignal) =>
  apiRequest<Paginated<OrderDTO>>('/admin/orders', { auth: true, query, signal });

export const adminGetOrder = (id: string, signal?: AbortSignal) =>
  apiRequest<OrderDTO>(`/admin/orders/${id}`, { auth: true, signal });

export const adminUpdateOrder = (id: string, body: UpdateOrderBody) =>
  apiRequest<OrderDTO>(`/admin/orders/${id}`, { method: 'PATCH', auth: true, body });

export const adminCancelOrder = (id: string) =>
  apiRequest<OrderDTO>(`/admin/orders/${id}/cancel`, { method: 'POST', auth: true });

export const adminRefundOrder = (id: string) =>
  apiRequest<OrderDTO>(`/admin/orders/${id}/refund`, { method: 'POST', auth: true });

/* ── Admin: custom orders ──────────────────────────────────────────────────── */
export interface AdminCustomOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export const adminListCustomOrders = (query: AdminCustomOrderQuery = {}, signal?: AbortSignal) =>
  apiRequest<Paginated<CustomOrderDTO>>('/admin/custom-orders', { auth: true, query, signal });

export const adminGetCustomOrder = (id: string, signal?: AbortSignal) =>
  apiRequest<CustomOrderDTO>(`/admin/custom-orders/${id}`, { auth: true, signal });

export const adminUpdateCustomOrder = (id: string, body: UpdateCustomOrderBody) =>
  apiRequest<CustomOrderDTO>(`/admin/custom-orders/${id}`, { method: 'PATCH', auth: true, body });

export const adminCancelCustomOrder = (id: string) =>
  apiRequest<CustomOrderDTO>(`/admin/custom-orders/${id}/cancel`, { method: 'POST', auth: true });

export const adminRefundCustomOrder = (id: string) =>
  apiRequest<CustomOrderDTO>(`/admin/custom-orders/${id}/refund`, { method: 'POST', auth: true });

/* ── Admin: reviews ────────────────────────────────────────────────────────── */
export interface AdminReviewQuery {
  page?: number;
  limit?: number;
  approved?: 'true' | 'false';
  q?: string;
}

export const adminListReviews = (query: AdminReviewQuery = {}, signal?: AbortSignal) =>
  apiRequest<Paginated<AdminReviewDTO>>('/admin/reviews', { auth: true, query, signal });

export const adminDeleteReview = (id: string) =>
  apiRequest<{ ok: boolean; id: string }>(`/admin/reviews/${id}`, { method: 'DELETE', auth: true });

export const adminToggleApproveReview = (id: string) =>
  apiRequest<AdminReviewDTO>(`/admin/reviews/${id}/approve`, { method: 'PATCH', auth: true });

/* ── Admin: order notifications ────────────────────────────────────────────── */
export const adminGetNewOrders = (since: string, signal?: AbortSignal) =>
  apiRequest<NewOrdersSinceResponse>('/admin/orders/new-since', { auth: true, query: { since }, signal });

/* ── Admin: analytics ──────────────────────────────────────────────────────── */
export const adminGetAnalytics = (signal?: AbortSignal) =>
  apiRequest<AnalyticsOverview>('/admin/analytics', { auth: true, signal });

export const adminGetLowStock = (signal?: AbortSignal) =>
  apiRequest<LowStockProductDTO[]>('/admin/analytics/low-stock', { auth: true, signal });

/* ── Admin: profile ────────────────────────────────────────────────────────── */
export const adminUpdateProfile = (body: UpdateProfileBody) =>
  apiRequest<AdminProfile>('/admin/profile', { method: 'PATCH', auth: true, body });

export * from './types';
