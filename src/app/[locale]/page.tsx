import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getStats,
  getActivities,
  getHighlights,
  getContent,
  getChannels,
  type HighlightType,
} from "@/lib/google-sheets";
import { DonateButton } from "@/components/DonateButton";
import { ActivityGallery } from "@/components/ActivityGallery";
import { HighlightsGallery } from "@/components/HighlightsGallery";

/**
 * Home — engaging editorial layout
 *   HERO         hero photo (real photo of members) + kicker/title/lead + scroll hint
 *   STATS STRIP  floating
 *   SECTION 01   About — visual sidebar + content
 *   SECTION 02   Mission/Pillars — numbered rows with icons
 *   SECTION 03   Recent Highlights (แทน institutions preview)
 *   CTA BAND     with reasons "why support"
 *   ACTIVITIES   optional preview
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

const TYPE_STYLE: Record<HighlightType, { bg: string; text: string }> = {
  graduation: { bg: "bg-[#E1F4F1]", text: "text-[#0B7068]" },
  scholarship: { bg: "bg-[#FBF3D6]", text: "text-[#7A5A00]" },
  award: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
  welcome: { bg: "bg-brand-50", text: "text-navy" },
  story: { bg: "bg-[#EAF0FB]", text: "text-[#1F55C8]" },
  volunteer: { bg: "bg-[#F4ECE5]", text: "text-[#7A4A1F]" },
};

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, stats, activities, highlights, content, channels] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getActivities(locale),
    getHighlights(locale),
    getContent(locale),
    getChannels(locale),
  ]);
  // CTA email — จาก channels sheet
  const supportEmail =
    channels.find((c) => c.key === "email")?.value ?? "info@thaikuwait.org";
  const supportEmailHref = `mailto:${supportEmail}?subject=Support%20TSAK`;

  const t = (key: string, fallback: string) => content[key] ?? fallback;
  const estYear = Number(content["est_year"]) || 2011;

  // Stats
  const HOME_STAT_KEYS = ["members", "alumni", "institutions", "events"];
  const statByKey = Object.fromEntries(stats.map((s) => [s.key, s]));
  const homeStats = HOME_STAT_KEYS.map((k) => statByKey[k]).filter(Boolean);
  for (const s of stats) {
    if (homeStats.length >= 4) break;
    if (!HOME_STAT_KEYS.includes(s.key)) homeStats.push(s);
  }

  // Hero photo from content sheet (fallback = null)
  const heroPhotoUrl = content["hero_photo_url"] ?? "";

  // CTA reasons
  const d = dict.home as Record<string, string>;
  const ctaReasons = [d.ctaReason1, d.ctaReason2, d.ctaReason3].filter(Boolean);

  // Recent highlights (top 3)
  // Group highlights by collection first, then take top N groups (album-friendly)
  const highlightGroupMap = new Map<string, typeof highlights>();
  for (const h of highlights) {
    const key = h.collection || `__solo_${h.id}`;
    if (!highlightGroupMap.has(key)) highlightGroupMap.set(key, []);
    highlightGroupMap.get(key)!.push(h);
  }
  const recentHighlights = Array.from(highlightGroupMap.values())
    .slice(0, 4)
    .flat();

  const typeLabel = (t: HighlightType) => {
    const s = dict.students as Record<string, string>;
    return s[`type${t.charAt(0).toUpperCase()}${t.slice(1)}`] ?? t;
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════
            HERO
         ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* Soft glow + orbs (ไม่มี grid pattern แล้ว — ดู elegant กว่า) */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div
          className="absolute -top-40 -end-40 w-[640px] h-[640px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.32), transparent)",
          }}
        />
        <div
          className="absolute -bottom-60 -start-60 w-[720px] h-[720px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(127,216,207,0.14), transparent)",
          }}
        />
        <div
          className="absolute top-1/3 start-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.18), transparent)",
          }}
        />
        {/* Kuwait skyline silhouette — bottom-anchored full width
            Kuwait Towers (iconic 3-sphere) + Liberation Tower + Al Hamra + city buildings */}
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYEnd meet"
          className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
          style={{ height: "min(30vh, 240px)", opacity: 0.16 }}
        >
          <defs>
            <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7FD8CF" stopOpacity="0" />
              <stop offset="100%" stopColor="#7FD8CF" stopOpacity="1" />
            </linearGradient>
          </defs>
          <g fill="url(#skylineGrad)" stroke="none">
            {/* Left cluster - small buildings */}
            <rect x="0" y="150" width="60" height="50" />
            <rect x="60" y="130" width="40" height="70" />
            <rect x="100" y="145" width="55" height="55" />
            <rect x="155" y="115" width="45" height="85" />
            <rect x="200" y="140" width="60" height="60" />
            <rect x="260" y="100" width="35" height="100" />

            {/* Liberation Tower (tall thin with spike) */}
            <rect x="310" y="60" width="20" height="140" />
            <polygon points="320,60 315,45 325,45" />

            {/* Mid cluster */}
            <rect x="345" y="125" width="70" height="75" />
            <rect x="415" y="105" width="50" height="95" />
            <rect x="465" y="140" width="60" height="60" />

            {/* Al Hamra Tower (curved suggestion - tall rectangle w/ notch) */}
            <path d="M 540 40 L 555 40 L 570 60 L 570 200 L 540 200 Z" />

            {/* City buildings between */}
            <rect x="585" y="120" width="55" height="80" />
            <rect x="640" y="135" width="45" height="65" />
            <rect x="685" y="105" width="60" height="95" />
            <rect x="745" y="130" width="40" height="70" />

            {/* Kuwait Towers (iconic 3-sphere landmark) — right of center */}
            {/* Tall tower - 2 spheres + top */}
            <rect x="820" y="60" width="6" height="140" />
            <circle cx="823" cy="80" r="16" />
            <circle cx="823" cy="115" r="12" />
            <polygon points="820,60 826,60 823,45" />
            {/* Medium tower - 1 sphere */}
            <rect x="855" y="90" width="5" height="110" />
            <circle cx="857.5" cy="105" r="10" />
            {/* Short spire */}
            <rect x="880" y="120" width="4" height="80" />
            <polygon points="880,120 884,120 882,110" />

            {/* Right cluster - buildings */}
            <rect x="905" y="140" width="55" height="60" />
            <rect x="960" y="115" width="45" height="85" />
            <rect x="1005" y="130" width="60" height="70" />
            <rect x="1065" y="100" width="40" height="100" />
            <rect x="1105" y="145" width="50" height="55" />
            <rect x="1155" y="125" width="45" height="75" />
          </g>
        </svg>

        <div className="container relative z-[2] grid items-center gap-[clamp(32px,5vw,56px)] py-[clamp(56px,8vw,96px)] pb-[clamp(80px,12vw,180px)] lg:grid-cols-[1.15fr_1fr]">
          {/* LEFT — copy */}
          <div>
            <div className="mb-[26px] flex items-center gap-4">
              <span className="font-display text-[13px] font-bold tracking-[0.08em] text-brand-200">
                EST. {estYear}
              </span>
              <span className="h-px w-[30px] bg-brand-200 opacity-60" />
              <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-brand-200">
                {t("hero_kicker", dict.home.kicker)}
              </span>
            </div>

            <h1 className="m-0 max-w-[16ch] text-[clamp(34px,5.6vw,62px)] font-extrabold leading-[1.1]">
              {t("hero_title", dict.home.title)}
            </h1>
            <p className="mt-[26px] max-w-[50ch] text-[clamp(16px,1.6vw,19px)] leading-[1.8] text-[#BBDCD9]">
              {t("hero_lead", dict.home.lead)}
            </p>

            <div className="mt-[34px] flex flex-wrap gap-3.5">
              <DonateButton
                href={`/${locale}/contact`}
                label={dict.cta.support}
              />
              <DonateButton
                href={`/${locale}/activities`}
                label={dict.cta.activities}
                variant="outline"
              />
            </div>
          </div>

          {/* RIGHT — hero photo (ไม่มีกรอบ ไม่จำกัด ratio ให้รูปเด่นเต็มที่) */}
          <div className="relative lg:justify-self-end w-full max-w-[640px] mx-auto lg:mx-0">
            {heroPhotoUrl ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotoUrl}
                  alt="TSAK members"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto shadow-2xl shadow-black/40 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                />
                {/* info card floating — ล่างซ้าย */}
                <div className="hidden sm:block absolute -bottom-5 start-5 bg-white text-navy px-4 py-3 shadow-xl">
                  <div className="text-[10.5px] font-bold tracking-wider uppercase text-brand-600">
                    {dict.home.heroBadge}
                  </div>
                  <div className="font-display text-[22px] font-extrabold text-brand leading-none mt-1">
                    {statByKey["members"]?.display ?? "58"}+
                  </div>
                </div>
              </div>
            ) : (
              // Placeholder ใช้ aspect 3:2 (เพราะยังไม่มีรูป)
              <div className="relative aspect-[3/2] border-2 border-brand-200/40 overflow-hidden">
                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 16px,rgba(255,255,255,.01) 16px 32px)",
                  }}
                >
                  <div className="text-center px-6">
                    <div className="font-display text-[48px] mb-2">👥</div>
                    <div className="font-mono text-[12px] text-brand-200/85">
                      [ ใส่รูปกลุ่มใน sheet content: hero_photo_url ]
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint — วางเหนือ skyline */}
        <div className="absolute bottom-[calc(min(30vh,240px)+8px)] start-1/2 -translate-x-1/2 z-[3] pointer-events-none flex flex-col items-center gap-1 text-[11px] tracking-wider uppercase text-brand-200/60">
          <span>{d.scrollHint ?? "Scroll"}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-bounce-slow">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ════════════════ STATS STRIP ════════════════ */}
      <div className="container relative z-[5] -mt-[clamp(44px,6vw,58px)] px-[clamp(20px,5vw,48px)]">
        <div
          className="grid border border-line bg-white shadow-[0_18px_44px_rgba(0,0,0,.10)]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          {(homeStats.length > 0
            ? homeStats
            : [
                { key: "k1", display: "—", label: dict.common.loading },
                { key: "k2", display: "—", label: dict.common.loading },
                { key: "k3", display: "—", label: dict.common.loading },
                { key: "k4", display: "—", label: dict.common.loading },
              ]
          ).map((s) => (
            <div
              key={s.key}
              className="px-[clamp(18px,2.4vw,28px)] py-[clamp(22px,3vw,30px)] border-b border-line [&:not(:last-child)]:border-e [&:not(:last-child)]:border-line"
            >
              <div className="font-display text-[clamp(30px,3.6vw,42px)] font-extrabold leading-none text-navy">
                {s.display ?? "—"}
              </div>
              <div className="mt-2 text-[13.5px] font-semibold text-ink-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ SECTION 01 — ABOUT (photo left + building bg) ════════════════ */}
      <section className="relative overflow-hidden py-[clamp(58px,8vw,96px)]">
        {/* Building outline decorative — คูเวต tower/silhouette */}
        <svg
          viewBox="0 0 280 380"
          className="absolute -end-8 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: "min(28vw, 320px)", height: "min(38vw, 420px)", opacity: 0.06 }}
          fill="none"
          stroke="#0C3B45"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Tall tower + 2 spheres */}
          <line x1="140" y1="380" x2="140" y2="60" />
          <circle cx="140" cy="90" r="24" />
          <circle cx="140" cy="145" r="18" />
          <line x1="140" y1="60" x2="140" y2="30" />
          {/* Medium tower */}
          <line x1="200" y1="380" x2="200" y2="130" />
          <circle cx="200" cy="155" r="14" />
          <line x1="200" y1="130" x2="200" y2="110" />
          {/* Short spire */}
          <line x1="240" y1="380" x2="240" y2="180" />
          <line x1="240" y1="180" x2="240" y2="165" />
          {/* Ground line */}
          <line x1="60" y1="380" x2="280" y2="380" strokeWidth="0.9" opacity="0.6" />
        </svg>

        <div className="container relative grid gap-x-[clamp(28px,5vw,64px)] gap-y-10 lg:grid-cols-[min(45%,440px)_1fr] items-start">
          {/* LEFT — photo (สลับมาซ้ายเพื่อบาลานซ์กับ hero) */}
          <div className="relative order-1 lg:order-none">
            {content["about_photo_url"] ? (
              <div className="group overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content["about_photo_url"]}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-auto shadow-xl shadow-black/10 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="relative aspect-[4/5] border border-line grid place-items-center bg-brand-50/40">
                <div className="text-center px-4">
                  <div className="text-[48px] mb-2">📸</div>
                  <div className="font-mono text-[11px] text-ink-subtle">
                    [ ใส่ about_photo_url ใน sheet content ]
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar + content */}
          <div className="order-2 lg:order-none flex flex-wrap gap-x-[clamp(28px,5vw,56px)] gap-y-8">
            <div className="flex-none w-[180px] min-w-[160px]">
              <div className="font-display text-[15px] font-extrabold text-brand">01</div>
              <div className="mt-2 text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
                {dict.home.aboutKicker}
              </div>
              <div className="mt-[14px] h-[2px] w-10 bg-brand" />
              <div className="mt-8 hidden sm:block">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="text-brand-50">
                  <path d="M15 40 Q 10 40 10 32 Q 10 20 22 15 L 24 20 Q 16 24 16 30 L 22 30 Q 25 30 25 34 Q 25 40 20 40 Z M40 40 Q 35 40 35 32 Q 35 20 47 15 L 49 20 Q 41 24 41 30 L 47 30 Q 50 30 50 34 Q 50 40 45 40 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="flex-1 basis-[320px] min-w-[280px]">
              <h2 className="m-0 max-w-[20ch] text-[clamp(25px,3.2vw,36px)] font-extrabold leading-[1.28] text-navy">
                {t("about_title", dict.home.aboutTitle)}
              </h2>
              <p className="mt-5 max-w-[62ch] text-[17px] leading-[1.9] text-ink-soft">
                {t("about_text", dict.home.aboutText)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 02 — PILLARS (cards with photos) ════════════════ */}
      <section className="bg-white border-y border-line">
        <div className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-8 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">02</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {dict.home.pillarsTitle}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          {/* Photo cards — clean grid, ไม่เอียง */}
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-y-4">
            {pillars(locale).map((p, idx) => {
              const photoUrl = content[`pillar_${idx + 1}_photo_url`];
              return (
                <div key={p.title} className="group">
                  {/* Photo card */}
                  <div
                    className="relative overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)] bg-navy transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-50 to-brand-100">
                        <span
                          className="font-display text-[clamp(80px,14vw,140px)] font-extrabold text-brand-600/25 leading-none"
                          aria-hidden
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    {/* Number chip overlay */}
                    <span className="absolute top-3 start-3 inline-block bg-white/95 backdrop-blur-sm px-2.5 py-1 font-display text-[11px] font-extrabold text-navy shadow-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Text below */}
                  <div className="mt-5 sm:mt-6 px-2">
                    <h3 className="m-0 text-[clamp(17px,1.7vw,20px)] font-bold leading-tight text-navy">
                      {p.title}
                    </h3>
                    <p className="mt-2 m-0 text-[14px] sm:text-[14.5px] leading-[1.75] text-ink-muted">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 03 — RECENT HIGHLIGHTS (Book gallery) ════════════════ */}
      {recentHighlights.length > 0 && (
        <section className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-8 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">03</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {d.highlightsPreview ?? "Recent Stories"}
            </span>
            <span className="flex-1 h-px bg-line" />
            <Link
              href={`/${locale}/students`}
              className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
            >
              {d.viewAll ?? "View all"} →
            </Link>
          </div>

          {/* Reuse HighlightsGallery — book cover + reading modal (ไม่ต้องไปหน้าอื่น) */}
          <HighlightsGallery
            highlights={recentHighlights.slice(0, 4)}
            typeLabels={{
              graduation: (dict.students as Record<string, string>).typeGraduation ?? "Graduation",
              scholarship: (dict.students as Record<string, string>).typeScholarship ?? "Scholarship",
              award: (dict.students as Record<string, string>).typeAward ?? "Award",
              welcome: (dict.students as Record<string, string>).typeWelcome ?? "Welcome",
              story: (dict.students as Record<string, string>).typeStory ?? "Story",
              volunteer: (dict.students as Record<string, string>).typeVolunteer ?? "Volunteer",
            }}
            closeLabel="Close"
          />
        </section>
      )}

      {/* ════════════════ CTA BAND — with reasons ════════════════ */}
      <section className="relative bg-navy text-white overflow-hidden">
        {/* Soft orbs — elegant, not tech */}
        <div
          className="absolute -top-32 -end-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.25), transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -start-32 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(127,216,207,0.12), transparent)",
          }}
        />
        <div className="container relative py-[clamp(52px,8vw,88px)]">
          <div className="mb-5 h-[2px] w-10 bg-brand" />
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div className="flex-1 basis-[420px] min-w-[300px]">
              <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3vw,36px)] font-extrabold leading-[1.25]">
                {t("cta_band_title", dict.home.ctaBandTitle)}
              </h2>
              <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.8] text-[#BBDCD9]">
                {t("cta_band_text", dict.home.ctaBandText)}
              </p>
            </div>
            <a
              href={supportEmailHref}
              className="flex-none inline-flex items-center justify-center rounded-sm bg-brand px-[34px] py-4 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,.22)] hover:bg-brand-600 transition-colors whitespace-nowrap"
            >
              {dict.home.ctaBandBtn}
            </a>
          </div>

          {/* Reasons — 3 columns */}
          {ctaReasons.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3 border-t border-white/10 pt-8">
              {ctaReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-display text-[22px] font-extrabold text-brand-200 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold text-white leading-snug">
                      {r}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ ACTIVITIES PREVIEW ════════════════ */}
      {activities.length > 0 && (
        <section className="bg-white border-t border-line">
          <div className="container py-[clamp(48px,7vw,84px)]">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-display text-[15px] font-extrabold text-brand">04</span>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
                {dict.home.activitiesTitle}
              </span>
              <span className="flex-1 h-px bg-line" />
              <Link
                href={`/${locale}/activities`}
                className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
              >
                {d.viewAll ?? "View all"} →
              </Link>
            </div>
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              {activities.slice(0, 3).map((act) => (
                <article
                  key={act.id}
                  className="flex flex-col border border-line bg-white"
                >
                  <ActivityGallery images={act.images} alt={act.title} />
                  <div className="flex flex-1 flex-col p-5">
                    <time className="font-display text-[13px] font-bold text-brand-600">
                      {act.date}
                    </time>
                    <h3 className="mt-2 text-[18px] font-bold leading-snug text-navy line-clamp-2">
                      {act.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-soft line-clamp-3">
                      {act.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ------ Pillars (hardcoded) ------ */
function pillars(locale: Locale): { title: string; desc: string }[] {
  const data = {
    th: [
      {
        title: "ต้อนรับและดูแลน้องใหม่",
        desc: "ช่วยเหลือการปรับตัว ที่พัก และการลงทะเบียนเรียน สำหรับนักศึกษาที่เพิ่งเดินทางมาถึง",
      },
      {
        title: "สนับสนุนด้านการเรียน",
        desc: "แบ่งปันข้อมูลทุนการศึกษา ติว และเชื่อมโยงรุ่นพี่รุ่นน้องในแต่ละสถาบัน",
      },
      {
        title: "สืบสานวัฒนธรรมไทย",
        desc: "จัดงานเทศกาลไทย สงกรานต์ ลอยกระทง และเผยแพร่วัฒนธรรมไทยแก่เพื่อนชาวคูเวต",
      },
    ],
    en: [
      {
        title: "Welcoming New Students",
        desc: "We help with settling in, housing, and enrollment for newly arrived students.",
      },
      {
        title: "Academic Support",
        desc: "We share scholarship information, run study sessions, and connect students across every institution.",
      },
      {
        title: "Preserving Thai Culture",
        desc: "We host Thai festivals such as Songkran and Loy Krathong and share our culture with our Kuwaiti friends.",
      },
    ],
    ar: [
      {
        title: "استقبال الطلاب الجدد",
        desc: "نساعد في التأقلم والسكن والتسجيل للطلاب القادمين حديثاً.",
      },
      {
        title: "الدعم الأكاديمي",
        desc: "نشارك معلومات المنح وننظّم جلسات الدراسة ونربط الطلاب بزملائهم في كل مؤسسة.",
      },
      {
        title: "الحفاظ على الثقافة التايلاندية",
        desc: "ننظّم المهرجانات التايلاندية مثل سونغكران ولوي كراتونغ ونعرّف أصدقاءنا الكويتيين بثقافتنا.",
      },
    ],
  };
  return data[locale];
}
