import type { DocumentItem } from "@/lib/google-sheets";
import { DocumentPreview } from "./DocumentPreview";

/**
 * DocumentCard — reusable card สำหรับ /resources และ Home preview
 *   Primary action: Preview (opens Drive viewer in modal — รองรับชื่อไทย)
 *   Secondary action: Download (direct link ถ้าอยากดาวน์โหลดตรง)
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
    pinnedLabel?: string;
  };
}) {
  const cardContent = (
    <>
      <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
        {doc.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.coverUrl}
            alt={doc.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <PDFIcon />
          </div>
        )}
        {doc.category && (
          <span className="absolute top-3 start-3 inline-block bg-navy/85 backdrop-blur-sm px-2.5 py-1 text-[10.5px] font-bold tracking-wider uppercase text-brand-200">
            {doc.category}
          </span>
        )}
        {doc.pinned && labels.pinnedLabel && (
          <span className="absolute top-3 end-3 inline-flex items-center gap-1 bg-brand text-white px-2 py-0.5 text-[10.5px] font-bold">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
            </svg>
            {labels.pinnedLabel}
          </span>
        )}
        {/* Hover overlay hint — "click to preview" */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-300 grid place-items-center opacity-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 bg-white text-navy px-4 py-2 text-[12.5px] font-bold shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {labels.previewLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 text-start">
        <h3 className="text-[15px] sm:text-[16.5px] font-bold leading-snug text-navy line-clamp-2">
          {doc.title}
        </h3>
        {doc.description && (
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft line-clamp-3">
            {doc.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          {doc.date && (
            <time className="font-display text-[11.5px] font-bold text-ink-subtle">
              {doc.date}
            </time>
          )}
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand hover:text-brand-600 transition-colors z-[2] relative"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {labels.downloadLabel}
          </a>
        </div>
      </div>
    </>
  );

  // ถ้ามี fileId → wrap ทั้งการ์ดด้วย preview button (คลิกที่ไหนก็เปิด modal)
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

  // Fallback — ไม่มี fileId ให้แสดงเป็น card ธรรมดา
  return (
    <article className="group relative flex flex-col border border-line bg-white overflow-hidden transition-all duration-300 hover:border-brand hover:shadow-soft hover:-translate-y-0.5">
      {cardContent}
    </article>
  );
}

function PDFIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand/60"
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
