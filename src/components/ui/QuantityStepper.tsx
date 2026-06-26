import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

/** Quantity stepper for cart lines and the product page. */
export function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
}: QuantityStepperProps) {
  const set = (v: number) => onChange?.(Math.max(min, Math.min(max, v)));

  const btn =
    'w-8 h-8 rounded-full cursor-pointer border-2 border-pink-200 bg-white text-pink-600 grid place-items-center hover:bg-pink-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="inline-flex items-center gap-3 font-ui">
      <button
        type="button"
        className={btn}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label="decrease quantity"
      >
        <Minus size={15} strokeWidth={2.4} />
      </button>
      <span className="min-w-5 text-center font-semibold text-ink-900">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label="increase quantity"
      >
        <Plus size={15} strokeWidth={2.4} />
      </button>
    </div>
  );
}
