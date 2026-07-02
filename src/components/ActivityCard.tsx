"use client";

import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/google-sheets";

const AUDIENCE = {
  all: { bg: "bg-brand-50", text: "text-navy" },
  male: { bg: "bg-[#E3F2F0]", text: "text-[#0B7068]" },
  female: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
} as const;

/**
 * ActivityCard — compact card + modal พร้อม inline gallery
 *   Card: photo + date + audience + title + location
 *   Click → modal เด้ง:
 *     - Big main image (ปรับ index ได้)
 *     - Thumbnails strip (scroll แนวนอน)
 *     - Description เต็ม + metadata
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
  const [imgIdx, setImgIdx] = useState(0);
  const aud = AUDIENCE[act.audience];
  const total = act.images.length;
  const currentImg = act.images[imgIdx];

  useEffect(() => {
    if (!open) return;
    setImgIdx(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight")
        setImgIdx((i) => (total === 0 ? 0 : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setImgIdx((i) => (total === 0 ? 0 : (i - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, total]);

  const coverSrc = act.coverUrl || act.images[0] || "";

  return (
    <>
      {/* ═══════ CARD ═══════ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-row sm:flex-col border border-line bg-white text-start overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="relative flex-none w-[110px] aspect-square sm:w-full sm:aspect-[16/10]">
          {coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverSrc}
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
          {total > 1 && (
            <span className="absolute top-2 end-2 sm:top-3 sm:end-3 z-[2] inline-flex items-center gap-1 bg-black/65 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur-sm">
              📷 {total}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-[18px] min-w-0">
          <time className="font-display text-[11.5px] sm:text-[12.5px] font-bold text-brand-600">
            {act.date}
          </time>
          <h3 className="mt-1 sm:mt-2 text-[14.5px] sm:text-[17px] font-bold leading-snug text-navy line-clamp-2">
            {act.title}
          </h3>
          {act.location && (
            <p className="mt-auto pt-2 text-[11.5px] sm:text-[12px] text-ink-subtle">
              📍 {act.location}
            </p>
          )}
        </div>
      </button>

      {/* ═══════ MODAL — inline gallery ═══════ */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[840px] bg-white shadow-2xl animate-in fade-in duration-300 my-auto"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.closeLabel}
              className="absolute top-3 end-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-navy shadow-md transition-all duration-200 ease-out hover:bg-white hover:scale-110 hover:rotate-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Big main image */}
            {currentImg ? (
              <div className="relative bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImg}
                  alt={act.title}
                  referrerPolicy="no-referrer"
                  className="block w-full max-h-[60vh] object-contain"
                />
                {/* Nav arrows */}
                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i - 1 + total) % total)}
                      aria-label="Previous"
                      className="absolute start-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-navy shadow hover:bg-white hover:scale-110 transition-all duration-200"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i + 1) % total)}
                      aria-label="Next"
                      className="absolute end-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-navy shadow hover:bg-white hover:scale-110 transition-all duration-200"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                    {/* Counter */}
                    <div className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-[12px] font-semibold">
                      {imgIdx + 1} / {total}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                className="grid place-items-center h-48 text-[13px] text-ink-subtle"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg,#E4ECF4 0 12px,#F1F6FB 12px 24px)",
                }}
              >
                🎉 (no photos)
              </div>
            )}

            {/* Thumbnails strip */}
            {total > 1 && (
              <div className="border-b border-line bg-canvas p-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {act.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      className={`flex-none aspect-square w-16 sm:w-20 overflow-hidden transition-all ${
                        i === imgIdx
                          ? "ring-2 ring-brand ring-offset-1"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
