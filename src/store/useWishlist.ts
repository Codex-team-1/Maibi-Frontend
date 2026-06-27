import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  /** Product ids (Set semantics, stored as an array so it persists cleanly). */
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'maibi-wishlist' },
  ),
);

export const selectWishCount = (s: WishlistState): number => s.ids.length;
