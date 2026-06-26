/** Parse a display price like "8 900 DA" into a number (8900). */
export const parsePrice = (s: string): number =>
  parseInt(s.replace(/\D/g, ''), 10) || 0;

/** Format a number as Algerian dinar, fr-FR grouped: 8900 → "8 900 DA". */
export const fmt = (n: number): string => `${n.toLocaleString('fr-FR')} DA`;
