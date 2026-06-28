/* ──────────────────────────────────────────────────────────────────────────
   DTOs mirroring backend API responses.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Config ────────────────────────────────────────────────────────────────── */
export interface ApiPaymentMethod {
  id: 'cod' | 'cib' | 'dahabia' | 'baridimob';
  icon: string;
  label: string;
  sub: string;
  badge: string | null;
}

export interface ApiColor {
  name: string;
  hex: string;
}

export interface ApiConfig {
  wilayas: string[];
  paymentMethods: ApiPaymentMethod[];
  colors: ApiColor[];
  categories: string[];
}

/* ── Products ──────────────────────────────────────────────────────────────── */
import type { BadgeLabel, Category } from '@/types';

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductDiscountDTO {
  percent: number;
  activeUntil: string;
  discountedPrice: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  price: string;
  category: Category;
  description: string;
  stock: number;
  inStock: boolean;
  badgeLabel?: BadgeLabel;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  rating: { ratingCount: number; ratingAvg: number };
  discount?: ProductDiscountDTO;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductDTO extends ProductDTO {
  active: boolean;
  promoted: boolean;
  totalSold: number;
  revenue: number;
  discountRaw?: { percent: number; activeUntil: string | null };
}

export interface DiscountBody {
  percent: number;
  activeUntil: string;
}

export interface CreateProductBody {
  name: string;
  price: string;
  category: Category;
  description?: string;
  stock?: number;
  inStock?: boolean;
  badgeLabel?: BadgeLabel | null;
  images?: ProductImage[];
  sizes?: string[];
  colors?: string[];
  active?: boolean;
  promoted?: boolean;
  discount?: DiscountBody | null;
}

export type UpdateProductBody = Partial<CreateProductBody>;

/* ── Orders ────────────────────────────────────────────────────────────────── */
export interface OrderItem {
  name: string;
  qty: number;
  size: string;
  color?: string;
  image?: string;
  price: number;
}

export interface OrderDTO {
  id: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  address?: string;
  city?: string;
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  shippingType: 'home' | 'desk';
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface CheckoutBody {
  items: { productId: number; qty: number; size: string; color?: string; price: number }[];
  shipping: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    wilaya: string;
    shippingType: 'home' | 'desk';
    shippingFee: number;
    notes?: string;
  };
  payment: {
    method: 'cod' | 'cib' | 'dahabia' | 'baridimob';
    card?: { number: string; name: string; expiry: string; cvv: string };
  };
  total: number;
}

export interface UpdateOrderBody {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
  shippingFee?: number;
}

/* ── Reviews ───────────────────────────────────────────────────────────────── */
export interface ReviewDTO {
  name: string;
  wilaya: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface AdminReviewDTO {
  id: string;
  name: string;
  wilaya: string;
  comment: string;
  rating: number;
  orderCode: string | null;
  approved: boolean;
  createdAt: string;
}

export interface CreateReviewBody {
  name: string;
  wilaya: string;
  rating: number;
  comment: string;
  orderCode?: string;
}

/* ── Notifications ─────────────────────────────────────────────────────────── */
export interface NewOrderNotification {
  id: string;
  customer: string;
  wilaya: string;
  total: number;
  createdAt: string;
}

export interface NewOrdersSinceResponse {
  count: number;
  orders: NewOrderNotification[];
}

/* ── Custom orders ─────────────────────────────────────────────────────────── */
export type CustomOrderStatus =
  | 'new' | 'in_review' | 'quoted' | 'accepted'
  | 'in_production' | 'shipped' | 'delivered' | 'cancelled';

export interface CustomOrderDTO {
  id: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  garmentType: string;
  size: string;
  colors: string[];
  notes: string;
  referenceImage: boolean;
  referenceImageUrl?: string;
  budget: string;
  status: CustomOrderStatus;
  quotedPrice?: number | null;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomOrderBody {
  status?: CustomOrderStatus;
  note?: string;
  quotedPrice?: number;
}

/* ── Auth / profile ────────────────────────────────────────────────────────── */
export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminProfile;
}

export interface UpdateProfileBody {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

/* ── Analytics ─────────────────────────────────────────────────────────────── */
export interface LowStockProductDTO {
  id: number;
  name: string;
  stock: number;
  category: string;
  image?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  customOrders: number;
  customOrdersGrowth: number;
  avgOrderValue: number;
  aovGrowth: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockProducts: number;
  lowStockList: LowStockProductDTO[];
  conversionRate: number;
}

export interface RevenuePointDTO {
  day: string;
  revenue: number;
  orders: number;
}

export interface CategorySplitDTO {
  cat: string;
  count: number;
  revenue: number;
  color: string;
}

export interface TopProductDTO {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  image?: string;
}

export interface ActivityDTO {
  id: string;
  type: 'order' | 'custom_order' | 'product_low' | 'review';
  message: string;
  time: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export interface AnalyticsOverview {
  summary: AnalyticsSummary;
  revenue: RevenuePointDTO[];
  categories: CategorySplitDTO[];
  topProducts: TopProductDTO[];
  activity: ActivityDTO[];
}
