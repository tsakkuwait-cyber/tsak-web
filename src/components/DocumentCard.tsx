"use client";

import { useState } from "react";
import type { DocumentItem } from "@/lib/google-sheets";
import { DocumentPreview } from "./DocumentPreview";

/**
 * DocumentCard — vertical card (cover ด้านบน + text ด้านล่าง)
 *   3 cases:
 *     1. Drive PDF (มี fileId) → คลิก card → preview modal + ปุ่ม download
 *     2. External link (fileUrl แต่ไม่มี fileId) → คลิก card → เปิด link ใน tab ใหม่
 *     3. ไม่มี URL → static card
 */
export function DocumentCard({
  doc,
  labels,
}: {
  doc: DocumentItem;
  labels: {
    downloadLabel: string;
    previewLabel: string;
    closeLabel: string;
    openLinkLabel: string;
    pinnedLabel?: string;
  };
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = doc.coverUrl && !imgError;
  const isExternalLink = !doc.fileId && !!doc.fileUrl;
  const actionLabel = isExternalLink ? labels.openLinkLabel : labels.downloadLabel;

  const cardContent = (
    <>
      <div
        className="relative bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden"
        style={{ aspectRatio: "4 / 3" }}
      >
        {/* Backdrop — Icon ที่แสดงเสมอ · img (ถ้ามี) จะทับด้านบน */}
        <div className="absolute inset-0 grid place-items-center">
          {isExternalLink ? <LinkIcon /> : <PDFIcon />}
        </div>
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.coverUrl}
            alt={doc.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.05]"
          />
        )}
        {doc.category && (
          <span className="absolute top-2 start-2 sm:top-3 sm:start-3 inline-block bg-navy/85 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10.5px] font-bold tracking-wider uppercase text-brand-200">
            {doc.category}
          </span>
        )}
        {doc.pinned && labels.pinnedLabel && (
          <span className="absolute top-2 end-2 sm:top-3 sm:end-3 inline-flex items-center gap-1 bg-brand text-white px-1.5 py-0.5 text-[9px] sm:text-[10.5px] font-bold">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
            </svg>
            <span className="hidden sm:inline">{labels.pinnedLabel}</span>
          </span>
        )}
        {/* Hover overlay — desktop only */}
        <div className="hidden sm:grid absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-300 place-items-center opacity-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 bg-white text-navy px-4 py-2 text-[12.5px] font-bold shadow-lg">
            {isExternalLink ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
            {isExternalLink ? labels.openLinkLabel : labels.previewLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5 text-start min-w-0">
        <h3 className="text-[13px] sm:text-[16.5px] font-bold leading-snug text-navy line-clamp-2">
          {doc.title}
        </h3>
        {doc.description && (
          <p className="mt-1.5 sm:mt-2 flex-1 text-[11.5px] sm:text-[13px] leading-relaxed text-ink-soft">
            {doc.description}
          </p>
        )}
        <div className="mt-2 sm:mt-4 flex items-center justify-between gap-2">
          {doc.date && (
            <time className="font-display text-[10px] sm:text-[11.5px] font-bold text-ink-subtle">
              {doc.date}
            </time>
          )}
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10.5px] sm:text-[12.5px] font-bold text-brand hover:text-brand-600 transition-colors z-[2] relative whitespace-nowrap"
          >
            {isExternalLink ? (
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-[14px] sm:h-[14px]"
              >
                <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            ) : (
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-[14px] sm:h-[14px]"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            )}
            {actionLabel}
          </a>
        </div>
      </div>
    </>
  );

  // Case 1: Drive PDF → click card → preview modal
  if (doc.fileId) {
    return (
      <article className="group relative flex flex-col border border-line bg-white overflow-hidden transition-all duration-300 hover:border-brand hover:shadow-soft hover:-translate-y-0.5">
        <DocumentPreview
          doc={doc}
          labels={{
            previewLabel: labels.previewLabel,
            downloadLabel: labels.downloadLabel,
            closeLabel: labels.closeLabel,
          }}
          triggerClassName="flex flex-col text-start w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          triggerContent={cardContent}
        />
      </article>
    );
  }

  // Case 2: External link → click card → open in new tab
  if (isExternalLink) {
    return (
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col border border-line bg-white overflow-hidden transition-all duration-300 hover:border-brand hover:shadow-soft hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {cardContent}
      </a>
    );
  }

  // Case 3: No URL → static card (fallback, shouldn't happen normally)
  return (
    <article className="group relative flex flex-col border border-line bg-white overflow-hidden transition-all duration-300 hover:border-brand hover:shadow-soft hover:-translate-y-0.5">
      {cardContent}
    </article>
  );
}

function LinkIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand/60 sm:w-[72px] sm:h-[72px]"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PDFIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand/60 sm:w-[72px] sm:h-[72px]"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="4.5"
        fontWeight="800"
        fill="currentColor"
        stroke="none"
      >
        PDF
      </text>
    </svg>
  );
}
