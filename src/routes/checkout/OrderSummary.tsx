import { Lock } from 'lucide-react';
import type { CartItem } from '@/types';
import { Tile } from '@/components/ui';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/cn';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number | null;
  total: number;
  compact?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  shippingFee,
  total,
  compact = false,
}: OrderSummaryProps) {
  return (
    <div
      className={cn(
        !compact && 'bg-white rounded-lg border border-warm-200 p-5 shadow-sm',
      )}
    >
      {!compact && (
        <div className="font-bold text-[15px] text-ink-900 mb-4">Order summary</div>
      )}

      <div className="flex flex-col gap-3 mb-4">
        {items.map((it, i) => {
          const mainImage = it.images?.[0]?.url;
          return (
            <div key={`${it.id}-${it.size}-${i}`} className="flex gap-3 items-start">
              <div className="relative w-14 h-[70px] rounded-md overflow-hidden flex-none bg-warm-100">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={it.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Tile fontSize={10} />
                )}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink-700 text-white text-[11px] font-bold grid place-items-center">
                  {it.cartQty}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 text-[13px] leading-snug truncate">
                  {it.name}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {it.size && <span>Size: {it.size}</span>}
                  {it.color && <span>Color: {it.color}</span>}
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5">{it.price}</div>
              </div>
              <div className="font-bold text-ink-900 text-[13px] flex-none pt-0.5">
                {fmt(it.priceN * it.cartQty)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-warm-300 pt-3.5 flex flex-col gap-2">
        <div className="flex justify-between text-[13px] text-ink-500">
          <span>Subtotal</span>
          <span className="text-ink-900 font-semibold">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-ink-500">
          <span>Shipping</span>
          <span className="font-semibold text-ink-900">
            {shippingFee === null ? (
              <span className="text-ink-400 italic text-xs">Select wilaya & type</span>
            ) : (
              fmt(shippingFee)
            )}
          </span>
        </div>
        <div className="flex justify-between pt-2.5 border-t border-warm-200 font-bold text-ink-900 text-base">
          <span>Total</span>
          <span className="text-pink-600">{fmt(total)}</span>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex gap-2 items-center justify-center text-ink-400 text-xs">
          <Lock size={13} strokeWidth={2} />
          Secure checkout · SSL encrypted
        </div>
      )}
    </div>
  );
}
