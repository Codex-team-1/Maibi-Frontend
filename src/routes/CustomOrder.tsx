import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, Info, Upload } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { useConfig } from '@/store/useConfig';
import { createCustomOrder } from '@/api';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

const STEPS = ['Your photo', 'Size & color', 'Contact'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Custom fit'];
const GARMENT_TYPES = [
  'Robe de soirée',
  'Kaftan',
  'Burnous',
  'Qamis',
  'Set (haut + bas)',
  'Abaya',
  'Tailleur',
  'Robe de mariée',
  'Jellaba',
  'Autre',
];

const inputCls =
  'font-ui text-[15px] text-ink-900 bg-white border-2 border-warm-200 rounded-md px-3.5 py-3 outline-none w-full box-border transition-colors focus:border-pink-400';

export function CustomOrder() {
  const navigate = useNavigate();
  const { isMobile } = useLayoutContext();
  const { colors: COLOR_PALETTE, wilayas } = useConfig();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [garmentType, setGarmentType] = useState('');
  const [budget, setBudget] = useState('');
  const [size, setSize] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', wilaya: '' });
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleColor = (name: string) =>
    setColors((c) =>
      c.includes(name)
        ? c.filter((x) => x !== name)
        : c.length < 3
          ? [...c, name]
          : c,
    );

  const hexOf = (name: string) =>
    COLOR_PALETTE.find((c) => c.name === name)?.hex ?? '#ccc';

  const handleFile = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoFile(file);
    setPhotoURL(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoURL(null);
  };

  const canNext1 = notes.trim().length > 0 && garmentType.trim().length > 0;
  const canNext2 =
    Boolean(size) &&
    colors.length > 0 &&
    (size !== 'Custom fit' || customSize.trim().length > 0);
  const canSubmit =
    Boolean(contact.name) && Boolean(contact.email) && Boolean(contact.wilaya);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append('customer', contact.name);
      form.append('email', contact.email);
      form.append('phone', contact.phone);
      form.append('wilaya', contact.wilaya);
      form.append('garmentType', garmentType);
      form.append('size', size === 'Custom fit' ? `Custom: ${customSize.trim()}` : size);
      form.append('notes', notes);
      if (budget) form.append('budget', `${budget} DA`);
      // Backend accepts a JSON-encoded color array.
      form.append('colors', JSON.stringify(colors));
      if (photoFile) form.append('referenceImage', photoFile);

      await createCustomOrder(form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Could not send your request. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Stepper = () => (
    <div
      className={cn(
        'flex items-center justify-center',
        isMobile ? 'mb-7' : 'mb-9',
      )}
    >
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <Fragment key={s}>
            <div
              className={cn('flex flex-col items-center gap-1.5', done && 'cursor-pointer')}
              onClick={() => done && setStep(n)}
            >
              <div
                className={cn(
                  'w-[34px] h-[34px] rounded-full grid place-items-center font-bold text-[13px] transition-all',
                  done || active
                    ? 'bg-pink-400 text-white'
                    : 'bg-warm-100 text-ink-400',
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
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 mb-5 transition-colors"
                style={{
                  width: isMobile ? 44 : 80,
                  background:
                    step > n ? 'var(--color-pink-300)' : 'var(--color-warm-200)',
                }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );

  if (submitted) {
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
          Request received!
        </h1>
        <p className="text-ink-700 text-[15px] leading-relaxed mb-7">
          Thank you, <strong>{contact.name}</strong>. Our artisans will review your
          request and reach out within 48 hours at <strong>{contact.email}</strong>.
        </p>
        {photoURL && (
          <div className="w-30 h-[150px] rounded-lg overflow-hidden mx-auto mb-5 border-[3px] border-pink-200">
            <img src={photoURL} alt="Your reference" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="bg-pink-50 border-stitch rounded-lg px-5 py-4.5 mb-7 text-left">
          {(
            [
              ['Size', size],
              ['Colors', colors.join(', ')],
              ['Notes', notes.slice(0, 60) + (notes.length > 60 ? '…' : '')],
            ] as const
          )
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-2.5 text-sm py-0.5">
                <span className="text-ink-500 w-15">{k}</span>
                <span className="text-ink-900 font-semibold">{v}</span>
              </div>
            ))}
        </div>
        <Button onClick={() => navigate('/')} iconRight={<ArrowRight size={18} />}>
          Back to shop
        </Button>
      </main>
    );
  }

  return (
    <main
      className={cn(
        'max-w-[680px] mx-auto',
        isMobile ? 'px-4 pt-5 pb-25' : 'px-8 pt-10 pb-20',
      )}
    >
      <button
        type="button"
        onClick={() => navigate('/')}
        className="border-0 bg-transparent cursor-pointer text-ink-500 text-sm flex items-center gap-1 mb-7"
      >
        <ChevronLeft size={20} strokeWidth={1.8} /> Back to home
      </button>

      <div className="text-center mb-9">
        <Badge variant="gold">Bespoke service</Badge>
        <h1
          className={cn(
            'font-display font-semibold text-ink-900 mt-2.5 mb-2',
            isMobile ? 'text-3xl' : 'text-[42px]',
          )}
        >
          Custom order
        </h1>
        <p
          className={cn(
            'text-ink-500 max-w-[440px] mx-auto',
            isMobile ? 'text-sm' : 'text-base',
          )}
        >
          Share your vision — our artisans will craft a one-of-a-kind piece just for
          you.
        </p>
      </div>

      <Stepper />

      {/* Step 1 — Photo + notes */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-bold text-[15px] text-ink-900 mb-2">
              Upload a reference photo
            </div>
            <p className="text-ink-500 text-[13px] m-0 mb-3.5">
              A photo of something you love — a dress, embroidery detail, colour
              palette, or outfit inspiration.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {!photoURL ? (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  'border-2 border-dashed rounded-xl text-center cursor-pointer transition-all',
                  isMobile ? 'px-5 py-10' : 'px-10 py-14',
                  dragging ? 'border-pink-400 bg-pink-50' : 'border-pink-200 bg-warm-50',
                )}
              >
                <div className="w-14 h-14 rounded-full bg-pink-100 grid place-items-center mx-auto mb-4 text-pink-500">
                  <Upload size={24} strokeWidth={1.8} />
                </div>
                <div className="font-bold text-ink-900 mb-1.5">Drop your photo here</div>
                <div className="text-[13px] text-ink-500 mb-3.5">
                  or click to browse · JPG, PNG up to 10MB
                </div>
                <Button size="sm" variant="secondary">
                  Choose photo
                </Button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-warm-50 border-2 border-pink-200">
                <img
                  src={photoURL}
                  alt="Your reference"
                  className="w-full max-h-80 object-cover block"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="bg-white/90 border-0 rounded-full px-3.5 py-2 cursor-pointer font-ui font-semibold text-[13px] text-ink-700 backdrop-blur-sm"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="bg-white/90 border-0 rounded-full px-3.5 py-2 cursor-pointer font-ui font-semibold text-[13px] text-rose-red backdrop-blur-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="soft">Photo uploaded</Badge>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="font-bold text-[15px] text-ink-900 mb-1.5">
              Describe what you have in mind <span className="text-pink-500">*</span>
            </div>
            <p className="text-ink-500 text-[13px] m-0 mb-2.5">
              Tell us about the piece — occasion, style, details you love, what to keep
              or change from the photo.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="e.g. I love the embroidery on the sleeves in this photo. I'd like a similar style in ivory with gold thread, for a summer wedding in Constantine. The neckline can be different — something more open..."
              className={cn(inputCls, 'resize-y leading-[1.65]')}
            />
            <div className="flex justify-end mt-1">
              <span
                className={cn(
                  'text-xs',
                  notes.length > 20 ? 'text-sage' : 'text-ink-400',
                )}
              >
                {notes.length} characters
              </span>
            </div>
          </div>

          <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            <div>
              <div className="font-bold text-[15px] text-ink-900 mb-1.5">
                Garment type <span className="text-pink-500">*</span>
              </div>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className={cn(inputCls, 'cursor-pointer appearance-none bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 fill%3D%22none%22 viewBox%3D%220 0 20 20%22%3E%3Cpath stroke%3D%22%236b7280%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22 stroke-width%3D%221.5%22 d%3D%22m6 8 4 4 4-4%22%2F%3E%3C%2Fsvg%3E\')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem] pr-10')}
              >
                <option value="">Select a garment type…</option>
                {GARMENT_TYPES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="font-bold text-[15px] text-ink-900 mb-1.5">
                Budget{' '}
                <span className="text-xs text-ink-400 font-normal">— optional</span>
              </div>
              <div className="relative">
                <input
                  value={budget}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setBudget(raw ? Number(raw).toLocaleString('fr-DZ') : '');
                  }}
                  placeholder="0"
                  inputMode="numeric"
                  className={cn(inputCls, 'pr-14 text-right tabular-nums')}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-ink-400 select-none">
                  DA
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              iconRight={<ArrowRight size={18} />}
              onClick={() => setStep(2)}
              disabled={!canNext1}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Size & colors */}
      {step === 2 && (
        <div className="flex flex-col gap-7">
          <div>
            <div className="font-bold text-[15px] text-ink-900 mb-1.5">
              Your size <span className="text-pink-500">*</span>
            </div>
            <p className="text-ink-500 text-[13px] m-0 mb-3">
              We'll confirm measurements over WhatsApp after your request.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    'rounded-md border-2 cursor-pointer font-bold text-sm transition-all font-ui',
                    s === 'Custom fit' ? 'px-5 py-[11px]' : 'w-15 py-[11px]',
                    size === s
                      ? 'border-pink-400 bg-pink-50 text-pink-600 shadow-brand'
                      : 'border-warm-200 bg-white text-ink-700',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {size === 'Custom fit' && (
              <div className="mt-3.5">
                <div className="text-[13px] font-semibold text-ink-700 mb-1.5">
                  Enter your measurements <span className="text-pink-500">*</span>
                </div>
                <textarea
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  rows={3}
                  placeholder="e.g. Bust: 92cm, Waist: 74cm, Hips: 100cm, Height: 168cm — add any relevant details"
                  className={cn(inputCls, 'resize-y leading-[1.65] text-sm')}
                />
              </div>
            )}
          </div>

          <div>
            <div className="font-bold text-[15px] text-ink-900 mb-1">
              Colour palette <span className="text-pink-500">*</span>
            </div>
            <p className="text-ink-500 text-[13px] m-0 mb-3.5">
              Pick up to 3 colours. Our artisans will find the closest thread match.
            </p>
            <div className="grid grid-cols-6 gap-2.5">
              {COLOR_PALETTE.map(({ name, hex }) => {
                const sel = colors.includes(name);
                const disabled = colors.length >= 3 && !sel;
                const light = parseInt(hex.slice(1), 16) > 0xaaaaaa;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleColor(name)}
                    title={name}
                    disabled={disabled}
                    className={cn(
                      'flex flex-col items-center gap-1.5 border-0 bg-transparent p-0',
                      disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                    )}
                  >
                    <span
                      className="rounded-md flex items-center justify-center transition-all"
                      style={{
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        background: hex,
                        border: sel ? '3px solid var(--color-pink-500)' : '2px solid rgba(0,0,0,.08)',
                        boxShadow: sel ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
                      }}
                    >
                      {sel && <Check size={18} strokeWidth={2.5} color={light ? '#333' : '#fff'} />}
                    </span>
                    <span
                      className="text-[10px] text-ink-500 text-center leading-tight"
                      style={{ maxWidth: isMobile ? 40 : 48 }}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
            {colors.length > 0 && (
              <div className="mt-4 flex items-center gap-2.5">
                <span className="text-[13px] text-ink-500">Selected:</span>
                {colors.map((name) => (
                  <span
                    key={name}
                    className="w-5 h-5 rounded-full"
                    style={{ background: hexOf(name), border: '2px solid rgba(0,0,0,.1)' }}
                  />
                ))}
                {colors.length < 3 && (
                  <span className="text-xs text-ink-400">
                    {3 - colors.length} more allowed
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              iconLeft={<ChevronLeft size={18} />}
            >
              Back
            </Button>
            <Button
              size="lg"
              iconRight={<ArrowRight size={18} />}
              onClick={() => setStep(3)}
              disabled={!canNext2}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Contact */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="bg-pink-50 border-stitch rounded-lg px-4.5 py-3.5 flex gap-4 items-center flex-wrap">
            {photoURL && (
              <img
                src={photoURL}
                alt="Your reference"
                className="w-13 h-16 rounded-md object-cover border-2 border-pink-200 flex-none"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-ink-500 mb-1">Your request</div>
              <div className="font-semibold text-ink-900 text-sm flex gap-3 flex-wrap items-center">
                <span>{size}</span>
                <span className="flex gap-1.5">
                  {colors.map((name) => (
                    <span
                      key={name}
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ background: hexOf(name), border: '1.5px solid rgba(0,0,0,.1)' }}
                    />
                  ))}
                </span>
              </div>
              <div className="text-xs text-ink-500 mt-0.5 truncate">
                {notes.slice(0, 80)}
                {notes.length > 80 ? '…' : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="border-0 bg-transparent text-pink-600 text-xs font-semibold cursor-pointer flex-none"
            >
              Edit
            </button>
          </div>

          <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[13px] text-ink-700">
                Full name <span className="text-pink-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="Yasmine Benali"
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[13px] text-ink-700">
                Email <span className="text-pink-500">*</span>
              </label>
              <input
                type="email"
                className={inputCls}
                placeholder="you@example.com"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
          </div>
          <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[13px] text-ink-700">
                WhatsApp number{' '}
                <span className="text-xs text-ink-400 font-normal">— we'll reply here</span>
              </label>
              <input
                type="tel"
                className={inputCls}
                placeholder="+213 6XX XXX XXX"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[13px] text-ink-700">
                Wilaya <span className="text-pink-500">*</span>
              </label>
              <select
                className={cn(inputCls, 'cursor-pointer')}
                value={contact.wilaya}
                onChange={(e) => setContact((c) => ({ ...c, wilaya: e.target.value }))}
              >
                <option value="">Select wilaya…</option>
                {wilayas.map((w, i) => (
                  <option key={w} value={w}>
                    {String(i + 1).padStart(2, '0')} — {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-warm-50 rounded-lg px-4.5 py-3.5 flex gap-2.5 items-start text-[13px] text-ink-500 border border-warm-200">
            <Info size={16} strokeWidth={2} className="text-gold flex-none mt-0.5" />
            <span>
              We'll review your request and send a quote within <strong>48 hours</strong>.
              No payment required now — everything is confirmed over WhatsApp first.
            </span>
          </div>

          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-red rounded-lg px-4 py-3 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(2)}
              iconLeft={<ChevronLeft size={18} />}
            >
              Back
            </Button>
            <Button full size="lg" onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? 'Sending…' : 'Send request ✶'}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
