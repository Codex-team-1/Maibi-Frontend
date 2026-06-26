export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type CustomOrderStatus = 'new' | 'in_review' | 'quoted' | 'accepted' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  items: { name: string; qty: number; size: string; price: number }[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomOrder {
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
  budget: string;
  status: CustomOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  price: string;
  priceN: number;
  oldPrice?: string;
  badge?: string;
  badgeVariant?: string;
  cat: string;
  qty: number;
  trending?: boolean;
  promoted?: boolean;
  tone: readonly [string, string];
  image?: string;
  photos?: string[];
  totalSold: number;
  revenue: number;
  active: boolean;
}

export interface AnalyticsStat {
  label: string;
  value: string;
  delta: number;
  icon: string;
}

export interface RevenuePoint {
  day: string;
  revenue: number;
  orders: number;
}

export interface CategorySplit {
  cat: string;
  count: number;
  revenue: number;
  color: string;
}

export interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  tone: readonly [string, string];
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'custom_order' | 'product_low' | 'review';
  message: string;
  time: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}
