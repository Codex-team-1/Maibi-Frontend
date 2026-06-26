import { useEffect, useState } from 'react';

export interface Responsive {
  isMobile: boolean;
  isTablet: boolean;
  w: number;
}

/** Tracks viewport width with the prototype's breakpoints:
 *  mobile < 768, tablet < 1024. */
export function useResponsive(): Responsive {
  const [w, setW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return { isMobile: w < 768, isTablet: w < 1024, w };
}
