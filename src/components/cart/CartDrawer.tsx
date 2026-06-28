import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Card, QuantityStepper } from '@/components/ui';
import { useCart, selectSubtotal } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { useI18n } from '@/i18n';
import { fmt } from '@/lib/format';

export function CartDrawer({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, dir } = useI18n();
  const open = useUI((s) => s.cartOpen);
  const closeCart = useUI((s) => s.closeCart);

  // Close whenever the user navigates to a different page
  useEffect(() => {
    closeCart();
  }, [pathname]);

  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectSubtotal);

  // Slide in from the inline-end edge so the drawer mirrors under RTL.
  const offscreen = dir === 'rtl' ? '-100%' : '100%';

  const checkout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink-900/35 z-40"
          />
          <motion.aside
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed top-0 end-0 bottom-0 z-41 bg-warm-50 shadow-lg flex flex-col max-w-screen"
            style={{ width: isMobile ? '100vw' : 420 }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-warm-200">
              <span className="font-display text-[22px] font-semibold text-ink-900">
                {t('cart.title')}
              </span>
              <button
                type="button"
                aria-label={t('cart.closeCart')}
                onClick={closeCart}
                className="border-0 bg-transparent cursor-pointer flex text-ink-500"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 && (
                <div className="text-center py-20 text-ink-500">
                  <div className="font-script text-4xl text-pink-300">Maibi</div>
                  <p>{t('cart.empty')}</p>
                </div>
              )}

              {items.map((it, i) => (
                <Card
                  key={`${it.id}-${it.size}-${i}`}
                  className="flex gap-3 mb-2.5 p-3"
                >
                  <div className="relative w-[66px] h-21 rounded-md overflow-hidden flex-none bg-warm-100 flex items-center justify-center">
                    {it.images?.[0]?.url
                      ? <img src={it.images[0].url} alt={it.name} className="w-full h-full object-cover" />
                      : <span className="font-script text-lg text-warm-300">M</span>
                    }
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between">
                      <div className="font-semibold text-ink-900 text-sm truncate max-w-[150px]">
                        {it.name}
                      </div>
                      <button
                        type="button"
                        aria-label={t('cart.removeItem')}
                        onClick={() => remove(i)}
                        className="border-0 bg-transparent flex text-ink-400 cursor-pointer p-0 flex-none"
                      >
                        <X size={18} strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="text-xs text-ink-500">
                      {it.size && <span>{t('cart.size', { size: it.size })}</span>}
                      {it.size && it.color && <span className="mx-1">·</span>}
                      {it.color && <span>{it.color}</span>}
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <QuantityStepper
                        value={it.cartQty}
                        onChange={(v) => setQty(i, v)}
                      />
                      <span className="font-bold text-pink-600 text-sm">
                        {fmt(it.priceN * it.cartQty)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {items.length > 0 && (
              <div
                className="px-5 pt-4 border-t border-warm-200"
                style={{ paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : '24px' }}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-ink-500">{t('cart.subtotal')}</span>
                  <span className="font-bold text-xl text-ink-900">
                    {fmt(subtotal)}
                  </span>
                </div>
                <div className="text-xs text-ink-400 mb-3">
                  {t('cart.shippingAtCheckout')}
                </div>
                <Button full size="lg" onClick={checkout}>
                  {t('cart.checkout')}
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
