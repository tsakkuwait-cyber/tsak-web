import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getActivities, type ActivityItem } from "@/lib/google-sheets";
import { ActivityCard } from "@/components/ActivityCard";

/**
 * Activities — image-focused grid (เน้นรูป) + audience tag chip
 *   - Numbered hero
 *   - แต่ละปี → grid 3-col card layout
 *   - การ์ด: รูปใหญ่ 16/10 + date + audience tag + title + desc (clamp 2)
 *   - audience: all (default), male, female → chip สีต่าง
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

// Audience badge meta — palette + label key
const AUDIENCE = {
  all: { bg: "bg-brand-50", text: "text-navy", labelKey: "audienceAll" },
  male: { bg: "bg-[#E3F2F0]", text: "text-[#0B7068]", labelKey: "audienceMale" },
  female: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]", labelKey: "audienceFemale" },
} as const;

export default async function ActivitiesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, activities] = await Promise.all([
    getDictionary(locale),
    getActivities(locale),
  ]);

  // จัดกลุ่มตามปี
  const byYear = activities.reduce<Record<string, ActivityItem[]>>((acc, act) => {
    const year = (act.date || "").slice(0, 4) || "—";
    (acc[year] ||= []).push(act);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => (a < b ? 1 : -1));

  const audienceLabel = (a: ActivityItem["audience"]) =>
    (dict.activities as Record<string, string>)[AUDIENCE[a].labelKey] ?? a;

  return (
    <>
      {/* ── Numbered hero with subtle theme bg ───────── */}
      <section className="relative overflow-hidden">
        {/* Subtle orb glow */}
        <div
          className="absolute -top-32 -end-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(closest-side, rgba(16,150,141,0.10), transparent)",
          }}
        />
        {/* Kuwait skyline outline — bottom decorative */}
        <svg
          viewBox="0 0 400 80"
          className="absolute end-0 bottom-0 pointer-events-none"
          style={{ width: "min(50vw, 420px)", height: "80px", opacity: 0.12 }}
          fill="none"
          stroke="#0C3B45"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <line x1="60" y1="80" x2="60" y2="45" />
          <line x1="90" y1="80" x2="90" y2="30" />
          <circle cx="90" cy="22" r="5" />
          <line x1="120" y1="80" x2="120" y2="52" />
          <line x1="145" y1="80" x2="145" y2="40" />
          <circle cx="145" cy="34" r="4" />
          <line x1="170" y1="80" x2="170" y2="48" />
          <line x1="195" y1="80" x2="195" y2="35" />
          <line x1="220" y1="80" x2="220" y2="42" />
          <line x1="245" y1="80" x2="245" y2="50" />
          <line x1="0" y1="80" x2="400" y2="80" strokeWidth="0.6" opacity="0.5" />
        </svg>

        <div className="container relative pt-[clamp(44px,6vw,72px)] pb-[clamp(28px,4vw,44px)]">
          <div className="mb-4 flex items-center gap-3.5">
            <span className="font-display text-[14px] font-extrabold text-brand">01</span>
            <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {dict.nav.activities}
            </span>
          </div>
          <h1 className="m-0 max-w-[18ch] text-[clamp(27px,3.6vw,42px)] font-extrabold leading-[1.18] text-navy">
            {dict.activities.title}
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-[16px] leading-[1.8] text-ink-soft">
            {dict.activities.intro}
          </p>
        </div>
      </section>

      {/* ── Year filter (anchor links) + Grid ───────────── */}
      <section className="container pb-[clamp(48px,7vw,84px)]">
        {activities.length === 0 ? (
          <div className="border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            {dict.activities.noEvents}
          </div>
        ) : (
          <>
            {/* Year tab bar */}
            <div className="mb-8 flex flex-wrap gap-1.5 border-b-2 border-navy">
              {years.map((year, idx) => (
                <a
                  key={year}
                  href={`#year-${year}`}
                  className={[
                    "relative inline-block px-[18px] py-3 text-[15px]",
                    idx === 0
                      ? "font-bold text-brand"
                      : "font-medium text-ink-muted hover:text-navy",
                  ].join(" ")}
                >
                  {year}
                  {idx === 0 && (
                    <span className="absolute inset-x-0 -bottom-[2px] h-[3px] bg-brand" />
                  )}
                </a>
              ))}
            </div>

            {/* Year sections — image-focused grid */}
            {years.map((year) => (
              <div key={year} id={`year-${year}`} className="mb-12 last:mb-0">
                {/* small year label */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-display text-[14px] font-bold text-brand-600">
                    {year}
                  </span>
                  <span className="text-[12.5px] text-ink-muted">
                    · {byYear[year].length} {dict.nav.activities}
                  </span>
                  <span className="flex-1 h-px bg-line" />
                </div>

                <div
                  className="grid gap-3 sm:gap-6"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  }}
                >
                  {byYear[year].map((act) => (
                    <ActivityCard
                      key={act.id}
                      act={act}
                      labels={{
                        audienceLabel: audienceLabel(act.audience),
                        viewPhotos: dict.activities.viewPhotos,
                        closeLabel: "Close",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}
