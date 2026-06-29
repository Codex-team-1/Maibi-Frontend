import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { cn } from '@/lib/cn';

export function NotFound() {
  const navigate = useNavigate();
  const { isMobile } = useLayoutContext();

  return (
    <main
      className={cn(
        'min-h-[80vh] flex flex-col items-center justify-center text-center',
        isMobile ? 'px-6 py-16 gap-8' : 'px-8 py-24 gap-10',
      )}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="rounded-full opacity-30 blur-[120px]"
          style={{
            width: isMobile ? 320 : 500,
            height: isMobile ? 320 : 500,
            background: 'radial-gradient(circle, var(--color-pink-300) 0%, var(--color-pink-100) 50%, transparent 80%)',
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative flex items-center justify-center">
        <div
          className="relative rounded-[2rem] border border-pink-200/80 bg-white/90 backdrop-blur-sm px-10 py-5 flex items-center justify-center"
          style={{
            boxShadow: '0 8px 48px 0 rgba(236,72,153,0.15), 0 2px 12px 0 rgba(236,72,153,0.10)',
          }}
        >
          <span
            className="font-script text-pink-400 select-none leading-none"
            style={{ fontSize: isMobile ? 72 : 96 }}
          >
            Maibi
          </span>
        </div>
        {/* decorative accents */}
        <span className="absolute -top-2 -end-2 w-3 h-3 rounded-full bg-pink-300/60" />
        <span className="absolute -bottom-1 -start-2 w-2 h-2 rounded-full bg-gold/50" />
        <span className="absolute top-1/2 -end-5 w-1.5 h-1.5 rounded-full bg-pink-200" />
      </div>

      {/* 404 number */}
      <div className={cn('relative', isMobile ? '-mb-2' : '-mb-3')}>
        <span
          className={cn(
            'font-display font-semibold select-none leading-none',
            isMobile ? 'text-[96px]' : 'text-[140px]',
          )}
          style={{
            background: 'linear-gradient(135deg, var(--color-pink-300) 0%, var(--color-pink-500) 50%, #8A1550 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </span>
      </div>

      {/* Copy */}
      <div className={cn('flex flex-col items-center', isMobile ? 'gap-2' : 'gap-3')}>
        <h1
          className={cn(
            'font-display font-semibold text-ink-900 m-0',
            isMobile ? 'text-2xl' : 'text-3xl',
          )}
        >
          Page Not Found
        </h1>
        <p
          className={cn(
            'text-ink-400 m-0 max-w-[300px]',
            isMobile ? 'text-sm' : 'text-base',
          )}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Decorative rule */}
      <div className="flex items-center gap-3 w-full max-w-[180px]">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-pink-200" />
        <span className="text-pink-300 text-xs select-none">✦</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-pink-200" />
      </div>

      {/* Actions */}
      <div className={cn('flex', isMobile ? 'flex-col gap-3 w-full max-w-[280px]' : 'flex-row gap-4')}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer border-0 transition-all duration-200',
            'bg-pink-500 text-white hover:bg-pink-600 active:scale-95',
            isMobile ? 'h-12 px-6 text-sm w-full' : 'h-11 px-7 text-sm',
          )}
        >
          <Home size={16} />
          Go Home
        </button>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition-all duration-200',
            'bg-white text-pink-600 border border-pink-200 hover:border-pink-300 hover:bg-pink-50 active:scale-95',
            isMobile ? 'h-12 px-6 text-sm w-full' : 'h-11 px-7 text-sm',
          )}
        >
          Browse Shop
          <ArrowRight size={16} className="rtl:-scale-x-100" />
        </button>
      </div>
    </main>
  );
}
