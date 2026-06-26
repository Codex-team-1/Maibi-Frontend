import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Heart, Scissors, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCart, selectCartCount } from '@/store/useCart';
import { useWishlist, selectWishCount } from '@/store/useWishlist';
import { useUI } from '@/store/useUI';
import { cn } from '@/lib/cn';

interface NavItem {
  id: string;
  to: string | null;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cartCount = useCart(selectCartCount);
  const wishCount = useWishlist(selectWishCount);
  const openCart = useUI((s) => s.openCart);

  const items: NavItem[] = [
    { id: 'home', to: '/', icon: Home, label: 'Home' },
    { id: 'shop', to: '/shop', icon: LayoutGrid, label: 'Shop' },
    { id: 'wishlist', to: '/wishlist', icon: Heart, label: 'Saved', badge: wishCount },
    { id: 'custom', to: '/custom-order', icon: Scissors, label: 'Custom' },
    { id: 'cart', to: null, icon: ShoppingBag, label: 'Cart', badge: cartCount },
  ];

  const isActive = (item: NavItem) =>
    item.to === pathname ||
    (item.id === 'home' && pathname.startsWith('/product'));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-warm-50/95 backdrop-blur-md border-t border-warm-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.to ? navigate(item.to) : openCart())}
            className={cn(
              'flex-1 border-0 bg-transparent cursor-pointer flex flex-col items-center gap-[3px] pt-2.5 pb-2 relative transition-colors',
              active ? 'text-pink-500' : 'text-ink-400',
            )}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
              fill={item.id === 'wishlist' && active ? 'var(--color-pink-500)' : 'none'}
            />
            <span className="text-[10px] font-semibold">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute top-1.5 left-1/2 translate-x-2 bg-pink-500 text-white text-[9px] font-bold rounded-full min-w-3.5 h-3.5 grid place-items-center px-[3px]">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
