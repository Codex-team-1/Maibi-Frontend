import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, Sparkles, Scissors, Globe, ShoppingBag } from 'lucide-react';
import { useWishlist, selectWishCount } from '@/store/useWishlist';
import { useCart, selectCartCount } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/cn';

const LINKS: Array<{
  labelKey: TranslationKey;
  to: string;
  dot?: string;
  icon?: React.ReactNode;
}> = [
  { labelKey: 'nav.shop', to: '/shop' },
  { labelKey: 'nav.dresses', to: '/shop?q=Dress' },
  { labelKey: 'nav.robes', to: '/shop?q=Robe' },
  {
    labelKey: 'nav.newIn',
    to: '/shop?sort=new',
    dot: 'bg-pink-500',
    icon: <Sparkles size={11} strokeWidth={2.2} />,
  },
  {
    labelKey: 'nav.customOrder',
    to: '/custom-order',
    icon: <Scissors size={11} strokeWidth={2.2} />,
  },
  { labelKey: 'nav.ourStory', to: '/#our-story' },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute top-0 end-0 bg-pink-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 grid place-items-center px-[3px]">
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
  const location = useLocation();
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
        <span className="absolute bottom-0 start-0 h-[2px] w-0 rounded-full bg-pink-400 transition-all duration-300" />
      </a>
    );
  }

  const [toPath, toSearch] = to.split('?');
  const currentFull = location.pathname + location.search;
  const isActive = toSearch
    ? currentFull === `${toPath}?${toSearch}`
    : location.pathname === toPath && !location.search;

  return (
    <NavLink
      to={to}
      className={cn(
        'relative flex items-center gap-1.5 font-ui text-[14.5px] font-medium py-1 no-underline transition-colors duration-200',
        isActive
          ? 'text-pink-500 [&>span:last-child]:w-full'
          : 'text-ink-600 hover:text-pink-500 [&:hover>span:last-child]:w-full',
      )}
    >
      {dot && (
        <span className={cn('size-1.5 rounded-full shrink-0', dot)} />
      )}
      {icon && !dot && (
        <span className={cn(isActive ? 'text-pink-500' : 'text-pink-400')}>
          {icon}
        </span>
      )}
      <span>{label}</span>
      <span className="absolute bottom-0 start-0 h-[2px] w-0 rounded-full bg-pink-400 transition-all duration-300" />
    </NavLink>
  );
}

/** Compact two-language toggle. Shows the language you'd switch *to*. */
function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t('lang.label')}
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-1.5 border-0 bg-transparent cursor-pointer text-ink-500 p-2 rounded-full transition-all duration-200 hover:text-pink-500 hover:bg-pink-50 hover:scale-105 active:scale-95"
    >
      <Globe size={20} strokeWidth={1.8} />
      <span className="font-ui text-[13px] font-semibold">{t('lang.switchTo')}</span>
    </button>
  );
}

export function Header({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const wishCount = useWishlist(selectWishCount);
  const cartCount = useCart(selectCartCount);
  const openCart = useUI((s) => s.openCart);

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

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
              <NavItem key={l.labelKey} {...l} label={t(l.labelKey)} />
            ))}
          </nav>
        )}

        {!isMobile && (
          <div className="relative w-55 flex-none">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-400 flex">
              <Search size={20} strokeWidth={1.8} />
            </span>
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full ps-10 pe-3.5 py-2.5 rounded-full border-2 border-warm-200 bg-white font-ui text-sm outline-none transition-colors focus:border-pink-400"
            />
          </div>
        )}

        <div
          className={cn(
            'flex items-center',
            isMobile ? 'gap-1 ms-auto' : 'gap-1',
          )}
        >
          <LanguageToggle />
          {isMobile && (
            <button
              type="button"
              aria-label={t('nav.search')}
              onClick={() => setSearchOpen((s) => !s)}
              className="border-0 bg-transparent cursor-pointer text-ink-500 flex p-2"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
          )}
          {!isMobile && (
            <button
              type="button"
              aria-label={t('nav.wishlist')}
              onClick={() => navigate('/wishlist')}
              className="relative border-0 bg-transparent cursor-pointer text-ink-500 flex p-2 rounded-full transition-all duration-200 hover:text-pink-500 hover:bg-pink-50 hover:scale-110 active:scale-95"
            >
              <Heart size={20} strokeWidth={1.8} />
              <CountBadge count={wishCount} />
            </button>
          )}
          {!isMobile && (
            <button
              type="button"
              aria-label={t('nav.cart')}
              onClick={openCart}
              className="relative border-0 bg-transparent cursor-pointer text-ink-500 flex p-2 rounded-full transition-all duration-200 hover:text-pink-500 hover:bg-pink-50 hover:scale-110 active:scale-95"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              <CountBadge count={cartCount} />
            </button>
          )}
        </div>
      </div>

      {isMobile && searchOpen && (
        <div className="px-4 pb-3 border-t border-warm-200">
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-400 flex">
              <Search size={20} strokeWidth={1.8} />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full ps-10 pe-3.5 py-2.5 rounded-full border-2 border-pink-300 bg-white font-ui text-[15px] outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
