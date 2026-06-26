import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useResponsive } from '@/hooks/useResponsive';

/** Scrolls to the top whenever the route changes. */
function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

export function RootLayout() {
  const { isMobile, isTablet, w } = useResponsive();
  const location = useLocation();
  useScrollToTop();

  return (
    <div className="min-h-screen flex flex-col">
      <Header isMobile={isMobile} />

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Pass responsive context to routes via Outlet context. */}
            <Outlet context={{ isMobile, isTablet, w }} />
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer isMobile={isMobile} />
      <CartDrawer isMobile={isMobile} />
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
