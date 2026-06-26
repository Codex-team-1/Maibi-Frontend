import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

/** Tiny UI store so Header / bottom-nav / product page can open the cart drawer
 *  without prop-drilling through the router layout. */
export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
