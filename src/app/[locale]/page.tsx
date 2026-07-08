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
  getDocuments,
  type HighlightType,
} from "@/lib/google-sheets";
import { DonateButton } from "@/components/DonateButton";
import { ActivityCard } from "@/components/ActivityCard";
import { HighlightsGallery } from "@/components/HighlightsGallery";
import { DocumentCard } from "@/components/DocumentCard";

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

  const [dict, stats, activities, highlights, content, channels, documents] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getActivities(locale),
    getHighlights(locale),
    getContent(locale),
    getChannels(locale),
    getDocuments(locale),
  ]);
  const homeDocuments = documents.slice(0, 3);

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

  const d = dict.home as Record<string, string>;

  // Recent highlights (top 3)
  // Group highlights by collection → take top 3 groups → flatten (ไม่ตัด members ในกลุ่ม)
  const highlightGroupMap = new Map<string, typeof highlights>();
  for (const h of highlights) {
    const key = h.collection || `__solo_${h.id}`;
    if (!highlightGroupMap.has(key)) highlightGroupMap.set(key, []);
    highlightGroupMap.get(key)!.push(h);
  }
  const recentHighlights = Array.from(highlightGroupMap.values())
    .slice(0, 3)
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
                    {t("hero_badge", dict.home.heroBadge)}
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
                {t("about_kicker", dict.home.aboutKicker)}
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

      {/* ════════════════ SECTION 02 — พันธกิจ (minimal editorial) ════════════════ */}
      <section className="bg-white border-y border-line">
        <div className="container py-[clamp(64px,9vw,112px)]">
          <div className="mb-[clamp(40px,6vw,72px)] flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">02</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {t("pillars_title", dict.home.pillarsTitle)}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          {/* Minimal rows — big serif numbers + title + desc | ไม่มีรูป */}
          <div className="grid gap-y-[clamp(36px,5vw,56px)] max-w-[68ch] mx-auto">
            {pillars(locale, content).map((p, idx) => (
              <article
                key={p.title}
                className="grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10 items-baseline"
              >
                <span
                  className="font-display text-[clamp(40px,6vw,64px)] font-extrabold leading-none text-brand-100 tabular-nums"
                  aria-hidden
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 text-[clamp(18px,2vw,22px)] font-extrabold leading-tight text-navy">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 m-0 text-[clamp(14.5px,1.4vw,16px)] leading-[1.85] text-ink-soft">
                    {p.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 03 — RECENT HIGHLIGHTS (Book gallery) ════════════════ */}
      {recentHighlights.length > 0 && (
        <section className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-8 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">03</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {t("highlights_preview", d.highlightsPreview ?? "Recent Stories")}
            </span>
            <span className="flex-1 h-px bg-line" />
            <Link
              href={`/${locale}/students`}
              className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
            >
              {t("view_all", d.viewAll ?? "View all")} →
            </Link>
          </div>

          {/* Reuse HighlightsGallery — book cover + reading modal (ไม่ต้องไปหน้าอื่น) */}
          <HighlightsGallery
            highlights={recentHighlights}
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

      {/* ════════════════ CTA BAND — minimal (title + btn → contact) ════════════════ */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div
          className="absolute -top-32 -end-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.22), transparent)",
          }}
        />
        <div className="container relative py-[clamp(40px,6vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
            <h2 className="m-0 max-w-[26ch] text-[clamp(20px,2.4vw,28px)] font-extrabold leading-[1.3]">
              {t("cta_band_title", dict.home.ctaBandTitle)}
            </h2>
            <Link
              href={`/${locale}/contact`}
              className="flex-none inline-flex items-center justify-center rounded-sm bg-brand px-7 py-3.5 text-[14.5px] font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,.22)] hover:bg-brand-600 transition-colors whitespace-nowrap"
            >
              {t("cta_band_btn", dict.home.ctaBandBtn)} →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ ACTIVITIES PREVIEW ════════════════ */}
      {activities.length > 0 && (
        <section className="bg-white border-t border-line">
          <div className="container py-[clamp(48px,7vw,84px)]">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-display text-[15px] font-extrabold text-brand">04</span>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
                {t("activities_title", dict.home.activitiesTitle)}
              </span>
              <span className="flex-1 h-px bg-line" />
              <Link
                href={`/${locale}/activities`}
                className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
              >
                {t("view_all", d.viewAll ?? "View all")} →
              </Link>
            </div>
            {/* Grid: mobile 1 col (horizontal card compact) / tablet 2 / desktop 3 */}
            <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activities.slice(0, 3).map((act) => {
                const audienceLabels: Record<string, string> = {
                  all: (dict.activities as Record<string, string>).audienceAll ?? "ทุกคน",
                  male: (dict.activities as Record<string, string>).audienceMale ?? "ชาย",
                  female: (dict.activities as Record<string, string>).audienceFemale ?? "หญิง",
                };
                return (
                  <ActivityCard
                    key={act.id}
                    act={act}
                    labels={{
                      audienceLabel: audienceLabels[act.audience] ?? "",
                      viewPhotos: dict.activities.viewPhotos,
                      closeLabel: "Close",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ 05 · RESOURCES PREVIEW ════════════════ */}
      {homeDocuments.length > 0 && (
        <section className="border-t border-line bg-canvas">
          <div className="container py-[clamp(48px,7vw,84px)]">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-display text-[15px] font-extrabold text-brand">05</span>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
                {(dict.resources as Record<string, string>).homeSectionTitle}
              </span>
              <span className="flex-1 h-px bg-line" />
              <Link
                href={`/${locale}/resources`}
                className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
              >
                {(dict.resources as Record<string, string>).viewAll} →
              </Link>
            </div>
            <p className="mb-8 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">
              {(dict.resources as Record<string, string>).homeSectionIntro}
            </p>
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3">
              {homeDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  labels={{
                    downloadLabel: (dict.resources as Record<string, string>).downloadLabel,
                    previewLabel: (dict.resources as Record<string, string>).previewLabel,
                    openLinkLabel: (dict.resources as Record<string, string>).openLinkLabel,
                    closeLabel: (dict.resources as Record<string, string>).closeLabel,
                    pinnedLabel: (dict.resources as Record<string, string>).pinnedLabel,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ------ Pillars: sheet (content) wins over hardcoded fallback ------ */
function pillars(
  locale: Locale,
  content: Record<string, string> = {}
): { title: string; desc: string }[] {
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
        desc: "We provide essential support for newly arrived students, including guidance on housing, university enrollment, and adjusting to life in Kuwait.",
      },
      {
        title: "Academic Support",
        desc: "We facilitate academic success by sharing scholarship opportunities, organizing study sessions, and fostering connections among students across all institutions.",
      },
      {
        title: "Preserving Thai Culture",
        desc: "We proudly promote Thai heritage by hosting traditional festivals, such as Songkran and Loy Krathong, fostering cultural exchange with our Kuwaiti friends.",
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
  // Sheet override — ถ้ามี pillar_N_title/desc ในชีทให้ใช้แทน
  return data[locale].map((p, idx) => ({
    title: content[`pillar_${idx + 1}_title`] || p.title,
    desc: content[`pillar_${idx + 1}_desc`] || p.desc,
  }));
}
