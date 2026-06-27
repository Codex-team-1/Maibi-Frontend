export type BadgeLabel = 'Featured' | 'Trending' | 'New';
export const BADGE_LABELS = ['Featured', 'Trending', 'New'] as const satisfies BadgeLabel[];

export type Category = 'Robe' | 'Dress' | 'Abaya' | 'ensambles' | 'accessoires';
export const CATEGORIES = ['Robe', 'Dress', 'Abaya', 'ensambles', 'accessoires'] as const satisfies Category[];

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductDiscount {
  percent: number;
  activeUntil: string;
  discountedPrice: string;
}

export interface Product {
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
  discount?: ProductDiscount;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  /** Quantity in the bag. */
  cartQty: number;
  size: string;
  color: string;
  /** Parsed numeric price for arithmetic. */
  priceN: number;
}

export interface Review {
  name: string;
  wilaya: string;
  rating: number;
  text: string;
}

export interface SortOption {
  value: SortValue;
  label: string;
}

export type SortValue = 'featured' | 'price-asc' | 'price-desc' | 'new' | 'limited';

export interface PaymentMethod {
  id: PaymentMethodId;
  icon: string;
  label: string;
  sub: string;
  badge: string | null;
}

export type PaymentMethodId = 'cod' | 'cib' | 'dahabia' | 'baridimob';

export type BadgeVariant = 'brand' | 'soft' | 'neutral' | 'gold' | 'sale';
