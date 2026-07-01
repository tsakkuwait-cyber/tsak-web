"use client";

import { useEffect, useMemo, useState } from "react";
import type { HighlightItem, HighlightType } from "@/lib/google-sheets";

const TYPE_STYLE: Record<HighlightType, { bg: string; text: string }> = {
  graduation: { bg: "bg-[#E1F4F1]", text: "text-[#0B7068]" },
  scholarship: { bg: "bg-[#FBF3D6]", text: "text-[#7A5A00]" },
  award: { bg: "bg-[#FBEEF2]", text: "text-[#B0395A]" },
  welcome: { bg: "bg-brand-50", text: "text-navy" },
  story: { bg: "bg-[#EAF0FB]", text: "text-[#1F55C8]" },
  volunteer: { bg: "bg-[#F4ECE5]", text: "text-[#7A4A1F]" },
};

type Group = {
  key: string;
  cover: HighlightItem;
  members: HighlightItem[]; // includes cover
};

/**
 * HighlightsGallery — poster grid + lightbox
 *  - Group by `collection` field (empty = standalone)
 *  - Gallery shows cover per group (either isCover=TRUE, or first item)
 *  - Click cover → lightbox navigates through ALL members of that group
 */
export function HighlightsGallery({
  highlights,
  typeLabels,
  closeLabel,
}: {
  highlights: HighlightItem[];
  typeLabels: Record<HighlightType, string>;
  closeLabel: string;
}) {
  // Group highlights by collection
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, HighlightItem[]>();
    for (const h of highlights) {
      const key = h.collection || `__solo_${h.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(h);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const cover = items.find((i) => i.isCover) ?? items[0];
      return { key, cover, members: items };
    });
  }, [highlights]);

  // Lightbox state
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [openMemberIdx, setOpenMemberIdx] = useState(0);
  const isOpen = openGroupKey !== null;
  const openGroup = groups.find((g) => g.key === openGroupKey) ?? null;
  const currentMember = openGroup?.members[openMemberIdx] ?? null;
  const total = openGroup?.members.length ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroupKey(null);
      if (e.key === "ArrowRight")
        setOpenMemberIdx((i) => (total === 0 ? 0 : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setOpenMemberIdx((i) => (total === 0 ? 0 : (i - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, total]);

  const typeLabel = (t: HighlightType) => typeLabels[t] ?? t;

  return (
    <>
      {/* ═══════════ POSTER GRID ═══════════ */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {groups.map((g) => {
          const h = g.cover;
          const style = TYPE_STYLE[h.type];
          const memberCount = g.members.length;
          const hasCollection = memberCount > 1;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                setOpenGroupKey(g.key);
                setOpenMemberIdx(0);
              }}
              className="group relative flex flex-col overflow-hidden border border-line bg-white text-start transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand hover:shadow-soft hover:-translate-y-0.5"
            >
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
                      {(h.name || "?").slice(0, 1)}
                    </span>
                  </div>
                )}
                {/* Type chip */}
                <span
                  className={`absolute top-2.5 start-2.5 inline-block px-2 py-0.5 text-[10.5px] font-bold ${style.bg} ${style.text} shadow-sm`}
                >
                  {typeLabel(h.type)}
                </span>
                {/* Year chip */}
                {h.year && (
                  <span className="absolute top-2.5 end-2.5 font-display text-[10.5px] font-bold text-white bg-navy/75 backdrop-blur-sm px-2 py-0.5">
                    {h.year}
                  </span>
                )}
                {/* Collection count badge — bottom right */}
                {hasCollection && (
                  <span className="absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 bg-navy text-white px-2.5 py-1 text-[11px] font-bold shadow-md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {memberCount}
                  </span>
                )}
              </div>

              {/* Caption */}
              {(h.name || h.headline) && (
                <div className="p-3 border-t border-line">
                  {h.headline && (
                    <div className="text-[13px] font-bold text-navy truncate">
                      {h.headline}
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
      {isOpen && openGroup && currentMember && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenGroupKey(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenGroupKey(null);
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
            {openMemberIdx + 1} / {total}
          </div>

          {/* Image */}
          <div
            className="relative flex max-h-full max-w-full items-center justify-center animate-in modal-pop duration-400"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMember.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentMember.photoUrl}
                alt={currentMember.name}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
              />
            )}
          </div>

          {/* Caption */}
          <div className="mt-4 text-center text-white max-w-[600px] px-4">
            {currentMember.name && (
              <div className="text-[16px] font-bold">{currentMember.name}</div>
            )}
            {currentMember.headline && (
              <div className="mt-1 text-[13.5px] text-[#BBDCD9]">
                {currentMember.headline}
              </div>
            )}
            {(currentMember.institution || currentMember.major) && (
              <div className="mt-1 text-[12px] text-[#9CC6C2]">
                {currentMember.institution}
                {currentMember.major && ` · ${currentMember.major}`}
              </div>
            )}
          </div>

          {/* Prev/Next */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMemberIdx((i) => (total === 0 ? 0 : (i - 1 + total) % total));
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
                  setOpenMemberIdx((i) => (total === 0 ? 0 : (i + 1) % total));
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
