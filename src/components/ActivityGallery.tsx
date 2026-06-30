"use client";

import { useEffect, useState } from "react";

/**
 * ActivityGallery — thumbnail การ์ด + lightbox แกลเลอรี่
 * - แสดงรูปแรกเป็น thumbnail
 * - ถ้ามีหลายรูป → badge "+N" + 📷 ที่มุมขวาบน
 * - คลิก → เปิด lightbox แสดงทุกรูป มีลูกศร prev/next
 * - กด Esc / คลิกพื้นหลัง → ปิด
 */
export function ActivityGallery({
  images,
  alt,
  emptyEmoji = "🎉",
}: {
  images: string[];
  alt: string;
  emptyEmoji?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const isOpen = openIdx !== null;
  const total = images.length;

  // ─ keyboard nav + body scroll lock ─
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

  // ── ไม่มีรูป — placeholder ──
  if (total === 0) {
    return (
      <div className="grid h-48 w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700">
        <span className="text-[40px]">{emptyEmoji}</span>
      </div>
    );
  }

  return (
    <>
      {/* THUMBNAIL */}
      <button
        type="button"
        onClick={() => setOpenIdx(0)}
        className="group relative block h-48 w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={alt}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.05]"
        />
        {total > 1 && (
          <span className="absolute top-3 end-3 inline-flex items-center gap-1.5 rounded-sm bg-black/65 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            +{total - 1}
          </span>
        )}
      </button>

      {/* LIGHTBOX MODAL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIdx(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
        >
          {/* Close (top-right) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx(null);
            }}
            aria-label="Close"
            className="absolute top-4 end-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* Counter (top-center) */}
          <div className="absolute top-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white">
            {openIdx! + 1} / {total}
          </div>

          {/* Image */}
          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[openIdx!]}
              alt={`${alt} ${openIdx! + 1}`}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : (i - 1 + total) % total));
                }}
                aria-label="Previous"
                className="absolute start-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
                className="absolute end-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
