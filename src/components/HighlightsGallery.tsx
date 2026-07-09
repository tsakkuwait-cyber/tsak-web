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
  members: HighlightItem[]; // ไม่รวม cover
};

/**
 * HighlightsGallery — Book theme
 *   Thumbnails = book covers (portrait 2:3 + shadow + spine)
 *   Topic name below cover
 *   Click → modal เปิดหนังสือ:
 *     - Big cover image
 *     - Headline + meta
 *     - Story text scrollable
 *     - Members grid (ถ้าเป็น collection)
 *     - Click member → nested lightbox แสดงรูปเต็ม
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
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, HighlightItem[]>();
    for (const h of highlights) {
      const key = h.collection || `__solo_${h.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(h);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const cover = items.find((i) => i.isCover) ?? items[0];
      const members = items.filter((i) => i !== cover);
      return { key, cover, members };
    });
  }, [highlights]);

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [memberIdx, setMemberIdx] = useState<number | null>(null);
  const openGroup = groups.find((g) => g.key === openKey) ?? null;
  const openMember = openGroup && memberIdx !== null ? openGroup.members[memberIdx] : null;

  // keyboard + body lock
  useEffect(() => {
    if (openKey === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (memberIdx !== null) setMemberIdx(null);
        else setOpenKey(null);
      }
      if (openMember && openGroup) {
        if (e.key === "ArrowRight")
          setMemberIdx((i) =>
            i === null ? null : (i + 1) % openGroup.members.length
          );
        if (e.key === "ArrowLeft")
          setMemberIdx((i) =>
            i === null
              ? null
              : (i - 1 + openGroup.members.length) % openGroup.members.length
          );
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openKey, memberIdx, openMember, openGroup]);

  const typeLabel = (t: HighlightType) => typeLabels[t] ?? t;

  return (
    <>
      {/* ═══════════ BOOK COVERS GRID ═══════════ */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {groups.map((g) => {
          const h = g.cover;
          const style = TYPE_STYLE[h.type];
          const memberCount = g.members.length;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                setOpenKey(g.key);
                setMemberIdx(null);
              }}
              className="group text-start focus:outline-none"
            >
              {/* Book cover — with spine + shadow */}
              <div className="relative transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                <div
                  className="relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-shadow duration-[400ms] ease-out"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  {h.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.photoUrl}
                      alt={h.headline}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-50 to-brand-100">
                      <span className="font-display text-[72px] font-extrabold text-brand-600/30">
                        {(h.headline || h.name || "?").slice(0, 1)}
                      </span>
                    </div>
                  )}
                  {/* Book spine effect (left edge) */}
                  <div className="absolute inset-y-0 start-0 w-[6px] bg-gradient-to-r from-black/30 via-black/15 to-transparent pointer-events-none" />
                  {/* Type badge */}
                  <span
                    className={`absolute top-2.5 end-2.5 inline-block px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text} shadow-sm`}
                  >
                    {typeLabel(h.type)}
                  </span>
                  {/* Members count (bottom right) */}
                  {memberCount > 0 && (
                    <span className="absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 bg-navy/90 backdrop-blur-sm text-white px-2 py-0.5 text-[11px] font-bold">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6h20v14H2z" />
                        <path d="M12 6v14" />
                      </svg>
                      {memberCount + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Topic below cover (centered) */}
              <div className="mt-4 px-1 text-center">
                <div className="text-[14px] font-bold leading-snug text-navy line-clamp-2">
                  {h.headline || h.name}
                </div>
                {(h.institution || h.year) && (
                  <div className="mt-1 text-[11.5px] text-ink-muted line-clamp-1">
                    {h.institution}
                    {h.institution && h.year && " · "}
                    {h.year}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════ READING MODAL ═══════════ */}
      {openGroup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenKey(null)}
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[760px] bg-white shadow-2xl animate-in modal-pop duration-400 my-auto"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpenKey(null)}
              aria-label={closeLabel}
              className="absolute top-3 end-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-navy shadow-md transition-all duration-200 ease-out hover:bg-white hover:scale-110 hover:rotate-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Cover image big */}
            {openGroup.cover.photoUrl && (
              <div className="relative w-full bg-navy" style={{ aspectRatio: "16/9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openGroup.cover.photoUrl}
                  alt={openGroup.cover.headline}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                  <span
                    className={`inline-block px-2.5 py-1 text-[11px] font-bold ${
                      TYPE_STYLE[openGroup.cover.type].bg
                    } ${TYPE_STYLE[openGroup.cover.type].text} mb-2`}
                  >
                    {typeLabel(openGroup.cover.type)}
                  </span>
                  <h2 className="text-[clamp(20px,3vw,28px)] font-extrabold leading-tight">
                    {openGroup.cover.headline}
                  </h2>
                  <div className="mt-1.5 text-[13px] text-[#BBDCD9]">
                    {openGroup.cover.institution}
                    {openGroup.cover.year && ` · ${openGroup.cover.year}`}
                  </div>
                  {openGroup.cover.name && (
                    <div className="mt-1 text-[13.5px] font-semibold text-white">
                      {openGroup.cover.name}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Article body — scrollable */}
            <div className="p-6 sm:p-8">
              {openGroup.cover.story && (
                <div className="text-[15px] sm:text-[16px] leading-[1.9] text-ink-soft whitespace-pre-line max-w-[62ch]">
                  {openGroup.cover.story}
                </div>
              )}

              {/* Members grid — เฉพาะกรณี collection */}
              {openGroup.members.length > 0 && (
                <>
                  <div className="mt-8 mb-4 flex items-center gap-3">
                    <span className="text-[12px] font-bold tracking-wider uppercase text-brand-600">
                      สมาชิกในกลุ่ม
                    </span>
                    <span className="flex-1 h-px bg-line" />
                    <span className="font-display text-[13px] font-bold text-ink-muted">
                      {openGroup.members.length}
                    </span>
                  </div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {openGroup.members.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMemberIdx(idx)}
                        className="group flex flex-col overflow-hidden border border-line bg-white text-start transition-all duration-300 hover:border-brand hover:shadow-card hover:-translate-y-0.5"
                      >
                        <div
                          className="relative w-full bg-gradient-to-br from-brand-50 to-brand-100"
                          style={{ aspectRatio: "3/4" }}
                        >
                          {m.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.photoUrl}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center">
                              <span className="font-display text-[32px] font-extrabold text-brand-600/30">
                                {(m.name || "?").slice(0, 1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <div className="text-[12px] font-bold text-navy line-clamp-1">
                            {m.name}
                          </div>
                          {m.major && (
                            <div className="mt-0.5 text-[10.5px] text-ink-muted line-clamp-2">
                              {m.major}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nested lightbox for individual member */}
          {openMember && (
            <div
              onClick={() => setMemberIdx(null)}
              className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMemberIdx(null);
                }}
                aria-label={closeLabel}
                className="absolute top-4 end-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 ease-out hover:bg-white/20 hover:scale-110 hover:rotate-90"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              {openGroup.members.length > 1 && (
                <div className="absolute top-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white">
                  {(memberIdx ?? 0) + 1} / {openGroup.members.length}
                </div>
              )}
              <div
                onClick={(e) => e.stopPropagation()}
                className="animate-in modal-pop duration-400"
              >
                {openMember.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openMember.photoUrl}
                    alt={openMember.name}
                    referrerPolicy="no-referrer"
                    className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
                  />
                )}
              </div>
              <div className="mt-4 text-center text-white max-w-[560px] px-4">
                {openMember.name && (
                  <div className="text-[16px] font-bold">{openMember.name}</div>
                )}
                {openMember.major && (
                  <div className="mt-1 text-[13px] text-[#BBDCD9]">
                    {openMember.major}
                  </div>
                )}
              </div>
              {openGroup.members.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMemberIdx((i) =>
                        i === null
                          ? null
                          : (i - 1 + openGroup.members.length) % openGroup.members.length
                      );
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
                      setMemberIdx((i) =>
                        i === null ? null : (i + 1) % openGroup.members.length
                      );
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
        </div>
      )}
    </>
  );
}
