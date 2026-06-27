import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/cn';

const COLS: Array<[TranslationKey, Array<{ labelKey: TranslationKey; to: string }>]> = [
  [
    'footer.shop',
    [
      { labelKey: 'footer.newIn', to: '/shop?filter=new' },
      { labelKey: 'footer.dresses', to: '/shop?q=dress' },
      { labelKey: 'footer.robes', to: '/shop?q=robe' },
      { labelKey: 'footer.abayas', to: '/shop?q=abaya' },
    ],
  ],
  ['footer.services', [{ labelKey: 'footer.customOrder', to: '/custom-order' }]],
  [
    'footer.myAccount',
    [
      { labelKey: 'footer.wishlist', to: '/wishlist' },
      { labelKey: 'footer.myBag', to: '/checkout' },
      { labelKey: 'footer.checkout', to: '/checkout' },
    ],
  ],
];

export function Footer({ isMobile }: { isMobile: boolean }) {
  const { t } = useI18n();
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
            {t('footer.tagline')}
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

        {COLS.map(([headingKey, items]) => (
          <div key={headingKey}>
            <div className="font-bold text-ink-900 mb-3 text-xs tracking-[0.08em] uppercase">
              {t(headingKey)}
            </div>
            <div className="flex flex-col gap-[9px]">
              {items.map(({ labelKey, to }) => (
                <Link
                  key={labelKey}
                  to={to}
                  className="text-ink-500 text-[13px] no-underline text-start font-ui hover:text-pink-500 transition-colors"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-warm-300 px-8 py-4 text-center text-ink-400 text-xs">
        © 2026 Maibi · {t('footer.madeBy')}{" "}
        <a
          href="https://www.instagram.com/craftx.team"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:underline"
        >
          CREAFTX
        </a>{" "}
        {t('footer.inAlgeria')}
      </div>
    </footer>
  );
}
