import { useState, useRef, useEffect } from 'react';
import { Share2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n';
import { Button } from './Button';

interface ShareButtonProps {
  productId: number;
  productName: string;
  /** Formatted price string, e.g. "12 500 DA" */
  price: string;
  /** Absolute URL of the main product image */
  imageUrl?: string;
  /** Optional extra class on the trigger button */
  className?: string;
  size?: 'sm' | 'md';
}

interface Platform {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  href: (text: string, url: string) => string;
}

function buildShareUrl(productId: number): string {
  return `${window.location.origin}/product/${productId}`;
}

function buildShareText(name: string, price: string): string {
  return `✨ ${name} — ${price}`;
}

/* SVG brand icons — inline so there is no external dependency */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
    </svg>
  );
}

export function ShareButton({
  productId,
  productName,
  price,
  imageUrl,
  className,
  size = 'md',
}: ShareButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const shareUrl  = buildShareUrl(productId);
  const shareText = buildShareText(productName, price);

  const platforms: Platform[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      icon: <WhatsAppIcon />,
      href: (text, url) =>
        `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      id: 'messenger',
      label: 'Messenger',
      color: '#0099FF',
      icon: <MessengerIcon />,
      href: (_text, url) =>
        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      color: '#E1306C',
      icon: <InstagramIcon />,
      href: (_text, url) =>
        `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      color: '#010101',
      icon: <TikTokIcon />,
      href: (_text, url) =>
        `https://www.tiktok.com/share?url=${encodeURIComponent(url)}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select text via execCommand */
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: productName, text: shareText, url: shareUrl });
    } catch {
      /* user cancelled — no-op */
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="secondary"
        size={size === 'sm' ? 'sm' : 'md'}
        aria-label={t('share.shareProduct')}
        onClick={(e) => {
          e.stopPropagation();
          if (!navigator.share && window.innerWidth < 768) {
            handleNativeShare();
          } else {
            setOpen((v) => !v);
          }
        }}
        className={cn(' p-4! grid place-items-center', className)}
      >
        <Share2 size={18} />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop blur overlay — subtle */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            {/* Share panel */}
            <motion.div
              key="panel"
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('share.shareProduct')}
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ duration: 0.2, ease: [0.34, 1.2, 0.4, 1] }}
              className={cn(
                'absolute z-50 bottom-full mb-2.5',
                'end-0',
                'w-72 bg-white rounded-2xl shadow-lg border border-warm-100 overflow-hidden',
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-ui font-semibold text-ink-900 text-sm">
                  {t('share.shareProduct')}
                </span>
                <button
                  type="button"
                  aria-label={t('share.close')}
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-full bg-warm-100 grid place-items-center text-ink-500 hover:bg-warm-200 transition-colors cursor-pointer border-0"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Product preview strip */}
              <div className="mx-4 mb-3 flex items-center gap-2.5 bg-warm-50 rounded-xl px-3 py-2.5 border border-warm-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={productName}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-warm-200 flex items-center justify-center shrink-0">
                    <span className="font-script text-lg text-warm-300">M</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink-900 truncate leading-tight">
                    {productName}
                  </p>
                  <p className="text-xs text-pink-600 font-bold leading-tight mt-0.5">
                    {price}
                  </p>
                </div>
              </div>

              {/* Platform buttons */}
              <div className="px-4 pb-1 grid grid-cols-4 gap-2">
                {platforms.map((p) => (
                  <a
                    key={p.id}
                    href={p.href(shareText, shareUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setOpen(false), 300)}
                    className="flex flex-col items-center gap-1.5 group"
                    aria-label={t('share.shareTo', { platform: p.label })}
                  >
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-transform duration-150 group-hover:scale-105 group-active:scale-95"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.icon}
                    </span>
                    <span className="text-[10px] text-ink-500 font-ui font-medium leading-none text-center">
                      {p.label}
                    </span>
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-4 my-3 border-t border-warm-100" />

              {/* Copy link row */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2">
                  <span className="text-xs text-ink-400 truncate flex-1 font-ui select-all">
                    {shareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold font-ui transition-all duration-200 cursor-pointer border-0',
                      copied
                        ? 'bg-sage/15 text-sage'
                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100',
                    )}
                    aria-label={copied ? t('share.copied') : t('share.copyLink')}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> {t('share.copied')}
                      </span>
                    ) : (
                      t('share.copyLink')
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
