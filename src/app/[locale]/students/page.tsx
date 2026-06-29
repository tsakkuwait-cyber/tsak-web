import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getInstitutions, getStats } from "@/lib/google-sheets";
import { KuwaitMap } from "@/components/KuwaitMap";

/**
 * Students — petrol design
 *   Hero (petrol bg + total/male/female stats)
 *   Institution grid (top-border accent cards)
 *   Breakdown by level (horizontal bar chart-like rows)
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 3600
);

export default async function StudentsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, stats, institutions] = await Promise.all([
    getDictionary(locale),
    getStats(locale),
    getInstitutions(locale),
  ]);

  const total = stats.find((s) => s.key === "members")?.display ?? "58";
  const male = stats.find((s) => s.key === "male")?.display ?? "29";
  const female = stats.find((s) => s.key === "female")?.display ?? "29";

  // pre-compute total numeric for percentage
  const totalNum =
    institutions.reduce((sum, i) => sum + i.studentsCount, 0) || 1;

  return (
    <>
      {/* ── HERO (petrol bg) ────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* Kuwait map outline decorative */}
        <svg
          viewBox="0 0 100 100"
          className="absolute -end-7 -bottom-12 pointer-events-none"
          style={{
            width: "min(40vw, 420px)",
            height: "min(40vw, 420px)",
            opacity: 0.1,
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

        <div className="container relative flex flex-wrap items-end justify-between gap-8 py-[clamp(40px,5vw,64px)]">
          <div className="flex-1 basis-[440px] min-w-[300px]">
            <div className="mb-[18px] flex items-center gap-3.5">
              <span className="font-display text-[14px] font-extrabold text-brand-200">
                01
              </span>
              <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-200">
                {dict.nav.students}
              </span>
            </div>
            <h1 className="m-0 max-w-[18ch] text-[clamp(27px,3.6vw,42px)] font-extrabold leading-[1.18]">
              {dict.students.title}
            </h1>
            <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.8] text-[#BBDCD9]">
              {dict.students.intro}
            </p>
          </div>

          {/* RIGHT: stats group */}
          <div className="flex flex-none items-end gap-[26px]">
            <div>
              <div className="font-display text-[clamp(52px,7vw,76px)] font-extrabold leading-[0.9] text-brand-200">
                {total}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#BBDCD9]">
                {dict.students.totalLabel}
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[22px] font-extrabold text-white">
                  {male}
                </span>
                <span className="text-[12.5px] text-[#BBDCD9]">
                  {dict.students.maleLabel}
                </span>
              </div>
              <div className="h-px w-16 bg-white/20" />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[22px] font-extrabold text-white">
                  {female}
                </span>
                <span className="text-[12.5px] text-[#BBDCD9]">
                  {dict.students.femaleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KUWAIT MAP + INSTITUTION DETAIL ─────────────── */}
      <section className="container py-[clamp(36px,5vw,60px)]">
        {institutions.length === 0 ? (
          <div className="border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            {dict.students.comingSoon}
          </div>
        ) : (
          <KuwaitMap
            institutions={institutions}
            labels={{
              mapNote: dict.students.mapNote ?? "Kuwait map",
              gulf: dict.students.gulf ?? "Arabian Gulf",
              studentsLabel: dict.students.studentsLabel,
              areaLabel: dict.students.areaLabel ?? "Area",
              facultyTitle: dict.students.facultyTitle ?? "Faculty",
              websiteLabel: dict.students.websiteLabel ?? "Website",
            }}
          />
        )}
      </section>

      {/* ── BREAKDOWN BY INSTITUTION (bar chart style) ─── */}
      {institutions.length > 0 && (
        <section className="bg-white border-t border-line">
          <div className="container py-[clamp(48px,7vw,84px)]">
            <div className="mb-7 flex items-center gap-4">
              <span className="font-display text-[15px] font-extrabold text-brand">
                02
              </span>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-brand-600">
                Breakdown
              </span>
              <span className="flex-1 h-px bg-line" />
            </div>

            <div className="border-t-2 border-navy">
              {institutions.map((inst) => {
                const pct = Math.round((inst.studentsCount / totalNum) * 100);
                return (
                  <div
                    key={inst.id}
                    className="border-b border-line py-[clamp(16px,2vw,22px)]"
                  >
                    <div className="flex items-center gap-[clamp(12px,2vw,24px)]">
                      <span
                        className="flex-none text-[clamp(14px,1.7vw,17px)] font-bold text-navy"
                        style={{ width: "clamp(110px, 16vw, 180px)" }}
                      >
                        {inst.name}
                      </span>
                      <div className="relative flex-1 h-3 min-w-[60px] overflow-hidden bg-brand-50">
                        <div
                          className="absolute inset-y-0 start-0 bg-gradient-to-r from-brand to-brand-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="flex-none w-[52px] text-end font-display text-[22px] font-extrabold text-brand">
                        {inst.studentsCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
