"use client";

import { useEffect, useState } from "react";
import type { HighlightItem, HighlightType } from "@/lib/google-sheets";

const TYPE_STYLE: Record<HighlightType, { bg: string; text: string }> = {
  graduation: { bg: "bg-[#E1F4F1]", text: "text-[#0B7068]" },
  scholarship: { bg: "bg-[#FBF3D6]", text: "text-[#7A5A00]" },
  award: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
  welcome: { bg: "bg-brand-50", text: "text-navy" },
  story: { bg: "bg-[#EAF0FB]", text: "text-[#1F55C8]" },
  volunteer: { bg: "bg-[#F4ECE5]", text: "text-[#7A4A1F]" },
};

/**
 * HighlightsGallery — poster-style grid
 *  - รูป (photo_url) เป็น content หลัก แสดง full ไม่ crop
 *  - Type chip เล็กๆ ที่มุมบน
 *  - Caption ใต้รูป: name + year (ถ้ามี)
 *  - Click → lightbox แสดงรูปเต็ม + prev/next navigation
 */
export function HighlightsGallery({
  highlights,
  typeLabels,
  closeLabel,
}: {
  highlights: HighlightItem[];
  /** Object mapping type → label — ผ่านจาก Server Component ได้ (function ผ่านไม่ได้) */
  typeLabels: Record<HighlightType, string>;
  closeLabel: string;
}) {
  const typeLabel = (t: HighlightType) => typeLabels[t] ?? t;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const isOpen = openIdx !== null;
  const total = highlights.length;
  const current = isOpen ? highlights[openIdx!] : null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight")
        setOpenIdx((i) => (i === null ? null : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setOpenIdx((i) => (i === null ? null : (i - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, total]);

  return (
    <>
      {/* ═══════════ POSTER GRID ═══════════ */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {highlights.map((h, i) => {
          const style = TYPE_STYLE[h.type];
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => h.photoUrl && setOpenIdx(i)}
              className="group relative flex flex-col overflow-hidden border border-line bg-white text-start transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5"
            >
              {/* Poster image — natural ratio หรือ aspect 3:4 fallback */}
              <div
                className="relative w-full bg-gradient-to-br from-brand-50 to-brand-100"
                style={{ aspectRatio: h.photoUrl ? undefined : "3 / 4" }}
              >
                {h.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.photoUrl}
                    alt={h.name || h.headline}
                    referrerPolicy="no-referrer"
                    className="block w-full h-auto object-contain transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="font-display text-[72px] font-extrabold text-brand-600/25">
                      {h.name.slice(0, 1)}
                    </span>
                  </div>
                )}
                {/* Type chip — overlay top */}
                <span
                  className={`absolute top-2.5 start-2.5 inline-block px-2 py-0.5 text-[10.5px] font-bold ${style.bg} ${style.text} shadow-sm`}
                >
                  {typeLabel(h.type)}
                </span>
                {/* Year chip — overlay top right */}
                {h.year && (
                  <span className="absolute top-2.5 end-2.5 font-display text-[10.5px] font-bold text-white bg-navy/75 backdrop-blur-sm px-2 py-0.5">
                    {h.year}
                  </span>
                )}
              </div>

              {/* Minimal caption */}
              {(h.name || h.headline) && (
                <div className="p-3 border-t border-line">
                  {h.name && (
                    <div className="text-[13px] font-bold text-navy truncate">
                      {h.name}
                    </div>
                  )}
                  {h.institution && (
                    <div className="mt-0.5 text-[11.5px] text-ink-muted truncate">
                      {h.institution}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════ LIGHTBOX ═══════════ */}
      {isOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIdx(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
        >
          {/* Close */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx(null);
            }}
            aria-label={closeLabel}
            className="absolute top-4 end-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white shadow transition-all duration-200 ease-out hover:bg-white/20 hover:scale-110 hover:rotate-90"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white">
            {openIdx! + 1} / {total}
          </div>

          {/* Image */}
          <div
            className="relative flex max-h-full max-w-full items-center justify-center animate-in modal-pop duration-400"
            onClick={(e) => e.stopPropagation()}
          >
            {current.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photoUrl}
                alt={current.name}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
              />
            )}
          </div>

          {/* Caption below */}
          <div className="mt-4 text-center text-white max-w-[600px] px-4">
            {current.headline && (
              <div className="text-[15px] font-bold">{current.headline}</div>
            )}
            {(current.name || current.institution) && (
              <div className="mt-1 text-[12.5px] text-[#BBDCD9]">
                {current.name}
                {current.institution && ` · ${current.institution}`}
                {current.major && ` · ${current.major}`}
              </div>
            )}
          </div>

          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : (i - 1 + total) % total));
                }}
                aria-label="Previous"
                className="absolute start-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : (i + 1) % total));
                }}
                aria-label="Next"
                className="absolute end-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
