import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getDocuments } from "@/lib/google-sheets";
import { ResourcesFilter } from "@/components/ResourcesFilter";

/**
 * Resources page — คลังเอกสาร
 *   Grid: mobile 1 col / tablet 2 / desktop 3
 *   Filter: category chips (client component)
 *   Card: cover/PDF icon + category badge + title + desc + date + download button
 */
export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

export default async function ResourcesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, documents] = await Promise.all([
    getDictionary(locale),
    getDocuments(locale),
  ]);

  const r = dict.resources as Record<string, string>;
  const categories = Array.from(
    new Set(documents.map((d) => d.category).filter(Boolean))
  );

  return (
    <>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-32 -end-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,150,141,0.10), transparent)",
          }}
        />
        <div className="container relative pt-[clamp(44px,6vw,72px)] pb-[clamp(28px,4vw,40px)]">
          <div className="mb-4 flex items-center gap-3.5">
            <span className="font-display text-[14px] font-extrabold text-brand">
              05
            </span>
            <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-600">
              {r.kicker}
            </span>
          </div>
          <h1 className="m-0 max-w-[20ch] text-[clamp(27px,3.6vw,42px)] font-extrabold leading-[1.18] text-navy">
            {r.title}
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-[16px] leading-[1.8] text-ink-soft">
            {r.intro}
          </p>
        </div>
      </section>

      {/* ── CONTENT ─────────────────────────────────── */}
      <section className="container pb-[clamp(48px,7vw,84px)]">
        {documents.length === 0 ? (
          <div className="border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            {r.noItems}
          </div>
        ) : (
          <ResourcesFilter
            documents={documents}
            categories={categories}
            labels={{
              filterAll: r.filterAll,
              downloadLabel: r.downloadLabel,
              previewLabel: r.previewLabel,
              openLinkLabel: r.openLinkLabel,
              closeLabel: r.closeLabel,
              pinnedLabel: r.pinnedLabel,
              searchPlaceholder: r.searchPlaceholder,
              noMatch: r.noMatch,
              clearLabel: r.clearLabel,
            }}
          />
        )}
      </section>
    </>
  );
}
