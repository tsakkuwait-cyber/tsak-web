"use client";

import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/google-sheets";
import { ActivityGallery } from "./ActivityGallery";

const AUDIENCE = {
  all: { bg: "bg-brand-50", text: "text-navy" },
  male: { bg: "bg-[#E3F2F0]", text: "text-[#0B7068]" },
  female: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
} as const;

/**
 * ActivityCard — compact card ที่คลิกได้ + modal เด้ง detail เต็ม
 *  - Card mobile: horizontal (รูปซ้าย + text ขวา)
 *  - Card desktop: vertical
 *  - Click → modal: photo gallery + full description + metadata
 */
export function ActivityCard({
  act,
  labels,
}: {
  act: ActivityItem;
  labels: {
    audienceLabel: string;
    viewPhotos: string;
    closeLabel: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const aud = AUDIENCE[act.audience];

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

  return (
    <>
      {/* ═══════ CARD ═══════ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-row sm:flex-col border border-line bg-white text-start overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {/* IMAGE */}
        <div className="relative flex-none w-[110px] aspect-square sm:w-full sm:aspect-[16/10]">
          {act.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={act.images[0]}
              alt={act.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-[11px] text-ink-subtle"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg,#E4ECF4 0 12px,#F1F6FB 12px 24px)",
              }}
            >
              [ photo ]
            </div>
          )}
          <span
            className={`absolute top-2 start-2 sm:top-3 sm:start-3 z-[2] inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11.5px] font-bold ${aud.bg} ${aud.text}`}
          >
            {labels.audienceLabel}
          </span>
          {act.images.length > 1 && (
            <span className="absolute top-2 end-2 sm:top-3 sm:end-3 z-[2] inline-flex items-center gap-1 bg-black/65 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur-sm">
              📷 +{act.images.length - 1}
            </span>
          )}
        </div>

        {/* TEXT */}
        <div className="flex flex-1 flex-col p-3 sm:p-[18px] min-w-0">
          <time className="font-display text-[11.5px] sm:text-[12.5px] font-bold text-brand-600">
            {act.date}
          </time>
          <h3 className="mt-1 sm:mt-2 text-[14.5px] sm:text-[17px] font-bold leading-snug text-navy line-clamp-2">
            {act.title}
          </h3>
          {act.description && (
            <p className="mt-1 text-[12.5px] sm:text-[13.5px] leading-snug text-ink-muted line-clamp-2">
              {act.description}
            </p>
          )}
          {act.location && (
            <p className="mt-1.5 sm:mt-2 text-[11.5px] sm:text-[12px] text-ink-subtle">
              📍 {act.location}
            </p>
          )}
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
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.closeLabel}
              className="absolute top-3 end-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-navy shadow-md transition-all duration-200 ease-out hover:bg-white hover:scale-110 hover:rotate-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Gallery (reuse existing component) */}
            <div className="relative">
              <ActivityGallery images={act.images} alt={act.title} emptyEmoji="🎉" />
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 flex-wrap">
                <time className="font-display text-[13px] font-bold text-brand-600">
                  {act.date}
                </time>
                <span
                  className={`inline-block px-2.5 py-1 text-[11px] font-bold ${aud.bg} ${aud.text}`}
                >
                  {labels.audienceLabel}
                </span>
              </div>

              <h2 className="mt-3 text-[22px] sm:text-[26px] font-extrabold leading-tight text-navy">
                {act.title}
              </h2>

              {act.description && (
                <p className="mt-4 text-[14.5px] sm:text-[15.5px] leading-[1.85] text-ink-soft whitespace-pre-line">
                  {act.description}
                </p>
              )}

              {act.location && (
                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-[13px] text-ink-muted">
                    <span className="font-bold text-navy">📍 </span>
                    {act.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
