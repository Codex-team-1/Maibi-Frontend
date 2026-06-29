import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Scissors,
  Hand,
  Flower2,
  HeartHandshake,
  Heart,
  Shirt,
  Package,
  MapPin,
  Users,
  Gem,
  ShieldCheck,
} from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { useLayoutContext } from "@/hooks/useLayoutContext";
import { useAsync } from "@/hooks/useAsync";
import { getFeaturedProducts, getNewProducts } from "@/api";
import { useI18n, type TranslationKey } from "@/i18n";
import { cn } from "@/lib/cn";
import heroImage from "../assets/hero2.png";
import maibiHero from "../assets/hero2.png";
import ourStoryImage from "../assets/our-story.png";
import { FeatureItem } from "@/components/ui/FeatureItem";

const MARQUEE_ITEMS: Array<[string, TranslationKey, string]> = [
  ["✶", "home.marqueeHandEmbroidered", "var(--color-gold)"],
  ["♡", "home.marqueeLimitedEdition", "var(--color-pink-500)"],
  ["◇", "home.marqueeSlowFashion", "var(--color-ink-400)"],
  ["✶", "home.marqueeMadeInAlgeria", "var(--color-gold)"],
  ["♡", "home.marqueeCustomOrders", "var(--color-pink-500)"],
  ["◇", "home.marqueeOneOfAKind", "var(--color-ink-400)"],
  ["✶", "home.marqueeAlgerianArtisans", "var(--color-gold)"],
  ["◇", "home.marqueeWearableArt", "var(--color-ink-400)"],
];

function NoProductsState({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "py-14 gap-5" : "py-20 gap-6",
      )}
    >
      {/* Logo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-pink-100/60 blur-2xl scale-150" />
        <div
          className="relative rounded-[1.5rem] border border-pink-200/80 bg-white/80 backdrop-blur-sm px-8 py-4 flex items-center justify-center"
          style={{ boxShadow: "0 4px 32px 0 rgba(236,72,153,0.10), 0 1.5px 8px 0 rgba(236,72,153,0.07)" }}
        >
          <span
            className="font-script text-pink-400 select-none leading-none"
            style={{ fontSize: isMobile ? 52 : 64 }}
          >
            Maibi
          </span>
        </div>
        {/* decorative dots */}
        <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-pink-300/70" />
        <span className="absolute -bottom-1.5 -start-1.5 w-1.5 h-1.5 rounded-full bg-gold/60" />
      </div>

      {/* Text */}
      <div className={cn("flex flex-col items-center", isMobile ? "gap-1.5" : "gap-2")}>
        <p
          className={cn(
            "font-display font-semibold text-ink-900 m-0",
            isMobile ? "text-xl" : "text-2xl",
          )}
        >
          No Products
        </p>
        <p
          className={cn(
            "text-ink-400 m-0 max-w-[260px]",
            isMobile ? "text-[13px]" : "text-sm",
          )}
        >
          New pieces are being crafted with care — check back soon.
        </p>
      </div>

      {/* Decorative rule */}
      <div className="flex items-center gap-3 w-full max-w-[200px]">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-pink-200" />
        <span className="text-pink-300 text-xs select-none">✦</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-pink-200" />
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  sub,
  action,
  onAction,
  isMobile,
}: {
  children: React.ReactNode;
  sub?: string;
  action?: string;
  onAction?: () => void;
  isMobile: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between",
        isMobile ? "mb-5" : "mb-7",
      )}
    >
      <div>
        <h2
          className={cn(
            "font-display font-semibold text-ink-900 m-0 mb-1",
            isMobile ? "text-[26px]" : "text-4xl",
          )}
        >
          {children}
        </h2>
        {sub && <p className="text-ink-500 text-[13px] m-0">{sub}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "border-0 bg-transparent cursor-pointer text-pink-600 font-semibold flex items-center gap-1.5 flex-none",
            isMobile ? "text-[13px]" : "text-sm",
          )}
        >
          {action} <ArrowRight size={16} className="rtl:-scale-x-100" />
        </button>
      )}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { isMobile } = useLayoutContext();
  const { t } = useI18n();
  const px = isMobile ? "px-4" : "px-8";

  const featured = useAsync((signal) => getFeaturedProducts(4, signal), []);
  const newArrivals = useAsync((signal) => getNewProducts(4, signal), []);

  return (
    <main className={isMobile ? "pb-20" : ""}>
      {/* ══════════════════════════════════════════
           HERO — MOBILE  (stacked: photo → content)
          ══════════════════════════════════════════ */}
      {isMobile && (
        <section
          className="w-full"
          style={{
            background: "linear-gradient(180deg, #fef1f8 0%, #fdf4f9 100%)",
          }}
        >
          {/* Photo — full width, top of screen, no padding */}
          <div
            className="relative w-full"
            style={{ height: "52vw", minHeight: 210, maxHeight: 320 }}
          >
            <img
              src={heroImage}
              alt="Maibi handmade fashion"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* bottom fade into the pink content area */}
            <div
              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, transparent, #fef1f8)",
              }}
            />
          </div>

          {/* Content area */}
          <div className="px-5 pt-1 pb-6">
            {/* MADE IN ALGERIA pill — sits just below the photo */}
            {/* <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-[7px] shadow-sm mb-5">
              <span className="grid place-items-center size-[20px] rounded-full bg-pink-100">
                <Flower2
                  className="size-[10px] text-pink-500"
                  strokeWidth={2.4}
                />
              </span>
              <span className="text-[11px] font-bold tracking-[0.14em] text-pink-600">
                MADE IN ALGERIA
              </span>
            </div> */}

            {/* Heading */}
            <h1 className="m-0 font-display tracking-tight">
              <span
                className="block font-bold text-pink-500"
                style={{ fontSize: 46, lineHeight: 0.95 }}
              >
                {t("home.heroBrand")}
              </span>
              <span
                className="block font-medium text-ink-900"
                style={{ fontSize: 36, lineHeight: 1.05 }}
              >
                {t("home.heroCraftedWithSoul")}
              </span>
            </h1>

            {/* accent */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-[2.5px] w-10 rounded-full bg-pink-400" />
              <span className="text-pink-400 text-[11px]">✦</span>
            </div>

            {/* Subtext */}
            <p className="mt-4 text-[14px] leading-[1.7] text-ink-500 m-0">
              {t("home.heroSubtitleA")}
              <br />
              {t("home.heroSubtitleB")}
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="inline-flex items-center gap-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold text-[14px] ps-6 pe-2.5 py-3 transition-colors shadow-brand"
              >
                {t("home.shopTheDrop")}
                <span className="grid place-items-center size-7 rounded-full bg-white/20">
                  <ArrowRight className="size-[15px] rtl:-scale-x-100" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/custom-order")}
                className="inline-flex items-center gap-2 rounded-full border border-pink-300 text-pink-600 font-semibold text-[14px] px-5 py-3 transition-colors bg-white/70"
              >
                <Scissors className="size-[13px]" />
                {t("home.requestCustomPiece")}
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  "from-pink-200 to-pink-400",
                  "from-gold/60 to-rose-red",
                  "from-pink-300 to-pink-600",
                ].map((g, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-8 rounded-full border-2 border-white bg-gradient-to-br",
                      g,
                    )}
                  />
                ))}
              </div>
              <p className="text-[13px] text-ink-500 flex items-center gap-1.5 m-0">
                {t("home.lovedByPrefix")}{" "}
                <span className="font-bold text-ink-900">1350+</span>{" "}
                {t("home.lovedBySuffix")}
                <Heart className="size-3.5 fill-pink-500 text-pink-500" />
              </p>
            </div>

            {/* Bottom features — 2 col grid */}
            <div className="mt-6 rounded-[18px] bg-white/70 backdrop-blur-sm px-4 py-4 shadow-sm ring-1 ring-pink-100/60">
              <div className="grid grid-cols-2 gap-4">
                <FeatureItem
                  icon={<HeartHandshake strokeWidth={1.8} />}
                  title={t("home.featHandmade")}
                  description={t("home.featHandmadeDesc")}
                />
                <FeatureItem
                  icon={<Flower2 strokeWidth={1.8} />}
                  title={t("home.featHeritage")}
                  description={t("home.featHeritageDesc")}
                />
                <FeatureItem
                  icon={<Shirt strokeWidth={1.8} />}
                  title={t("home.featLimited")}
                  description={t("home.featLimitedDesc")}
                />
                <FeatureItem
                  icon={<Package strokeWidth={1.8} />}
                  title={t("home.featPackaged")}
                  description={t("home.featPackagedDesc")}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
           HERO — DESKTOP  (full-bleed background)
          ══════════════════════════════════════════ */}
      {!isMobile && (
        <section className="max-w-full mx-auto px-6">
          {/* dir="ltr" on the whole hero card so photo, gradient, and content
              always use physical left/right regardless of document RTL direction */}
          <div
            dir="ltr"
            className="relative overflow-hidden rounded-[28px]"
            style={{ minHeight: 520 }}
          >
            {/* Full-bleed background photo */}
            <img
              src={maibiHero}
              alt="Maibi handmade fashion"
              className="absolute inset-0 h-[720px] w-[1597px] object-cover object-center"
            />

            {/* Left-to-right gradient: opaque cream on the left (white space) → transparent */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(254,241,248,0.65) 0%, rgba(254,241,248,0.90) 35%, rgba(254,241,248,0.60) 48%, rgba(254,241,248,0.10) 65%, transparent 80%)",
              }}
            />

            {/* Content — always on the physical left over the white/gradient side.
                dir="auto" inside so Arabic text in the labels still aligns right-to-left. */}
            <div
              dir="auto"
              className="relative z-20 flex flex-col justify-center px-14 py-10"
              style={{ maxWidth: "56%" }}
            >
              {/* Heading */}
              <h1 className="m-0 font-display tracking-tight">
                <span
                  className="block font-bold text-pink-500"
                  style={{
                    fontSize: "clamp(52px, 6.5vw, 75px)",
                    lineHeight: 0.92,
                  }}
                >
                  {t("home.heroBrand")}
                </span>
                <span
                  className="block font-medium text-ink-900"
                  style={{
                    fontSize: "clamp(38px, 4.8vw, 66px)",
                    lineHeight: 1.0,
                  }}
                >
                  {t("home.heroCraftedWithSoul")}
                </span>
              </h1>

              {/* accent line */}
              <div className="mt-5 flex items-center gap-2">
                <div className="h-[2.5px] w-12 rounded-full bg-pink-400" />
                <span className="text-pink-400 text-[10px]">✦</span>
              </div>

              {/* Subtext */}
              <p className="mt-5 text-[15.5px] leading-[1.7] text-ink-600 max-w-[400px]">
                {t("home.heroSubtitleA")}
                <br />
                {t("home.heroSubtitleB")}
              </p>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="inline-flex items-center gap-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold text-[15px] ps-7 pe-3 py-3.5 transition-colors shadow-brand"
                >
                  {t("home.shopTheDrop")}
                  <span className="grid place-items-center size-5 rounded-full bg-white/20">
                    <ArrowRight className="size-[17px]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/custom-order")}
                  className="inline-flex items-center gap-2 rounded-full border border-pink-300 hover:bg-pink-50 text-pink-600 font-semibold text-[15px] px-6 py-3.5 transition-colors bg-white/60"
                >
                  <Scissors className="size-[17px]" />
                  {t("home.requestCustomPiece")}
                </button>
              </div>

              {/* Social proof */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[
                    "from-pink-200 to-pink-400",
                    "from-gold/60 to-rose-red",
                    "from-pink-300 to-pink-600",
                  ].map((g, i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-8 rounded-full border-[2px] border-white bg-gradient-to-br",
                        g,
                      )}
                    />
                  ))}
                </div>
                <p className="text-[13.5px] text-ink-600 flex items-center gap-1.5 m-0">
                  {t("home.lovedByPrefix")}{" "}
                  <span className="font-bold text-ink-900">1350+</span>{" "}
                  {t("home.lovedBySuffix")}
                  <Heart className="size-3.5 fill-pink-500 text-pink-500" />
                </p>
              </div>
            </div>

            {/* Bottom features bar */}
            <div className="absolute bottom-0 inset-x-0 z-20">
              <div className="mx-5 mb-6 rounded-[20px] border border-pink-200/60 bg-white/80 backdrop-blur-sm px-8 py-5 shadow-sm ring-1 ring-pink-100/60">
                <div
                  dir="auto"
                  className="grid grid-cols-4 divide-x divide-pink-200/60"
                >
                  <div className="pe-6 ps-2">
                    <FeatureItem
                      icon={<HeartHandshake strokeWidth={1.8} />}
                      title={t("home.featHandmade")}
                      description={t("home.featHandmadeDesc")}
                    />
                  </div>
                  <div className="px-6">
                    <FeatureItem
                      icon={<Flower2 strokeWidth={1.8} />}
                      title={t("home.featHeritage")}
                      description={t("home.featHeritageDesc")}
                    />
                  </div>
                  <div className="px-6">
                    <FeatureItem
                      icon={<Shirt strokeWidth={1.8} />}
                      title={t("home.featLimited")}
                      description={t("home.featLimitedDesc")}
                    />
                  </div>
                  <div className="ps-6 pe-2">
                    <FeatureItem
                      icon={<Package strokeWidth={1.8} />}
                      title={t("home.featPackaged")}
                      description={t("home.featPackagedDesc")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Scrolling strip ── */}
      <section
        className={cn(
          "overflow-hidden border-y border-dashed border-pink-200 bg-pink-50 py-3.5",
          isMobile ? "mt-6" : "mt-9",
        )}
      >
        <div className="marquee-track flex w-max whitespace-nowrap">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center">
              {MARQUEE_ITEMS.map(([ic, labelKey, col], i) => (
                <span key={i} className="inline-flex items-center gap-2.5 px-8">
                  <span style={{ color: col, fontSize: 14 }}>{ic}</span>
                  <span
                    className={cn(
                      "font-semibold text-ink-700 tracking-[0.02em]",
                      isMobile ? "text-[13px]" : "text-sm",
                    )}
                  >
                    {t(labelKey)}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section
        className={cn(
          "max-w-[1240px] mx-auto",
          px,
          isMobile ? "pt-12" : "pt-22",
        )}
      >
        <SectionTitle
          sub={t("home.newArrivalsSub")}
          action={t("home.shopAll")}
          onAction={() => navigate("/shop")}
          isMobile={isMobile}
        >
          {t("home.newArrivals")}
        </SectionTitle>
        {newArrivals.loading ? (
          <Spinner />
        ) : (newArrivals.data?.items ?? []).length === 0 ? (
          <NoProductsState isMobile={isMobile} />
        ) : (
          <div
            className={cn(
              "grid",
              isMobile ? "grid-cols-2 gap-3.5" : "grid-cols-4 gap-6",
            )}
          >
            {(newArrivals.data?.items ?? []).map((p) => {
              const isNew = (Date.now() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
              return (
                <ProductCard key={p.id} product={p} isMobile={isMobile} forceBadge={isNew ? 'New' : undefined} />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Our Story Divider ── */}
      <div
        className={cn(
          "flex items-center justify-center",
          isMobile ? "mt-14 mx-4" : "mt-24 mx-8",
        )}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-pink-300/60" />
        <div className="mx-5 flex items-center gap-3 rounded-full border border-pink-200 bg-white px-5 py-2.5 shadow-sm">
          <Gem
            className={cn(
              "text-pink-400 flex-none",
              isMobile ? "size-3.5" : "size-4",
            )}
            strokeWidth={1.8}
          />
          <span
            className={cn(
              "font-display font-semibold tracking-wide text-pink-600",
              isMobile ? "text-[15px]" : "text-[17px]",
            )}
          >
            {t("home.ourStory")}
          </span>
          <span
            className={cn(
              "text-pink-300 select-none",
              isMobile ? "text-[10px]" : "text-xs",
            )}
          >
            ✦
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-200 to-pink-300/60" />
      </div>

      {/* ── Our Story ── */}
      <section
        id="our-story"
        className={cn(
          "max-w-[1240px] mx-auto",
          px,
          isMobile ? "mt-7" : "mt-10",
        )}
      >
        {isMobile ? (
          /* ── MOBILE STORY ── */
          <div
            className="rounded-[24px] overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1a0d12 0%, #3d1228 100%)",
            }}
          >
            {/* Photo */}
            <div className="relative w-full" style={{ height: 280 }}>
              <img
                src={ourStoryImage}
                alt="Algerian artisan embroidery"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 40%, #1a0d12 100%)",
                }}
              />
              {/* floating quote */}
              <div className="absolute bottom-5 inset-x-5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3.5 border border-white/15">
                <p className="font-display text-white text-[13.5px] italic leading-relaxed m-0">
                  {t("home.storyQuoteMobile")}
                </p>
                <p className="text-white/55 text-[11px] font-semibold tracking-widest uppercase mt-1.5 m-0">
                  {t("home.storyAuthor")}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-6 pb-7">
              <div className="inline-flex items-center gap-2 mb-4 rounded-full px-3.5 py-1.5 bg-pink-500/20 border border-pink-400/30">
                <Gem className="size-3.5 text-pink-300" strokeWidth={1.8} />
                <span className="text-[11px] font-bold tracking-[0.12em] text-pink-300 uppercase">
                  {t("home.ourStory")}
                </span>
              </div>

              <h2 className="font-display font-semibold text-white m-0 mb-4 leading-[1.1] text-[28px]">
                {t("home.storyHeadingA")}
                <br />
                {t("home.storyHeadingB")}
              </h2>

              <p className="text-white/65 text-[13.5px] leading-[1.8] m-0 mb-5">
                {t("home.storyBodyMobile")}
              </p>

              {/* Stats row */}
              <div className="flex gap-5 mb-6 pb-5 border-b border-white/10">
                {[
                  [
                    "5+",
                    t("home.statArtisans"),
                    <Users key="u" className="size-3.5" />,
                  ],
                  [
                    "100+",
                    t("home.statPieces"),
                    <Gem key="g" className="size-3.5" />,
                  ],
                  [
                    "3",
                    t("home.statCities"),
                    <MapPin key="m" className="size-3.5" />,
                  ],
                ].map(([n, l, icon]) => (
                  <div key={String(l)} className="flex-1">
                    <div className="font-display font-bold text-pink-400 text-[22px] leading-none mb-0.5">
                      {n}
                    </div>
                    <div className="flex items-center gap-1 text-white/45 text-[11px] font-semibold uppercase tracking-wider">
                      {icon}
                      {l}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-semibold text-[14px] py-3.5 transition-colors"
              >
                {t("home.discoverCollection")}
                <ArrowRight className="size-[15px] rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        ) : (
          /* ── DESKTOP STORY ── */
          <div
            className="relative grid grid-cols-[1fr_1fr] rounded-[28px] overflow-hidden min-h-[540px]"
            style={{
              background:
                "linear-gradient(135deg, #1a0d12 0%, #3d1228 60%, #5c1a3a 100%)",
            }}
          >
            {/* LEFT — photo with overlaid quote */}
            <div className="relative overflow-hidden">
              <img
                src={ourStoryImage}
                alt="Algerian artisan embroidery"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* right-edge blend */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, transparent 50%, #1a0d12 100%)",
                }}
              />
              {/* bottom-to-top dark vignette */}
              <div
                className="absolute inset-x-0 bottom-0 h-48"
                style={{
                  background:
                    "linear-gradient(to top, rgba(26,13,18,0.85), transparent)",
                }}
              />

              {/* Quote card at bottom */}
              <div className="absolute bottom-8 left-8 right-0 pr-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/15 max-w-[320px]">
                  <div className="text-pink-300 text-xl mb-2 leading-none">
                    "
                  </div>
                  <p className="font-display text-white text-[16px] italic leading-relaxed m-0">
                    {t("home.storyQuoteDesktop")}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-pink-500/30 border border-pink-400/40 grid place-items-center">
                      <Hand
                        className="size-3.5 text-pink-300"
                        strokeWidth={1.8}
                      />
                    </div>
                    <span className="text-white/55 text-[11.5px] font-semibold tracking-[0.08em] uppercase">
                      {t("home.storyAuthor")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — content */}
            <div className="relative flex flex-col justify-center px-14 py-14">
              {/* faint script watermark */}
              <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 font-script text-white/[0.04] select-none leading-none text-[160px]">
                Maibi
              </span>

              <div className="relative z-10 flex flex-col gap-6">
                {/* label */}
                <div className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 bg-pink-500/20 border border-pink-400/30">
                  <Gem className="size-3.5 text-pink-300" strokeWidth={1.8} />
                  <span className="text-[11px] font-bold tracking-[0.14em] text-pink-300 uppercase">
                    {t("home.ourStory")}
                  </span>
                </div>

                {/* heading */}
                <h2 className="font-display font-semibold text-white m-0 text-[40px] leading-[1.08]">
                  {t("home.storyHeadingA")}
                  <br />
                  {t("home.storyHeadingB")}
                </h2>

                {/* body */}
                <p className="text-white/65 text-[15px] leading-[1.85] m-0">
                  {t("home.storyBodyDesktop")}
                </p>

                {/* value props */}
                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: (
                        <ShieldCheck className="size-4" strokeWidth={1.8} />
                      ),
                      text: t("home.storyProp1"),
                    },
                    {
                      icon: <MapPin className="size-4" strokeWidth={1.8} />,
                      text: t("home.storyProp2"),
                    },
                    {
                      icon: <Users className="size-4" strokeWidth={1.8} />,
                      text: t("home.storyProp3"),
                    },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 grid place-items-center size-7 rounded-lg bg-pink-500/20 text-pink-300 shrink-0 border border-pink-400/25">
                        {icon}
                      </span>
                      <p className="text-white/70 text-[14px] leading-[1.6] m-0">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-8 py-5 border-t border-white/10">
                  {[
                    [
                      "5+",
                      t("home.statArtisans"),
                      <Users key="u" className="size-3.5" />,
                    ],
                    [
                      "100+",
                      t("home.statPiecesMade"),
                      <Gem key="g" className="size-3.5" />,
                    ],
                    [
                      "3",
                      t("home.statCities"),
                      <MapPin key="m" className="size-3.5" />,
                    ],
                  ].map(([n, l, icon]) => (
                    <div key={String(l)}>
                      <div className="font-display font-bold text-pink-400 text-[28px] leading-none mb-1">
                        {n}
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-semibold uppercase tracking-wider">
                        {icon}
                        {l}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/shop")}
                    className="inline-flex items-center gap-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-semibold text-[15px] ps-7 pe-5 py-3.5 transition-colors"
                  >
                    {t("home.discoverCollection")}
                    <ArrowRight className="size-[16px] rtl:-scale-x-100" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/custom-order")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-[14px] px-6 py-3.5 transition-colors"
                  >
                    {t("home.customOrder")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Featured Pieces ── */}
      <section
        className={cn(
          "max-w-[1240px] mx-auto",
          px,
          isMobile ? "pt-10" : "pt-18",
        )}
      >
        <SectionTitle
          sub={t("home.featuredSub")}
          action={t("home.viewAll")}
          onAction={() => navigate("/shop")}
          isMobile={isMobile}
        >
          {t("home.featuredPieces")}
        </SectionTitle>
        {featured.loading ? (
          <Spinner />
        ) : (featured.data?.items ?? []).length === 0 ? (
          <NoProductsState isMobile={isMobile} />
        ) : (
          <div
            className={cn(
              "grid",
              isMobile ? "grid-cols-2 gap-3.5" : "grid-cols-4 gap-6",
            )}
          >
            {(featured.data?.items ?? []).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} isMobile={isMobile} forceBadge="Featured" />
            ))}
          </div>
        )}
      </section>

      {/* ── Custom Order Banner ── */}
      <section
        className={cn(
          "text-center",
          isMobile ? "mt-12 px-5 py-12" : "mt-22 px-16 py-20",
        )}
        style={{
          background:
            "linear-gradient(120deg, #2A2123 0%, #4A1535 40%, #8A1550 100%)",
        }}
      >
        <div
          className={cn(
            "max-w-[640px] mx-auto flex flex-col items-center",
            isMobile ? "gap-4" : "gap-5.5",
          )}
        >
          <div className="w-14 h-14 rounded-full bg-pink-400/20 border-[1.5px] border-pink-400/40 grid place-items-center text-pink-300">
            <Scissors size={20} strokeWidth={1.8} />
          </div>
          <div
            className="font-script text-pink-300"
            style={{ fontSize: isMobile ? 18 : 22 }}
          >
            {t("home.bespokeService")}
          </div>
          <h2
            className={cn(
              "font-display text-white font-semibold leading-[1.08] m-0",
              isMobile ? "text-3xl" : "text-5xl",
            )}
          >
            {t("home.yourVisionA")}
            <br />
            {t("home.yourVisionB")}
          </h2>
          <p
            className={cn(
              "text-white/65 leading-relaxed m-0 max-w-[500px]",
              isMobile ? "text-sm" : "text-[17px]",
            )}
          >
            {t("home.bannerBody")}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              size={isMobile ? "md" : "lg"}
              onClick={() => navigate("/custom-order")}
              iconRight={<ArrowRight size={18} className="rtl:-scale-x-100" />}
            >
              {t("home.startCustomOrder")}
            </Button>
            <Button
              size={isMobile ? "md" : "lg"}
              variant="ghost"
              className="text-white/60 border-[1.5px] border-white/20"
              onClick={() => navigate("/shop")}
            >
              {t("home.browseReadyMade")}
            </Button>
          </div>
          <div className="flex gap-7 mt-2">
            {[
              [t("home.bannerNoPayment"), t("home.bannerNoPaymentSub")],
              [t("home.bannerResponse"), t("home.bannerResponseSub")],
              [t("home.bannerWhatsapp"), t("home.bannerWhatsappSub")],
            ].map(([title, s]) => (
              <div key={title} className="text-center">
                <div
                  className={cn(
                    "font-bold text-white/85",
                    isMobile ? "text-xs" : "text-[13px]",
                  )}
                >
                  {title}
                </div>
                <div className="text-[11px] text-white/45 mt-0.5">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <ReviewsCarousel isMobile={isMobile} />
    </main>
  );
}
