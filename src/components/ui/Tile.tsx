

interface TileProps {
  /** Script "Maibi" size in px; pass 0 to hide the wordmark. */
  fontSize?: number;
  className?: string;
}

/**
 * Gradient placeholder for product imagery — a two-stop gradient with the
 * script "Maibi" wordmark. Stands in until real photos are wired into
 * `Product.image`.
 */
export function Tile({ fontSize = 36, className }: TileProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(150deg, #f0f0f0, #d0d0d0)`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {fontSize > 0 && (
        <span
          className="font-script select-none"
          style={{
            color: 'rgba(255,255,255,.88)',
            fontSize,
            textShadow: '0 2px 12px rgba(0,0,0,.14)',
          }}
        >
          Maibi
        </span>
      )}
    </div>
  );
}
