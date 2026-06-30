import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getInstitutions, getStats } from "@/lib/google-sheets";
import { KuwaitMap } from "@/components/KuwaitMap";

/**
 * Students page
 *   1. HERO — ไม่ระบุตัวเลขซ้ำ (อยู่ใน stats ด้านขวาแล้ว) + bg pattern
 *   2. KUWAIT MAP + INSTITUTION DETAIL
 *   (3.) Achievements placeholder — รอข้อมูล
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
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

  const statByKey = Object.fromEntries(stats.map((s) => [s.key, s]));
  const total = statByKey["members"]?.display ?? "—";
  const male = statByKey["male"]?.display ?? "—";
  const female = statByKey["female"]?.display ?? "—";

  return (
    <>
      {/* ════════════════════════════════════════════════════
            HERO — clean copy + decorative pattern bg
         ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,216,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(127,216,207,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Hero glow */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        {/* Kuwait outline decorative */}
        <svg
          viewBox="0 0 100 100"
          className="absolute -end-12 -bottom-16 pointer-events-none"
          style={{
            width: "min(46vw, 480px)",
            height: "min(46vw, 480px)",
            opacity: 0.12,
          }}
        >
          <path
            d="M 12 14 L 38 12 L 60 11 L 68 13 L 70 22 L 72 30 L 64 38 L 56 44 L 64 48 L 72 52 L 76 62 L 74 75 L 68 83 L 50 85 L 28 82 L 12 75 L 8 52 L 10 30 Z"
            fill="none"
            stroke="#7FD8CF"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>

        <div className="container relative flex flex-wrap items-end justify-between gap-8 py-[clamp(52px,7vw,84px)]">
          <div className="flex-1 basis-[440px] min-w-[300px]">
            <div className="mb-[18px] flex items-center gap-3.5">
              <span className="font-display text-[14px] font-extrabold text-brand-200">
                01
              </span>
              <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-200">
                {dict.nav.students}
              </span>
            </div>
            <h1 className="m-0 max-w-[20ch] text-[clamp(28px,3.8vw,46px)] font-extrabold leading-[1.15]">
              {dict.students.title}
            </h1>
          </div>

          {/* Stats block — single source of truth */}
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

      {/* ════════════════════════════════════════════════════
            KUWAIT MAP + INSTITUTION DETAIL
         ════════════════════════════════════════════════════ */}
      <section className="container py-[clamp(40px,5vw,68px)]">
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
    </>
  );
}
