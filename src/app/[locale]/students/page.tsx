import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getInstitutions,
  getStats,
  getHighlights,
  type HighlightType,
} from "@/lib/google-sheets";

/**
 * Our Community page
 *   1. HERO — community-focused title + stats
 *   2. Institution grid (แทน map) — 4 cards พร้อม logo + จำนวน
 *   3. Highlights — เรื่องราว/ผลงาน/รางวัล filter ได้ตาม type
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

// สี chip ของ highlight แต่ละ type
const TYPE_STYLE: Record<HighlightType, { bg: string; text: string }> = {
  graduation: { bg: "bg-[#E1F4F1]", text: "text-[#0B7068]" },
  scholarship: { bg: "bg-[#FBF3D6]", text: "text-[#7A5A00]" },
  award: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
  welcome: { bg: "bg-brand-50", text: "text-navy" },
  story: { bg: "bg-[#EAF0FB]", text: "text-[#1F55C8]" },
  volunteer: { bg: "bg-[#F4ECE5]", text: "text-[#7A4A1F]" },
};

export default async function StudentsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, stats, institutions, highlights] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getInstitutions(locale),
    getHighlights(locale),
  ]);

  const statByKey = Object.fromEntries(stats.map((s) => [s.key, s]));
  const total = statByKey["members"]?.display ?? "—";
  const male = statByKey["male"]?.display ?? "—";
  const female = statByKey["female"]?.display ?? "—";

  // helper — type label
  const d = dict.students as Record<string, string>;
  const typeLabel = (t: HighlightType) =>
    d[`type${t.charAt(0).toUpperCase()}${t.slice(1)}`] ?? t;

  return (
    <>
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,216,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(127,216,207,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

        <div className="container relative flex flex-wrap items-end justify-between gap-8 py-[clamp(52px,7vw,84px)]">
          <div className="flex-1 basis-[440px] min-w-[300px]">
            <div className="mb-[18px] flex items-center gap-3.5">
              <span className="font-display text-[14px] font-extrabold text-brand-200">01</span>
              <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-200">
                {dict.nav.students}
              </span>
            </div>
            <h1 className="m-0 max-w-[20ch] text-[clamp(28px,3.8vw,46px)] font-extrabold leading-[1.15]">
              {dict.students.title}
            </h1>
          </div>

          <div className="flex flex-none items-end gap-[clamp(20px,3vw,32px)]">
            <div>
              <div className="font-display text-[clamp(56px,8vw,84px)] font-extrabold leading-[0.9] text-brand-200">
                {total}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#BBDCD9]">
                {dict.students.totalLabel}
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[22px] font-extrabold text-white">{male}</span>
                <span className="text-[12.5px] text-[#BBDCD9]">{dict.students.maleLabel}</span>
              </div>
              <div className="h-px w-16 bg-white/20" />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[22px] font-extrabold text-white">{female}</span>
                <span className="text-[12.5px] text-[#BBDCD9]">{dict.students.femaleLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ INSTITUTIONS GRID ════════════════ */}
      <section className="container py-[clamp(48px,7vw,80px)]">
        <div className="mb-7 flex items-center gap-4">
          <span className="font-display text-[15px] font-extrabold text-brand">02</span>
          <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
            {d.institutionsTitle ?? "Where we study"}
          </span>
          <span className="flex-1 h-px bg-line" />
        </div>

        {institutions.length === 0 ? (
          <div className="border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            {dict.students.comingSoon}
          </div>
        ) : (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
          >
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className="flex flex-col overflow-hidden border border-line bg-white transition-shadow hover:shadow-card"
              >
                {/* Cover photo or gradient */}
                <div
                  className="relative bg-gradient-to-br from-navy via-navy-dark to-brand-900"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {inst.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inst.imageUrl}
                      alt={inst.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[#BBDCD9] text-[10px] font-mono opacity-50">
                      [ {inst.short} ]
                    </div>
                  )}
                  <span className="absolute top-3 start-3 inline-block bg-navy/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-brand-200">
                    {inst.type}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start gap-3">
                    {inst.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inst.logoUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 flex-none object-contain"
                      />
                    ) : (
                      <span className="grid h-11 w-11 flex-none place-items-center bg-brand-50 text-[11px] font-extrabold text-navy">
                        {inst.short}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-tight text-navy line-clamp-2">
                        {inst.name}
                      </h3>
                      {inst.area && (
                        <p className="mt-0.5 text-[12px] text-ink-muted">📍 {inst.area}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[28px] font-extrabold text-brand leading-none">
                        {inst.studentsCount}
                      </span>
                      <span className="text-[12px] text-ink-muted">
                        {dict.students.studentsLabel}
                      </span>
                    </div>
                    {inst.website && (
                      <a
                        href={inst.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-bold text-brand hover:text-brand-600"
                      >
                        {dict.students.websiteLabel ?? "Website"} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════ HIGHLIGHTS ════════════════ */}
      <section className="bg-white border-t border-line">
        <div className="container py-[clamp(48px,7vw,84px)]">
          <div className="mb-2 flex items-center gap-4">
            <span className="font-display text-[15px] font-extrabold text-brand">03</span>
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {d.highlightsTitle ?? "Highlights"}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <p className="mb-8 max-w-[62ch] text-[15px] leading-[1.8] text-ink-soft">
            {d.highlightsIntro}
          </p>

          {highlights.length === 0 ? (
            <div className="border border-dashed border-line p-10 text-center text-ink-muted">
              {d.noHighlights}
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {highlights.map((h) => {
                const style = TYPE_STYLE[h.type];
                return (
                  <article
                    key={h.id}
                    className="flex items-stretch gap-0 border border-line bg-white overflow-hidden transition-shadow hover:shadow-card"
                  >
                    {/* Thumbnail square */}
                    <div className="relative flex-none w-[92px] sm:w-[110px] bg-gradient-to-br from-brand-50 to-brand-100">
                      {h.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={h.photoUrl}
                          alt={h.name}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ objectPosition: "center 20%" }}
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <span className="font-display text-[36px] font-extrabold text-brand-600/30">
                            {h.name.slice(0, 1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body — compact list */}
                    <div className="flex flex-1 flex-col justify-center p-3.5 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10.5px] font-bold ${style.bg} ${style.text}`}
                        >
                          {typeLabel(h.type)}
                        </span>
                        {h.year && (
                          <span className="font-display text-[11px] font-bold text-ink-muted">
                            · {h.year}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14.5px] font-extrabold leading-tight text-navy line-clamp-2">
                        {h.headline}
                      </h3>
                      <div className="mt-1 text-[12px] font-semibold text-brand-600 truncate">
                        {h.name}
                        {h.institution && (
                          <span className="text-ink-muted font-medium"> · {h.institution}</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
