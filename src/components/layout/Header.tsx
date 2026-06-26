import { useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Sparkles, Scissors } from 'lucide-react';
import { useCart, selectCartCount } from '@/store/useCart';
import { useWishlist, selectWishCount } from '@/store/useWishlist';
import { useUI } from '@/store/useUI';
import { cn } from '@/lib/cn';

const LINKS: Array<{
  label: string;
  to: string;
  dot?: string;
  icon?: React.ReactNode;
}> = [
  { label: 'Shop', to: '/shop' },
  { label: 'Dresses', to: '/shop?q=Dress' },
  { label: 'Robes', to: '/shop?q=Robe' },
  {
    label: 'New in',
    to: '/shop?sort=new',
    dot: 'bg-pink-500',
    icon: <Sparkles size={11} strokeWidth={2.2} />,
  },
  {
    label: 'Custom order',
    to: '/custom-order',
    icon: <Scissors size={11} strokeWidth={2.2} />,
  },
  { label: 'Our story', to: '/#our-story' },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 grid place-items-center px-[3px]">
      {count}
    </span>
  );
}

function NavItem({
  label,
  to,
  dot,
  icon,
}: {
  label: string;
  to: string;
  dot?: string;
  icon?: React.ReactNode;
}) {
  const isHash = to.includes('#');

  if (isHash) {
    return (
      <a
        href={to}
        onClick={(e) => {
          e.preventDefault();
          const id = to.split('#')[1];
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.location.href = to;
          }
        }}
        className="relative flex items-center gap-1.5 font-ui text-[14.5px] font-medium text-ink-600 py-1 no-underline hover:text-pink-500 transition-colors duration-200 [&:hover>span:last-child]:w-full"
      >
        {icon && <span className="text-pink-400">{icon}</span>}
        <span>{label}</span>
        <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-pink-400 transition-all duration-300" />
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === '/shop'}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-1.5 font-ui text-[14.5px] font-medium py-1 no-underline transition-colors duration-200',
          isActive
            ? 'text-pink-500 [&>span:last-child]:w-full'
            : 'text-ink-600 hover:text-pink-500 [&:hover>span:last-child]:w-full',
        )
      }
    >
      {({ isActive }) => (
        <>
          {dot && (
            <span className={cn('size-1.5 rounded-full shrink-0', dot)} />
          )}
          {icon && !dot && (
            <span className={cn(isActive ? 'text-pink-500' : 'text-pink-400')}>
              {icon}
            </span>
          )}
          <span>{label}</span>
          <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-pink-400 transition-all duration-300" />
        </>
      )}
    </NavLink>
  );
}

export function Header({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const cartCount = useCart(selectCartCount);
  const wishCount = useWishlist(selectWishCount);
  const openCart = useUI((s) => s.openCart);

  const onSearch = (value: string) => {
    setQuery(value);
    navigate(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-30 bg-warm-50/90 backdrop-blur-md border-b border-warm-200">
      <div
        className={cn(
          'max-w-[1240px] mx-auto flex items-center',
          isMobile ? 'px-4 h-15 gap-3' : 'px-8 h-19 gap-7',
        )}
      >
        <Link
          to="/"
          className="font-script text-pink-400 leading-none flex-none no-underline"
          style={{ fontSize: isMobile ? 28 : 34 }}
        >
          Maibi
        </Link>

        {!isMobile && (
          <nav className="flex gap-5 flex-1 justify-center">
            {LINKS.map((l) => (
              <NavItem key={l.label} {...l} />
            ))}
          </nav>
        )}

        {!isMobile && (
          <div className="relative w-55 flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 flex">
              <Search size={20} strokeWidth={1.8} />
            </span>
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search pieces…"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-full border-2 border-warm-200 bg-white font-ui text-sm outline-none transition-colors focus:border-pink-400"
            />
          </div>
        )}

        <div
          className={cn(
            'flex items-center',
            isMobile ? 'gap-1 ml-auto' : 'gap-1',
          )}
        >
          {isMobile && (
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="border-0 bg-transparent cursor-pointer text-ink-500 flex p-2"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
          )}
          {!isMobile && (
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => navigate('/wishlist')}
              className="relative border-0 bg-transparent cursor-pointer text-ink-500 flex p-2 rounded-full transition-all duration-200 hover:text-pink-500 hover:bg-pink-50 hover:scale-110 active:scale-95"
            >
              <Heart size={20} strokeWidth={1.8} />
              <CountBadge count={wishCount} />
            </button>
          )}
          <button
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className={cn(
              'relative border-0 bg-transparent cursor-pointer text-ink-500 flex rounded-full transition-all duration-200 hover:text-pink-500 hover:bg-pink-50 hover:scale-110 active:scale-95',
              isMobile ? 'p-2' : 'p-2',
            )}
          >
            <ShoppingBag size={isMobile ? 22 : 20} strokeWidth={1.8} />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>

      {isMobile && searchOpen && (
        <div className="px-4 pb-3 border-t border-warm-200">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 flex">
              <Search size={20} strokeWidth={1.8} />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search pieces…"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-full border-2 border-pink-300 bg-white font-ui text-[15px] outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
