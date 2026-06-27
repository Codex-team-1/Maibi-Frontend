import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, MapPin, MessageSquare, Star, User, X } from 'lucide-react';
import { Button, Input, StarRating } from '@/components/ui';
import { useConfig } from '@/store/useConfig';
import { createReview } from '@/api';
import { ApiError } from '@/lib/api';
import { useI18n, type TFn, type TranslationKey } from '@/i18n';
import { ratingSchema, type RatingForm } from './rating/schema';

/** Resolve a zod error message that is stored as a translation key. */
const tErr = (t: TFn, msg?: string): string | undefined =>
  msg ? t(msg as TranslationKey) : undefined;

export function Rating() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderCode = params.get('order') ?? undefined;
  const { wilayas } = useConfig();
  const { t } = useI18n();

  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RatingForm>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { name: '', wilaya: '', rating: 0, comment: '' },
    mode: 'onTouched',
  });

  const close = () => navigate('/');

  const onSubmit = async (data: RatingForm) => {
    setServerError(null);
    try {
      await createReview({
        name: data.name,
        wilaya: data.wilaya,
        rating: data.rating,
        comment: data.comment,
        ...(orderCode ? { orderCode } : {}),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : t('rating.genericError'),
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        onClick={close}
        className="fixed inset-0 z-[100] bg-ink-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[460px] my-auto bg-white rounded-[22px] shadow-md overflow-hidden"
        >
          {/* Close */}
          <button
            type="button"
            aria-label={t('rating.close')}
            onClick={close}
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink-500 transition-colors hover:bg-warm-100 hover:text-ink-900 cursor-pointer"
          >
            <X size={18} strokeWidth={2} />
          </button>

          {submitted ? (
            <SuccessView onClose={close} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-br from-pink-400 to-pink-600 px-7 pb-10 pt-9 text-center text-white">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/20">
                  <Star size={28} strokeWidth={2} fill="white" />
                </div>
                <h1 className="font-display text-3xl font-semibold leading-tight">
                  {t('rating.title')}
                </h1>
                <p className="mx-auto mt-1.5 max-w-[320px] text-sm text-white/90">
                  {t('rating.subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-5 px-7 py-7 -mt-4 rounded-t-[22px] bg-white relative z-[1]">
                {/* Stars */}
                <div className="flex flex-col items-center gap-1.5">
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <StarRating value={field.value} onChange={field.onChange} />
                    )}
                  />
                  {errors.rating && (
                    <span className="text-xs text-rose-red">{tErr(t, errors.rating.message)}</span>
                  )}
                </div>

                <Input
                  label={t('rating.fullName')}
                  placeholder={t('rating.fullNamePlaceholder')}
                  iconLeft={<User size={17} strokeWidth={1.9} />}
                  error={tErr(t, errors.name?.message)}
                  {...register('name')}
                />

                {/* Wilaya */}
                <label className="flex w-full flex-col gap-1.5 font-ui">
                  <span className="text-sm font-semibold text-ink-700">{t('rating.wilaya')}</span>
                  <div className="relative flex items-center">
                    <span className="absolute start-3.5 flex text-ink-400">
                      <MapPin size={17} strokeWidth={1.9} />
                    </span>
                    <select
                      className={`w-full box-border appearance-none rounded-md border-2 bg-white py-3 ps-10 pe-4 font-ui text-base text-ink-900 outline-none transition-[border-color,box-shadow] focus:border-pink-400 focus:shadow-[0_0_0_4px_var(--color-pink-50)] ${
                        errors.wilaya ? 'border-rose-red' : 'border-warm-200'
                      }`}
                      defaultValue=""
                      {...register('wilaya')}
                    >
                      <option value="" disabled>
                        {t('rating.selectWilaya')}
                      </option>
                      {wilayas.map((w, i) => (
                        <option key={w} value={w}>
                          {String(i + 1).padStart(2, '0')} — {w}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.wilaya && (
                    <span className="text-xs text-rose-red">{tErr(t, errors.wilaya.message)}</span>
                  )}
                </label>

                {/* Comment */}
                <label className="flex w-full flex-col gap-1.5 font-ui">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                    <MessageSquare size={15} strokeWidth={1.9} />
                    {t('rating.yourReview')}
                  </span>
                  <textarea
                    rows={4}
                    placeholder={t('rating.reviewPlaceholder')}
                    className={`w-full box-border resize-none rounded-md border-2 bg-white px-4 py-3 font-ui text-base text-ink-900 outline-none transition-[border-color,box-shadow] focus:border-pink-400 focus:shadow-[0_0_0_4px_var(--color-pink-50)] ${
                      errors.comment ? 'border-rose-red' : 'border-warm-200'
                    }`}
                    {...register('comment')}
                  />
                  {errors.comment && (
                    <span className="text-xs text-rose-red">{tErr(t, errors.comment.message)}</span>
                  )}
                </label>

                {serverError && (
                  <div className="rounded-md border border-rose-red/30 bg-rose-red/8 px-4 py-2.5 text-sm text-rose-red">
                    {serverError}
                  </div>
                )}

                <Button type="submit" full size="lg" disabled={isSubmitting}>
                  {isSubmitting ? t('rating.submitting') : t('rating.submit')}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-sage/15 text-sage"
      >
        <CheckCircle2 size={48} strokeWidth={1.8} />
      </motion.div>
      <h1 className="font-display text-3xl font-semibold text-ink-900">{t('rating.thankYou')}</h1>
      <p className="max-w-[320px] text-[15px] leading-relaxed text-ink-700">
        {t('rating.thankYouBody')}
      </p>
      <Button size="lg" onClick={onClose} className="mt-2">
        {t('common.backToStore')}
      </Button>
    </div>
  );
}
