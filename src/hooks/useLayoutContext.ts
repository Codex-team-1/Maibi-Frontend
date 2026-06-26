import { useOutletContext } from 'react-router-dom';
import type { Responsive } from './useResponsive';

/** Typed accessor for the responsive context provided by RootLayout's Outlet. */
export function useLayoutContext(): Responsive {
  return useOutletContext<Responsive>();
}
