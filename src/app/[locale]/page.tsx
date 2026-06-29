import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getStats,
  getActivities,
  getInstitutions,
  getContent,
} from "@/lib/google-sheets";
import { DonateButton } from "@/components/DonateButton";
import { ActivityGallery } from "@/components/ActivityGallery";

/**
 * Home — เลย์เอาต์แบบ "editorial / magazine" ตาม petrol design
 *   HERO          พื้น petrol เข้ม + EST. 2011 + kicker + huge title + lead + 2 CTAs
 *   STATS STRIP   แถบลอยทับ hero (margin-top ลบ) — grid 4 cells, มี border คั่น
 *   SECTION 01    About — sidebar (01 + kicker + bar) | content (title + paragraph)
 *   SECTION 02    Mission/Pillars — numbered rows (ไม่ใช่ cards)
 *   SECTION 03    Where studying — institution cards (top-border accent, badge dark)
 *   CTA BAND      petrol bg + accent bar + title + button (right)
 */

// ISR — refresh ข้อมูลจาก Google Sheet ทุก 60 วินาที (default)
// ปรับได้ที่ env var NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS
export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, stats, activities, institutions, content] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getActivities(locale),
    getInstitutions(locale),
    getContent(locale),
  ]);

  // helper: override จาก sheet > dict (รุ่นน้องแก้ข้อความใน sheet ได้ — ไม่ต้องแตะโค้ด)
  const t = (key: string, fallback: string) => content[key] ?? fallback;
  const estYear = Number(content["est_year"]) || 2011;

  // เลือก 4 stats ที่จะแสดงใน strip ของ home (เรียงตาม priority)
  // ถ้า key ไม่มีใน sheet → ข้ามไปอันถัดไป
  const HOME_STAT_KEYS = ["members", "alumni", "institutions", "events"];
  const statByKey = Object.fromEntries(stats.map((s) => [s.key, s]));
  const homeStats = HOME_STAT_KEYS.map((k) => statByKey[k]).filter(Boolean);
  // เผื่อ key ใน sheet เปลี่ยน → fill จาก stats ที่เหลือให้ได้ 4 ช่อง
  for (const s of stats) {
    if (homeStats.length >= 4) break;
    if (!HOME_STAT_KEYS.includes(s.key)) homeStats.push(s);
  }


  return (
    <>
      {/* ════════════════════════════════════════════════════
            HERO
         ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* gradient overlays */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-navy via-navy/70 to-navy/40" />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-hero-glow" />
        {/* Kuwait map outline decorative SVG (bottom-right) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute -end-9 -bottom-12 z-[1] pointer-events-none"
          style={{
            width: "min(48vw, 560px)",
            height: "min(48vw, 560px)",
            opacity: 0.16,
          }}
        >
          <path
            d="M20 8 L40 6 L58 5 L62 12 L64 20 L52 27 L46 32 L57 35 L59 40 L59 50 L57 62 L54 72 L52 79 L40 75 L24 70 L8 58 L5 44 L11 24 Z"
            fill="none"
            stroke="#7FD8CF"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>

        <div className="container relative z-[2] py-[clamp(56px,8vw,96px)] pb-[clamp(78px,10vw,120px)]">
          {/* EST. + kicker row */}
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
      </section>

      {/* ════════════════════════════════════════════════════
            STATS STRIP (ลอยทับ hero edge)
         ════════════════════════════════════════════════════ */}
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

      {/* ════════════════════════════════════════════════════
            SECTION 01 — ABOUT (sidebar + content)
         ════════════════════════════════════════════════════ */}
      <section className="container py-[clamp(58px,8vw,96px)]">
        <div className="flex flex-wrap gap-x-[clamp(28px,5vw,72px)] gap-y-8">
          {/* sidebar */}
          <div className="flex-none w-[200px] min-w-[160px]">
            <div className="font-display text-[15px] font-extrabold text-brand">
              01
            </div>
            <div className="mt-2 text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
              {dict.home.aboutKicker}
            </div>
            <div className="mt-[14px] h-[2px] w-10 bg-brand" />
          </div>
          {/* content */}
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

      {/* ════════════════════════════════════════════════════
            SECTION 02 — MISSION / PILLARS (numbered rows)
         ════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-line">
        <div className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-2 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">
              02
            </span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {dict.home.pillarsTitle}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          {pillars(locale).map((p, idx) => (
            <div
              key={p.title}
              className="flex flex-wrap items-start gap-x-[clamp(18px,4vw,56px)] gap-y-3 border-b border-line py-[clamp(24px,3vw,34px)]"
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

      {/* ════════════════════════════════════════════════════
            SECTION 03 — WHERE (Institutions preview)
         ════════════════════════════════════════════════════ */}
      <section className="container py-[clamp(48px,7vw,84px)]">
        <div className="mb-[30px] flex items-center gap-4">
          <span className="font-display text-[15px] font-extrabold text-brand">
            03
          </span>
          <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
            {dict.students.listTitle}
          </span>
          <span className="flex-1 h-px bg-line" />
          <Link
            href={`/${locale}/students`}
            className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
          >
            {dict.common.readMore} →
          </Link>
        </div>

        {institutions.length === 0 ? (
          <div className="rounded-sm border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            {dict.students.comingSoon}
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {institutions.slice(0, 4).map((inst) => (
              <Link
                key={inst.id}
                href={`/${locale}/students`}
                className="flex flex-col gap-3.5 border border-line border-t-[3px] border-t-brand bg-white p-[22px] hover:shadow-card transition-shadow"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span className="inline-flex items-center justify-center min-w-[40px] h-7 px-2 bg-navy text-white text-[11px] font-extrabold">
                    {inst.short}
                  </span>
                  <span className="font-display text-[30px] font-extrabold leading-none text-brand">
                    {inst.studentsCount}
                  </span>
                </div>
                <div>
                  <div className="text-[15px] font-bold leading-[1.35] text-navy">
                    {inst.name}
                  </div>
                  <div className="mt-1 text-[12.5px] text-ink-muted">
                    {inst.type}{inst.area && " · "}{inst.area}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
            CTA BAND
         ════════════════════════════════════════════════════ */}
      <section className="bg-navy text-white">
        <div className="container flex flex-wrap items-center justify-between gap-[30px] py-[clamp(44px,6vw,72px)]">
          <div className="flex-1 basis-[420px] min-w-[300px]">
            <div className="mb-5 h-[2px] w-10 bg-brand" />
            <h2 className="m-0 max-w-[22ch] text-[clamp(23px,3vw,33px)] font-extrabold leading-[1.3]">
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
      </section>

      {/* ════════════════════════════════════════════════════
            ACTIVITIES (ถ้ามี) — แสดงล่างสุดเป็น bonus
         ════════════════════════════════════════════════════ */}
      {activities.length > 0 && (
        <section className="bg-white border-t border-line">
          <div className="container py-[clamp(48px,7vw,84px)]">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-display text-[15px] font-extrabold text-brand">
                04
              </span>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
                {dict.home.activitiesTitle}
              </span>
              <span className="flex-1 h-px bg-line" />
              <Link
                href={`/${locale}/activities`}
                className="text-[13.5px] font-bold text-brand hover:text-brand-600 whitespace-nowrap"
              >
                {dict.common.readMore} →
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

/* ----------------------------------------------------------------
 *  Pillars data (hardcoded — แก้เนื้อหาในนี้ตรงๆ)
 * ---------------------------------------------------------------- */
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
