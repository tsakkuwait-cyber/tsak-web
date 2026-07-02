"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ActivityItem } from "@/lib/google-sheets";

const AUDIENCE = {
  all: { bg: "bg-brand-50", text: "text-navy" },
  male: { bg: "bg-[#E3F2F0]", text: "text-[#0B7068]" },
  female: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
} as const;

/** ลด size ของ Drive thumbnail URL เพื่อโหลด grid เร็วขึ้น (w1600 → w400) */
function smallerImg(url: string, size = 400): string {
  return url.replace(/([?&]sz=)w\d+/i, `$1w${size}`);
}

/**
 * ActivityCard — card + modal + full-screen lightbox
 *   Card: thumbnail + date + audience + title + location
 *   Modal (click card): cover + description + "ดูประมวลรูปภาพ" button
 *   Lightbox (click button): full-screen slideshow with prev/next
 *     - ใช้ Portal render ที่ document.body (หลีกเลี่ยง transform bug)
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
  const [contactOpen, setContactOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const aud = AUDIENCE[act.audience];
  const total = act.images.length;
  const coverSrc = act.coverUrl || act.images[0] || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal esc/scroll lock — ESC ปิดตามลำดับ: lightbox → contact → modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxOpen) return; // lightbox มี handler ของตัวเอง
      if (contactOpen) setContactOpen(false);
      else setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, contactOpen, lightboxOpen]);

  // Lightbox esc/nav (ไม่ reset idx — เข้าจาก thumbnail idx ไหน ต้องอยู่ idx นั้น)
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight")
        setImgIdx((i) => (total === 0 ? 0 : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setImgIdx((i) => (total === 0 ? 0 : (i - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, total]);

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
              src={smallerImg(coverSrc, 600)}
              alt={act.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
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

      {/* ═══════ MODAL ═══════ */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[720px] bg-white shadow-2xl my-auto"
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

            {/* Cover image */}
            {coverSrc && (
              <div className="relative bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={act.title}
                  referrerPolicy="no-referrer"
                  className="block w-full max-h-[50vh] object-contain"
                />
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

              {/* text link — ขวาบน เส้นขีด บนสถานที่ */}
              {total > 0 && (
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="group inline-flex items-baseline gap-1.5 text-[13px] font-bold text-brand hover:text-brand-600 transition-colors"
                  >
                    <span className="underline underline-offset-4 decoration-brand/40 group-hover:decoration-brand">
                      {labels.viewPhotos}
                    </span>
                    <span className="font-display opacity-70">· {total}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </button>
                </div>
              )}

              {act.location && (
                <div className="mt-3 border-t border-line pt-4">
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

      {/* ═══════ CONTACT SHEET GRID (Portal — thumbnail overview) ═══════ */}
      {mounted &&
        contactOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setContactOpen(false)}
            className="fixed inset-0 z-[150] flex flex-col bg-navy/95 backdrop-blur-md animate-in fade-in duration-300"
          >
            {/* Header */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy-dark px-4 sm:px-8 py-4 flex-none"
            >
              <div className="min-w-0">
                <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-brand-200">
                  {labels.viewPhotos} · {total}
                </div>
                <h3 className="mt-0.5 truncate text-[15px] sm:text-[17px] font-bold text-white">
                  {act.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                aria-label={labels.closeLabel}
                className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:rotate-90"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Grid */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-4 sm:p-8"
            >
              <div className="mx-auto max-w-[1200px] grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {act.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImgIdx(i);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-[4/3] overflow-hidden bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={smallerImg(src, 400)}
                      alt={`${act.title} ${i + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.06]"
                    />
                    <span className="absolute bottom-1.5 end-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-70 group-hover:opacity-100 transition-opacity">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ═══════ FULLSCREEN LIGHTBOX (Portal to body) ═══════ */}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300"
          >
            {/* Close */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              aria-label={labels.closeLabel}
              className="absolute top-4 end-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:rotate-90"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute top-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white">
              {imgIdx + 1} / {total}
            </div>

            {/* Image */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full max-w-full items-center justify-center"
            >
              {act.images[imgIdx] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={act.images[imgIdx]}
                  alt={`${act.title} ${imgIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[85vh] max-w-[92vw] object-contain shadow-2xl"
                />
              )}
            </div>

            {/* Prev/Next */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx((i) => (i - 1 + total) % total);
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
                    setImgIdx((i) => (i + 1) % total);
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
          </div>,
          document.body
        )}
    </>
  );
}
