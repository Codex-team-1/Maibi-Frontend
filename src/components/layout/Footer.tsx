import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/cn';

const COLS: Array<[string, Array<{ label: string; to: string }>]> = [
  [
    'Shop',
    [
      { label: 'New in', to: '/shop?filter=new' },
      { label: 'Dresses', to: '/shop?q=dress' },
      { label: 'Robes', to: '/shop?q=robe' },
      { label: 'Abayas', to: '/shop?q=abaya' },
    ],
  ],
  ['Services', [{ label: 'Custom order', to: '/custom-order' }]],
  [
    'My account',
    [
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'My bag', to: '/checkout' },
      { label: 'Checkout', to: '/checkout' },
    ],
  ],
];

export function Footer({ isMobile }: { isMobile: boolean }) {
  return (
    <footer
      className={cn(
        "bg-white border-t border-warm-200",
        isMobile ? "mt-8" : "mt-20",
      )}
    >
      <div
        className={cn(
          "max-w-[1240px] mx-auto grid gap-10",
          isMobile
            ? "px-5 pt-9 pb-25 grid-cols-2"
            : "px-8 pt-13 pb-10 grid-cols-[1.4fr_1fr_1fr_1fr]",
        )}
      >
        <div className={isMobile ? "col-span-full" : undefined}>
          <div className="font-script text-pink-400 text-4xl">Maibi</div>
          <p className="text-ink-500 text-[13px] leading-relaxed max-w-[240px]">
            Hand-embroidered, limited-edition clothing made with care by
            Algerian artisans.
          </p>
          <div className="flex gap-2 mt-3">
            {[
              {
                href: "https://www.instagram.com/maibi____",
                Icon: Instagram,
                label: "Instagram",
              },
              { href: "#", Icon: Facebook, label: "Facebook" },
            ].map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-md border-[1.5px] border-warm-200 grid place-items-center text-ink-500 no-underline transition-all hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500"
              >
                <Icon size={20} strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </div>

        {COLS.map(([heading, items]) => (
          <div key={heading}>
            <div className="font-bold text-ink-900 mb-3 text-xs tracking-[0.08em] uppercase">
              {heading}
            </div>
            <div className="flex flex-col gap-[9px]">
              {items.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-ink-500 text-[13px] no-underline text-left font-ui hover:text-pink-500 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-warm-300 px-8 py-4 text-center text-ink-400 text-xs">
        © 2026 Maibi · Made by{" "}
        <a
          href="https://www.instagram.com/craftx.team"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:underline"
        >
          CREAFTX
        </a>{" "}
        in Algeria
      </div>
    </footer>
  );
}
