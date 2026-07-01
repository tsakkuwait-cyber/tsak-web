import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getStats,
  getActivities,
  getHighlights,
  getContent,
  type HighlightType,
} from "@/lib/google-sheets";
import { DonateButton } from "@/components/DonateButton";
import { ActivityGallery } from "@/components/ActivityGallery";

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

  const [dict, stats, activities, highlights, content] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getActivities(locale),
    getHighlights(locale),
    getContent(locale),
  ]);

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
  const recentHighlights = highlights.slice(0, 3);

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
        {/* Layered backgrounds */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,216,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(127,216,207,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        {/* Soft gradient orbs */}
        <div
          className="absolute -top-40 -end-40 w-[540px] h-[540px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.28), transparent)",
          }}
        />
        <div
          className="absolute -bottom-60 -start-60 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(127,216,207,0.16), transparent)",
          }}
        />
        {/* Kuwait outline decorative */}
        <svg
          viewBox="0 0 100 100"
          className="absolute -end-8 -bottom-14 pointer-events-none"
          style={{
            width: "min(44vw, 500px)",
            height: "min(44vw, 500px)",
            opacity: 0.09,
          }}
        >
          <path
            d="M 13 14 L 28 12 L 46 11 L 60 11 L 67 13 L 70 17 L 71 22 L 72 28 L 74 34 L 70 38 L 62 40 L 54 42 L 48 46 L 52 51 L 60 52 L 68 53 L 74 58 L 77 65 L 77 73 L 75 80 L 70 85 L 60 87 L 42 87 L 24 85 L 14 82 L 9 75 L 7 62 L 7 48 L 8 32 L 10 22 Z"
            fill="none"
            stroke="#7FD8CF"
            strokeWidth="0.8"
          />
        </svg>

        <div className="container relative z-[2] grid items-center gap-[clamp(32px,5vw,64px)] py-[clamp(64px,9vw,110px)] lg:grid-cols-[1.1fr_1fr]">
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

          {/* RIGHT — hero photo frame */}
          <div className="relative lg:justify-self-end w-full max-w-[560px]">
            <div className="relative aspect-[4/3] border-2 border-brand-200/40 overflow-hidden group">
              {/* Decorative border corners */}
              <span className="absolute top-0 start-0 h-6 w-6 border-t-[3px] border-s-[3px] border-brand z-10" />
              <span className="absolute top-0 end-0 h-6 w-6 border-t-[3px] border-e-[3px] border-brand z-10" />
              <span className="absolute bottom-0 start-0 h-6 w-6 border-b-[3px] border-s-[3px] border-brand z-10" />
              <span className="absolute bottom-0 end-0 h-6 w-6 border-b-[3px] border-e-[3px] border-brand z-10" />

              {heroPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroPhotoUrl}
                  alt="TSAK members"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              ) : (
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
                      [ ใส่รูปกลุ่มสมาชิกใน sheet content: hero_photo_url ]
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* small info card floating */}
            <div className="hidden sm:block absolute -bottom-5 start-5 bg-white text-navy px-4 py-3 shadow-lg">
              <div className="text-[10.5px] font-bold tracking-wider uppercase text-brand-600">
                {dict.home.heroBadge}
              </div>
              <div className="font-display text-[22px] font-extrabold text-brand leading-none mt-1">
                {statByKey["members"]?.display ?? "58"}+
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-[3] pointer-events-none flex flex-col items-center gap-1 text-[11px] tracking-wider uppercase text-brand-200/60">
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

      {/* ════════════════ SECTION 01 — ABOUT ════════════════ */}
      <section className="container py-[clamp(58px,8vw,96px)]">
        <div className="flex flex-wrap gap-x-[clamp(28px,5vw,72px)] gap-y-8">
          <div className="flex-none w-[200px] min-w-[160px]">
            <div className="font-display text-[15px] font-extrabold text-brand">01</div>
            <div className="mt-2 text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
              {dict.home.aboutKicker}
            </div>
            <div className="mt-[14px] h-[2px] w-10 bg-brand" />
            {/* Decorative quote mark */}
            <div className="mt-8 hidden sm:block">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="text-brand-50">
                <path d="M15 40 Q 10 40 10 32 Q 10 20 22 15 L 24 20 Q 16 24 16 30 L 22 30 Q 25 30 25 34 Q 25 40 20 40 Z M40 40 Q 35 40 35 32 Q 35 20 47 15 L 49 20 Q 41 24 41 30 L 47 30 Q 50 30 50 34 Q 50 40 45 40 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="flex-1 basis-[420px] min-w-[300px]">
            <h2 className="m-0 max-w-[20ch] text-[clamp(25px,3.2vw,36px)] font-extrabold leading-[1.28] text-navy">
              {t("about_title", dict.home.aboutTitle)}
            </h2>
            <p className="mt-5 max-w-[62ch] text-[17px] leading-[1.9] text-ink-soft">
              {t("about_text", dict.home.aboutText)}
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 02 — PILLARS ════════════════ */}
      <section className="bg-white border-y border-line">
        <div className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-2 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">02</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {dict.home.pillarsTitle}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          {pillars(locale).map((p, idx) => (
            <div
              key={p.title}
              className="flex flex-wrap items-start gap-x-[clamp(18px,4vw,56px)] gap-y-3 border-b border-line py-[clamp(24px,3vw,34px)] transition-colors hover:bg-brand-50/40"
            >
              <div
                className="font-display flex-none w-[72px] text-[clamp(32px,4vw,46px)] font-extrabold leading-none text-brand-50"
                aria-hidden
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="flex-none w-[260px] max-w-full m-0 text-[clamp(18px,2vw,21px)] font-bold text-navy">
                {p.title}
              </h3>
              <p className="flex-1 basis-[300px] min-w-[240px] m-0 text-[15.5px] leading-[1.8] text-ink-muted">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ SECTION 03 — RECENT HIGHLIGHTS ════════════════ */}
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

          <div className="grid gap-3 md:grid-cols-3">
            {recentHighlights.map((h) => {
              const style = TYPE_STYLE[h.type];
              return (
                <Link
                  key={h.id}
                  href={`/${locale}/students`}
                  className="group flex flex-col overflow-hidden border border-line bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5"
                >
                  <div
                    className="relative bg-gradient-to-br from-brand-50 to-brand-100"
                    style={{ aspectRatio: "4 / 3" }}
                  >
                    {h.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={h.photoUrl}
                        alt={h.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                        style={{ objectPosition: "center 20%" }}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="font-display text-[48px] font-extrabold text-brand-600/25">
                          {h.name.slice(0, 1)}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 start-3 inline-block px-2.5 py-1 text-[11px] font-bold ${style.bg} ${style.text}`}
                    >
                      {typeLabel(h.type)}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="text-[15px] font-extrabold leading-snug text-navy line-clamp-2">
                      {h.headline}
                    </h3>
                    <div className="mt-1 text-[12px] font-semibold text-brand-600 truncate">
                      {h.name}
                      {h.institution && (
                        <span className="text-ink-muted font-medium"> · {h.institution}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════ CTA BAND — with reasons ════════════════ */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,216,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(127,216,207,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
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
            <Link
              href={`/${locale}/contact`}
              className="flex-none inline-flex items-center justify-center rounded-sm bg-brand px-[34px] py-4 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,.22)] hover:bg-brand-600 transition-colors whitespace-nowrap"
            >
              {dict.home.ctaBandBtn}
            </Link>
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
