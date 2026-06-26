import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { parsePrice } from '@/lib/format';

interface CartState {
  items: CartItem[];
  add: (product: Product, cartQty: number, size: string, color?: string) => void;
  remove: (index: number) => void;
  setQty: (index: number, cartQty: number) => void;
  clear: () => void;
}

function migrateItem(it: Record<string, unknown>): CartItem {
  return {
    ...it,
    images:   Array.isArray(it.images) ? it.images : [],
    sizes:    Array.isArray(it.sizes)  ? it.sizes  : [],
    colors:   Array.isArray(it.colors) ? it.colors : [],
    stock:    typeof it.stock   === 'number' ? it.stock   : 0,
    inStock:  typeof it.inStock === 'boolean' ? it.inStock : true,
    price:    typeof it.price   === 'string'  ? it.price   : String(it.priceN ?? 0),
    priceN:   typeof it.priceN  === 'number'  ? it.priceN  : parsePrice(String(it.price ?? '0')),
    cartQty:  typeof it.cartQty === 'number'  ? it.cartQty : 1,
    size:     typeof it.size    === 'string'  ? it.size    : '',
    color:    typeof it.color   === 'string'  ? it.color   : '',
  } as CartItem;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, cartQty, size, color = '') =>
        set((state) => ({
          items: [
            ...state.items,
            { ...product, cartQty, size, color, priceN: parsePrice(product.price) },
          ],
        })),
      remove: (index) =>
        set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
      setQty: (index, cartQty) =>
        set((state) => ({
          items: state.items.map((it, i) =>
            i === index ? { ...it, cartQty: Math.max(1, cartQty) } : it,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'maibi-cart',
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map((it) => migrateItem(it as unknown as Record<string, unknown>));
        }
      },
    },
  ),
);

export const selectCartCount = (s: CartState): number =>
  s.items.reduce((sum, it) => sum + it.cartQty, 0);

export const selectSubtotal = (s: CartState): number =>
  s.items.reduce((sum, it) => sum + it.priceN * it.cartQty, 0);
