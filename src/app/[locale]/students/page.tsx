import type { Metadata } from "next";
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
import { localeAlternates } from "@/lib/site";
import { InstitutionCard } from "@/components/InstitutionCard";
import { HighlightsGallery } from "@/components/HighlightsGallery";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale);
  const s = dict.students as Record<string, string>;
  return {
    title: s.title,
    description: s.intro,
    alternates: localeAlternates(params.locale, "/students"),
  };
}

/**
 * Our Community page
 *   1. HERO — community-focused title + stats
 *   2. Institution grid (แทน map) — 4 cards พร้อม logo + จำนวน
 *   3. Highlights — เรื่องราว/ผลงาน/รางวัล filter ได้ตาม type
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

/** Parse faculty string เป็น { level | null, name, count }[]
 *  รองรับทั้ง "[ป.ตรี] Engineering:5" และ "ม.4:3"
 */
type FacEntry = { level: string | null; name: string; count: number };
function parseFaculty(raw: string): FacEntry[] {
  return raw
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // อนุญาต space หลัง : (Google Translate ใส่)
      const m = s.match(/^\[([^\]]+)\]\s*(.+?):\s*(\d+)\s*$/);
      if (m) return { level: m[1].trim(), name: m[2].trim(), count: Number(m[3]) };
      const fb = s.match(/^(.+?):\s*(\d+)\s*$/);
      if (fb) return { level: null, name: fb[1].trim(), count: Number(fb[2]) };
      return { level: null, name: s, count: 0 };
    });
}

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
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div
          className="absolute -top-32 -end-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.28), transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -start-40 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(127,216,207,0.14), transparent)",
          }}
        />
        {/* Kuwait Towers silhouette — line style elegant */}
        <svg
          viewBox="0 0 240 220"
          className="absolute end-6 sm:end-16 bottom-0 pointer-events-none"
          style={{
            width: "min(30vw, 280px)",
            height: "min(30vw, 280px)",
            opacity: 0.22,
          }}
          fill="none"
          stroke="#7FD8CF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Tall tower (with 2 spheres + spire) */}
          <line x1="120" y1="220" x2="120" y2="30" />
          <line x1="118" y1="30" x2="122" y2="30" />
          <line x1="120" y1="30" x2="120" y2="12" />
          <circle cx="120" cy="60" r="18" />
          <circle cx="120" cy="110" r="14" />
          {/* Medium tower (1 sphere) */}
          <line x1="170" y1="220" x2="170" y2="85" />
          <circle cx="170" cy="105" r="11" />
          <line x1="170" y1="85" x2="170" y2="72" />
          {/* Short spire */}
          <line x1="200" y1="220" x2="200" y2="115" />
          <line x1="198" y1="115" x2="202" y2="115" />
          <line x1="200" y1="115" x2="200" y2="102" />
          {/* Ground line */}
          <line x1="60" y1="220" x2="230" y2="220" strokeWidth="0.8" opacity="0.6" />
        </svg>

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
              <InstitutionCard
                key={inst.id}
                inst={inst}
                labels={{
                  studentsLabel: dict.students.studentsLabel,
                  websiteLabel: dict.students.websiteLabel ?? "Website",
                  facultyTitle: dict.students.facultyTitle ?? "Faculties",
                  detailLabel: (dict.students as Record<string, string>).detailLabel ?? "View detail",
                }}
              />
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
            <HighlightsGallery
              highlights={highlights}
              typeLabels={{
                graduation: d.typeGraduation ?? "Graduation",
                scholarship: d.typeScholarship ?? "Scholarship",
                award: d.typeAward ?? "Award",
                welcome: d.typeWelcome ?? "Welcome",
                story: d.typeStory ?? "Story",
                volunteer: d.typeVolunteer ?? "Volunteer",
              }}
              closeLabel="Close"
            />
          )}
        </div>
      </section>
    </>
  );
}
