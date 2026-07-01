"use client";

import { useEffect, useState } from "react";
import type { InstitutionItem } from "@/lib/google-sheets";

type FacEntry = { level: string | null; name: string; count: number };
function parseFaculty(raw: string): FacEntry[] {
  return raw
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^\[([^\]]+)\]\s*(.+?):\s*(\d+)\s*$/);
      if (m) return { level: m[1].trim(), name: m[2].trim(), count: Number(m[3]) };
      const fb = s.match(/^(.+?):\s*(\d+)\s*$/);
      if (fb) return { level: null, name: fb[1].trim(), count: Number(fb[2]) };
      return { level: null, name: s, count: 0 };
    });
}

/**
 * InstitutionCard — clickable card + detail modal
 * - Card แบบเรียบ: photo + logo + name + count
 * - คลิก → modal เด้งขึ้นมาแสดงรายละเอียดครบ + faculty grouped by degree
 */
export function InstitutionCard({
  inst,
  labels,
}: {
  inst: InstitutionItem;
  labels: {
    studentsLabel: string;
    websiteLabel: string;
    facultyTitle: string;
    detailLabel: string;
  };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const facultyItems = inst.faculty ? parseFaculty(inst.faculty) : [];
  const hasLevels = facultyItems.some((f) => f.level !== null);
  const groups = facultyItems.reduce<Map<string, FacEntry[]>>((acc, f) => {
    const key = f.level ?? "__none__";
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(f);
    return acc;
  }, new Map());

  return (
    <>
      {/* ═══════ CARD ═══════ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-col overflow-hidden border border-line bg-white text-start transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {/* Cover photo */}
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
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[#BBDCD9] text-[10px] font-mono opacity-50">
              [ {inst.short} ]
            </div>
          )}
          <span className="absolute top-3 start-3 inline-block bg-navy/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-brand-200">
            {inst.type}
          </span>
          {/* View detail hint — slide up on hover */}
          <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 bg-white/95 px-2.5 py-1 text-[10.5px] font-bold text-navy shadow-md opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
            {labels.detailLabel} →
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
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

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[28px] font-extrabold text-brand leading-none">
                {inst.studentsCount}
              </span>
              <span className="text-[12px] text-ink-muted">{labels.studentsLabel}</span>
            </div>
            {facultyItems.length > 0 && (
              <span className="text-[11.5px] font-bold text-brand-600">
                {facultyItems.length} {labels.facultyTitle}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* ═══════ MODAL ═══════ */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto bg-white shadow-2xl animate-in modal-pop duration-400"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 end-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-navy shadow-md transition-all duration-200 ease-out hover:bg-white hover:scale-110 hover:rotate-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Cover photo — large */}
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
                <div className="absolute inset-0 grid place-items-center text-[#BBDCD9] text-[12px] font-mono opacity-50">
                  [ {inst.short} ]
                </div>
              )}
              <span className="absolute top-4 start-4 inline-block bg-navy/85 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-brand-200">
                {inst.type}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                {inst.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inst.logoUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 sm:h-20 sm:w-20 flex-none object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-[22px] sm:text-[26px] font-extrabold leading-tight text-navy">
                    {inst.name}
                  </h2>
                  {inst.area && (
                    <p className="mt-1 text-[14px] text-ink-muted">📍 {inst.area}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[48px] font-extrabold text-brand leading-none">
                    {inst.studentsCount}
                  </span>
                  <span className="text-[13px] font-semibold text-ink-muted">
                    {labels.studentsLabel}
                  </span>
                </div>
                {inst.website && (
                  <a
                    href={inst.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-brand px-5 py-2.5 text-[13px] font-bold text-white hover:bg-brand-600 transition-colors"
                  >
                    {labels.websiteLabel} →
                  </a>
                )}
              </div>

              {/* Faculty breakdown */}
              {facultyItems.length > 0 && (
                <div className="mt-8 border-t border-line pt-6">
                  <div className="text-[12px] font-bold tracking-wider uppercase text-brand-600 mb-4">
                    {labels.facultyTitle}
                  </div>
                  <div className="space-y-4">
                    {Array.from(groups.entries()).map(([key, list]) => {
                      const groupTotal = list.reduce((s, f) => s + f.count, 0);
                      return (
                        <div key={key}>
                          {hasLevels && key !== "__none__" && (
                            <div className="mb-2 flex items-baseline gap-2">
                              <span className="inline-block bg-navy px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-white">
                                {key}
                              </span>
                              <span className="font-display text-[12px] font-bold text-brand-600">
                                {groupTotal} {labels.studentsLabel}
                              </span>
                            </div>
                          )}
                          <div className="space-y-2">
                            {list.map((f, i) => {
                              const pct = groupTotal > 0 ? (f.count / groupTotal) * 100 : 0;
                              return (
                                <div key={i}>
                                  <div className="mb-1 flex items-baseline justify-between gap-2">
                                    <span className="text-[13.5px] font-semibold text-navy truncate">
                                      {f.name}
                                    </span>
                                    <span className="font-display text-[13.5px] font-bold text-brand">
                                      {f.count}
                                    </span>
                                  </div>
                                  <div className="relative h-1.5 overflow-hidden bg-brand-50">
                                    <div
                                      className="absolute inset-y-0 start-0 bg-gradient-to-r from-brand to-brand-600"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
