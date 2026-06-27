import { Fragment, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react';
import type { PaymentMethodId } from '@/types';
import type { OrderDTO } from '@/api/types';
import { Button } from '@/components/ui';
import { useCart, selectSubtotal } from '@/store/useCart';
import { useConfig } from '@/store/useConfig';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useI18n, type TFn, type TranslationKey } from '@/i18n';

/** Resolve a zod error message that is stored as a translation key. */
const tErr = (t: TFn, msg?: string): string | undefined =>
  msg ? t(msg as TranslationKey) : undefined;
import { fmt } from '@/lib/format';
import { cn } from '@/lib/cn';
import { createOrder } from '@/api';
import { ApiError } from '@/lib/api';
import { OrderSummary } from './OrderSummary';
import {
  shippingSchema,
  type ShippingForm,
} from './schema';
import shippingRates from '@/data/world_express_shipping_rates.json';

type ShippingType = 'home' | 'desk';

const STEP_KEYS: TranslationKey[] = ['checkout.stepShipping', 'checkout.stepPayment', 'checkout.stepReview'];

/* Only COD is live; others are coming soon. */
const DISABLED_METHODS: PaymentMethodId[] = ['cib', 'dahabia', 'baridimob'];

const inputCls = (err?: boolean) =>
  cn(
    'font-ui text-[15px] text-ink-900 bg-white border-2 rounded-md px-3.5 py-3 outline-none w-full box-border transition-colors focus:border-pink-400',
    err ? 'border-rose-red' : 'border-warm-200',
  );

function getShippingFee(wilayaName: string, type: ShippingType): number | null {
  if (!wilayaName || !type) return null;
  const entry = shippingRates.wilayas.find(
    (w) => w.wilaya.toLowerCase() === wilayaName.toLowerCase(),
  );
  if (!entry) return null;
  return type === 'home'
    ? entry.tarif_domicile_sans_compte
    : entry.tarif_stop_desk_sans_compte; // JSON key stays as-is
}

export function Checkout() {
  const navigate = useNavigate();
  const { isMobile } = useLayoutContext();
  const { t } = useI18n();
  const { paymentMethods: PAYMENT_METHODS, wilayas: WILAYAS } = useConfig();

  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clearCart = useCart((s) => s.clear);

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingForm | null>(null);
  const [method, setMethod] = useState<PaymentMethodId>('cod');
  const [placing, setPlacing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderDTO | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);

  /* ── Real-time shipping fee derived from watched form fields ── */
  const shippingForm = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shipping ?? {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      wilaya: '',
      shippingType: 'home',
      notes: '',
    },
    mode: 'onTouched',
  });

  const watchedWilaya = shippingForm.watch('wilaya');
  const watchedShippingType = shippingForm.watch('shippingType') as ShippingType;

  const shippingFee = useMemo(
    () => getShippingFee(watchedWilaya, watchedShippingType),
    [watchedWilaya, watchedShippingType],
  );

  const total = subtotal + (shippingFee ?? 0);

  const selectedPayment =
    PAYMENT_METHODS.find((m) => m.id === method) ?? PAYMENT_METHODS[0];

  if (items.length === 0 && step !== 4) return <Navigate to="/shop" replace />;

  const onShippingValid = (data: ShippingForm) => {
    setShipping(data);
    setStep(2);
  };

  const goToReview = async () => {
    setStep(3);
  };

  const placeOrder = async () => {
    if (!shipping || shippingFee === null) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const order = await createOrder({
        items: items.map((it) => ({
          productId: it.id,
          qty: it.cartQty,
          size: it.size,
          color: it.color || undefined,
          price: it.priceN,
        })),
        shipping: {
          email: shipping.email,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          wilaya: shipping.wilaya,
          shippingType: shipping.shippingType,
          shippingFee,
          notes: shipping.notes || undefined,
        },
        payment: { method },
        total,
      });
      setPlacedOrder(order);
      setStep(4);
      clearCart();
    } catch (err) {
      if (err instanceof ApiError) {
        setPlaceError(
          err.code === 'CONFLICT'
            ? t('checkout.conflictError')
            : err.message,
        );
      } else {
        setPlaceError(t('checkout.placeError'));
      }
    } finally {
      setPlacing(false);
    }
  };

  /* ── Stepper ── */
  const Stepper = () => (
    <div className={cn('flex items-center justify-center', isMobile ? 'mb-7' : 'mb-9')}>
      {STEP_KEYS.map((sKey, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <Fragment key={sKey}>
            <div
              className={cn('flex flex-col items-center gap-1.5', done && 'cursor-pointer')}
              onClick={() => done && setStep(n)}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full grid place-items-center font-bold text-[13px] transition-all',
                  done || active ? 'bg-pink-400 text-white' : 'bg-warm-100 text-ink-400',
                  active && 'shadow-brand',
                )}
              >
                {done ? <Check size={14} strokeWidth={2.2} /> : n}
              </div>
              <span
                className={cn(
                  'text-[11px] font-semibold whitespace-nowrap',
                  done || active ? 'text-pink-600' : 'text-ink-400',
                )}
              >
                {t(sKey)}
              </span>
            </div>
            {i < STEP_KEYS.length - 1 && (
              <div
                className="h-0.5 mb-5.5 transition-colors"
                style={{
                  width: isMobile ? 40 : 72,
                  background: step > n ? 'var(--color-pink-300)' : 'var(--color-warm-200)',
                }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );

  const summary = (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      shippingFee={shippingFee}
      total={total}
    />
  );

  /* ── Step 4 — Success ── */
  if (step === 4 && placedOrder) {
    const o = placedOrder;
    const deliveryLabel = o.shippingType === 'home' ? t('checkout.homeDelivery') : t('checkout.stopDesk');
    const paymentLabel =
      PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.label ?? o.paymentMethod;
    const rows: [string, string][] = [
      [t('checkout.orderId'), o.id],
      [t('checkout.shippingTo'), [o.address, o.city, o.wilaya].filter(Boolean).join(', ')],
      [t('checkout.delivery').replace(/:$/, ''), deliveryLabel],
      [t('checkout.payment'), paymentLabel],
      ...(o.subtotal != null ? [[t('summary.subtotal'), fmt(o.subtotal)] as [string, string]] : []),
      ...(o.shippingFee != null ? [[t('checkout.shippingFee'), fmt(o.shippingFee)] as [string, string]] : []),
      [t('checkout.total'), fmt(o.total)],
    ];
    return (
      <main
        className={cn(
          'max-w-[560px] mx-auto text-center',
          isMobile ? 'px-5 pt-15 pb-25' : 'px-8 py-20',
        )}
      >
        <div className="w-20 h-20 rounded-full bg-pink-50 border-[3px] border-pink-300 grid place-items-center mx-auto mb-6 text-[34px]">
          ✶
        </div>
        <h1
          className={cn(
            'font-display font-semibold text-ink-900 mb-2.5',
            isMobile ? 'text-3xl' : 'text-[40px]',
          )}
        >
          {t('checkout.orderPlaced')}
        </h1>
        <p className="text-ink-700 text-[15px] leading-relaxed mb-2">
          {t('checkout.orderPlacedBody', { name: o.customer })}
        </p>
        <p className="text-ink-500 text-sm mb-7">
          {t('checkout.confirmationSent', { email: o.email })}
        </p>
        <div className="bg-pink-50 border-stitch rounded-lg px-5 py-4.5 mb-7 text-start">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="font-bold text-ink-900 text-sm">{t('checkout.orderNumber', { id: o.id })}</span>
            <span className="text-ink-500 text-xs">{t('checkout.expected')}</span>
          </div>
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2.5 text-[13px] py-0.5">
              <span className="text-ink-500 w-[100px] shrink-0">{k}</span>
              <span className="text-ink-900 font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate('/shop')} iconRight={<ArrowRight size={18} className="rtl:-scale-x-100" />}>
            {t('common.backToShop')}
          </Button>
          <Button variant="stitch" onClick={() => navigate('/wishlist')}>
            {t('checkout.viewWishlist')}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn(
        'max-w-[1100px] mx-auto',
        isMobile ? 'pt-5 pb-25' : 'px-8 pt-9 pb-20',
      )}
    >
      <button
        type="button"
        onClick={() => navigate('/')}
        className={cn(
          'border-0 bg-transparent cursor-pointer text-ink-500 text-sm flex items-center gap-1 mb-6',
          isMobile && 'px-4',
        )}
      >
        <ChevronLeft size={20} strokeWidth={1.8} className="rtl:-scale-x-100" /> {t('common.continueShopping')}
      </button>

      {/* Mobile order summary toggle */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-lg px-4 py-3.5 cursor-pointer mb-5 mx-4"
          style={{ width: 'calc(100% - 32px)' }}
        >
          <span className="flex items-center gap-2 font-semibold text-pink-700 text-sm">
            <ShoppingBag size={18} strokeWidth={1.8} /> {t(items.length === 1 ? 'checkout.summaryItemsOne' : 'checkout.summaryItemsMany', { count: items.length })}
          </span>
          <span className="flex items-center gap-2 font-bold text-pink-600">
            {fmt(total)}
            {summaryOpen ? (
              <ChevronUp size={14} strokeWidth={2.5} />
            ) : (
              <ChevronDown size={14} strokeWidth={2.5} />
            )}
          </span>
        </button>
      )}
      {isMobile && summaryOpen && <div className="px-4 mb-5">{summary}</div>}

      <div
        className={cn(
          'grid items-start',
          isMobile ? 'grid-cols-1 gap-0 px-4' : 'grid-cols-[1fr_380px] gap-12',
        )}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-7 flex-wrap">
            <div className="font-script text-pink-400 text-[26px] leading-none">Maibi</div>
            <div className="w-px h-5 bg-warm-200" />
            <div className="font-display text-lg font-semibold text-ink-900">{t('checkout.title')}</div>
          </div>

          <Stepper />

          {/* ── Step 1 — Shipping ── */}
          {step === 1 && (
            <form
              onSubmit={shippingForm.handleSubmit(onShippingValid)}
              className="flex flex-col"
              noValidate
            >
              <SectionHeading icon={<User size={18} />}>{t('checkout.contact')}</SectionHeading>
              <div className="grid gap-3.5 mb-6">
                <FieldText
                  label={t('checkout.emailAddress')}
                  required
                  type="email"
                  placeholder="you@example.com"
                  error={tErr(t, shippingForm.formState.errors.email?.message)}
                  {...shippingForm.register('email')}
                />
                <div
                  className={cn('grid gap-3.5', isMobile ? 'grid-cols-1' : 'grid-cols-2')}
                >
                  <FieldText
                    label={t('checkout.firstName')}
                    required
                    placeholder="Yasmine"
                    error={tErr(t, shippingForm.formState.errors.firstName?.message)}
                    {...shippingForm.register('firstName')}
                  />
                  <FieldText
                    label={t('checkout.lastName')}
                    required
                    placeholder="Benali"
                    error={tErr(t, shippingForm.formState.errors.lastName?.message)}
                    {...shippingForm.register('lastName')}
                  />
                </div>
                <FieldText
                  label={t('checkout.phoneWhatsapp')}
                  required
                  type="tel"
                  placeholder="+213 6XX XXX XXX"
                  error={tErr(t, shippingForm.formState.errors.phone?.message)}
                  {...shippingForm.register('phone')}
                />
              </div>

              <SectionHeading icon={<MapPin size={18} />}>{t('checkout.shippingAddress')}</SectionHeading>
              <div className="grid gap-3.5 mb-6">
                <FieldText
                  label={t('checkout.streetAddress')}
                  required
                  placeholder="12 Rue Didouche Mourad"
                  error={tErr(t, shippingForm.formState.errors.address?.message)}
                  {...shippingForm.register('address')}
                />
                <div
                  className={cn('grid gap-3.5', isMobile ? 'grid-cols-1' : 'grid-cols-2')}
                >
                  <FieldText
                    label={t('checkout.city')}
                    required
                    placeholder="Alger Centre"
                    error={tErr(t, shippingForm.formState.errors.city?.message)}
                    {...shippingForm.register('city')}
                  />
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel required>{t('checkout.wilaya')}</FieldLabel>
                    <select
                      className={cn(
                        inputCls(!!shippingForm.formState.errors.wilaya),
                        'cursor-pointer',
                      )}
                      defaultValue=""
                      {...shippingForm.register('wilaya')}
                    >
                      <option value="">{t('checkout.selectWilaya')}</option>
                      {WILAYAS.map((w, i) => (
                        <option key={w} value={w}>
                          {String(i + 1).padStart(2, '0')} — {w}
                        </option>
                      ))}
                    </select>
                    {shippingForm.formState.errors.wilaya && (
                      <span className="text-xs text-rose-red">
                        {tErr(t, shippingForm.formState.errors.wilaya.message)}
                      </span>
                    )}
                  </div>
                </div>
                <FieldText
                  label={t('checkout.deliveryNotes')}
                  placeholder={t('checkout.deliveryNotesPlaceholder')}
                  {...shippingForm.register('notes')}
                />
              </div>

              <SectionHeading icon={<Package size={18} />}>{t('checkout.deliveryType')}</SectionHeading>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(
                  [
                    {
                      value: 'home' as ShippingType,
                      label: t('checkout.homeDelivery'),
                      sub: t('checkout.homeDeliverySub'),
                      icon: '🏠',
                    },
                    {
                      value: 'desk' as ShippingType,
                      label: t('checkout.stopDesk'),
                      sub: t('checkout.stopDeskSub'),
                      icon: '📦',
                    },
                  ] as const
                ).map((opt) => {
                  const fee = getShippingFee(watchedWilaya, opt.value);
                  const selected = watchedShippingType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex flex-col gap-1 px-4 py-3.5 rounded-lg border-2 cursor-pointer transition-all',
                        selected
                          ? 'border-pink-400 bg-pink-50'
                          : 'border-warm-200 bg-white',
                      )}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        className="sr-only"
                        checked={watchedShippingType === opt.value}
                        onChange={() =>
                          shippingForm.setValue('shippingType', opt.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{opt.icon}</span>
                        <span
                          className={cn(
                            'w-4 h-4 rounded-full border-2 grid place-items-center',
                            selected ? 'border-pink-400 bg-pink-400' : 'border-warm-300',
                          )}
                        >
                          {selected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <div className="font-bold text-ink-900 text-sm mt-1">{opt.label}</div>
                      <div className="text-[11px] text-ink-500">{opt.sub}</div>
                      <div className="font-bold text-pink-600 text-[13px] mt-1">
                        {fee !== null ? fmt(fee) : watchedWilaya ? '—' : t('checkout.selectWilayaShort')}
                      </div>
                    </label>
                  );
                })}
              </div>
              {shippingForm.formState.errors.shippingType && (
                <span className="text-xs text-rose-red -mt-4 mb-4">
                  {tErr(t, shippingForm.formState.errors.shippingType.message)}
                </span>
              )}

              <div className="flex justify-end mt-2">
                <Button type="submit" size="lg" iconRight={<ArrowRight size={18} className="rtl:-scale-x-100" />}>
                  {t('checkout.continueToPayment')}
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 2 — Payment ── */}
          {step === 2 && (
            <div className="flex flex-col">
              <SectionHeading icon={<CreditCard size={18} />}>
                {t('checkout.paymentMethod')}
              </SectionHeading>
              <div className="flex flex-col gap-2.5 mb-6">
                {PAYMENT_METHODS.map((m) => {
                  const disabled = DISABLED_METHODS.includes(m.id);
                  const selected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setMethod(m.id)}
                      className={cn(
                        'flex items-center gap-3.5 px-4.5 py-4 rounded-lg border-2 text-left transition-all w-full',
                        disabled
                          ? 'border-warm-100 bg-warm-50 opacity-60 cursor-not-allowed'
                          : selected
                          ? 'border-pink-400 bg-pink-50 cursor-pointer'
                          : 'border-warm-200 bg-white cursor-pointer',
                      )}
                    >
                      <div
                        className={cn(
                          'w-[42px] h-[42px] rounded-md grid place-items-center text-xl flex-none',
                          selected && !disabled ? 'bg-pink-100' : 'bg-warm-100',
                        )}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-ink-900 text-sm flex items-center gap-2">
                          {m.label}
                          {disabled ? (
                            <span className="bg-warm-200 text-ink-400 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-[0.06em]">
                              {t('checkout.comingSoon')}
                            </span>
                          ) : m.badge ? (
                            <span className="bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-[0.06em]">
                              {m.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5">{m.sub}</div>
                      </div>
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full border-2 grid place-items-center flex-none',
                          selected && !disabled
                            ? 'border-pink-400 bg-pink-400'
                            : 'border-warm-300',
                        )}
                      >
                        {selected && !disabled && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-between mt-2">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  iconLeft={<ChevronLeft size={18} className="rtl:-scale-x-100" />}
                >
                  {t('common.back')}
                </Button>
                <Button size="lg" iconRight={<ArrowRight size={18} className="rtl:-scale-x-100" />} onClick={goToReview}>
                  {t('checkout.reviewOrder')}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 — Review ── */}
          {step === 3 && shipping && (
            <div className="flex flex-col gap-4.5">
              <ReviewBlock
                icon={<MapPin size={15} />}
                title={t('checkout.shippingTo')}
                onEdit={() => setStep(1)}
                editLabel={t('common.edit')}
              >
                <div className="font-semibold text-ink-900">
                  {shipping.firstName} {shipping.lastName}
                </div>
                <div>{shipping.address}</div>
                <div>
                  {shipping.city}, {shipping.wilaya}
                </div>
                <div>{shipping.phone}</div>
                <div className="mt-1 text-[13px]">
                  <span className="text-ink-500">{t('checkout.delivery')} </span>
                  <span className="font-semibold text-ink-900">
                    {shipping.shippingType === 'home' ? t('checkout.homeDelivery') : t('checkout.stopDesk')}
                  </span>
                  {shippingFee !== null && (
                    <span className="text-pink-600 font-bold ms-1.5">· {fmt(shippingFee)}</span>
                  )}
                </div>
                {shipping.notes && (
                  <div className="text-ink-500 text-[13px] mt-1">{t('checkout.note', { note: shipping.notes })}</div>
                )}
              </ReviewBlock>

              <ReviewBlock
                icon={<CreditCard size={15} />}
                title={t('checkout.payment')}
                onEdit={() => setStep(2)}
                editLabel={t('common.edit')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[22px]">{selectedPayment.icon}</span>
                  <div>
                    <div className="font-semibold text-ink-900 text-sm">
                      {selectedPayment.label}
                    </div>
                    <div className="text-[13px] text-ink-500">{selectedPayment.sub}</div>
                  </div>
                </div>
              </ReviewBlock>

              <div className="text-xs text-ink-500 leading-relaxed text-center px-2">
                {t('checkout.termsPrefix')}{' '}
                <a href="#" className="text-pink-600">
                  {t('checkout.terms')}
                </a>{' '}
                {t('checkout.and')}{' '}
                <a href="#" className="text-pink-600">
                  {t('checkout.privacyPolicy')}
                </a>
                {t('checkout.termsSuffix')}
              </div>
              {placeError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-red rounded-lg px-4 py-3 text-sm">
                  {placeError}
                </div>
              )}
              <div className="flex gap-3 justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                  iconLeft={<ChevronLeft size={18} className="rtl:-scale-x-100" />}
                >
                  {t('common.back')}
                </Button>
                <Button
                  full
                  size="lg"
                  onClick={placeOrder}
                  disabled={placing || shippingFee === null}
                >
                  {placing ? (
                    <span className="flex items-center gap-2.5">
                      <Loader2 size={18} className="animate-[spin_0.7s_linear_infinite]" />{' '}
                      {t('checkout.placingOrder')}
                    </span>
                  ) : (
                    t('checkout.placeOrder', { total: fmt(total) })
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop order summary */}
        {!isMobile && <div className="sticky top-23">{summary}</div>}
      </div>
    </main>
  );
}

/* ── Small presentational helpers ─────────────────────────────────────────── */
function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="font-bold text-[15px] text-ink-900 mb-4 flex items-center gap-2">
      <span className="text-pink-500 flex">{icon}</span>
      {children}
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="font-semibold text-[13px] text-ink-700 flex gap-1">
      {children}
      {required && <span className="text-pink-500">*</span>}
    </label>
  );
}

interface FieldTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

const FieldText = ({ label, required, error, ...rest }: FieldTextProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input className={inputCls(!!error)} {...rest} />
      {error && <span className="text-xs text-rose-red">{error}</span>}
    </div>
  );
};

function ReviewBlock({
  icon,
  title,
  onEdit,
  editLabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-warm-200 bg-warm-50">
        <span className="font-bold text-[13px] text-ink-900 flex items-center gap-[7px]">
          <span className="text-pink-500 flex">{icon}</span>
          {title}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="border-0 bg-transparent text-pink-600 font-semibold text-xs cursor-pointer"
        >
          {editLabel}
        </button>
      </div>
      <div className="px-4.5 py-3.5 text-sm leading-[1.7] text-ink-700">{children}</div>
    </div>
  );
}
