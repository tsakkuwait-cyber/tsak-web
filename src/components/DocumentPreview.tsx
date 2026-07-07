"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { DocumentItem } from "@/lib/google-sheets";

/**
 * DocumentPreview — modal fullscreen ที่ฝัง Drive PDF viewer
 *   Portal render ที่ document.body → หลีกเลี่ยง z-index conflict
 *   iframe ใช้ Drive viewer ที่รองรับ filename ภาษาไทย
 */
export function DocumentPreview({
  doc,
  labels,
  triggerClassName,
  triggerContent,
}: {
  doc: DocumentItem;
  labels: {
    previewLabel: string;
    downloadLabel: string;
    closeLabel: string;
  };
  triggerClassName: string;
  triggerContent: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!doc.fileId) return null;

  const previewUrl = `https://drive.google.com/file/d/${doc.fileId}/preview`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {triggerContent}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] flex flex-col bg-navy-dark/95 backdrop-blur-md animate-in fade-in duration-300"
          >
            {/* Header */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy px-4 sm:px-8 py-3.5 flex-none"
            >
              <div className="min-w-0">
                {doc.category && (
                  <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-brand-200">
                    {doc.category}
                  </div>
                )}
                <h3 className="mt-0.5 truncate text-[15px] sm:text-[17px] font-bold text-white">
                  {doc.title}
                </h3>
              </div>
              <div className="flex-none flex items-center gap-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-brand px-4 py-2 text-[12.5px] font-bold text-white hover:bg-brand-600 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {labels.downloadLabel}
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={labels.closeLabel}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:rotate-90"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe — Drive PDF viewer */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-black overflow-hidden"
            >
              <iframe
                src={previewUrl}
                title={doc.title}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>

            {/* Mobile download button — sticky bottom */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="sm:hidden flex-none border-t border-white/10 bg-navy p-3"
            >
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-brand w-full py-3 text-[14px] font-bold text-white hover:bg-brand-600 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                {labels.downloadLabel}
              </a>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
