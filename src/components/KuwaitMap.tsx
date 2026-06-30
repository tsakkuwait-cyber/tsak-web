"use client";

import { useState } from "react";
import type { InstitutionItem } from "@/lib/google-sheets";

/**
 * KuwaitMap — แผนที่คูเวตที่สมจริงขึ้น + pin มี logo + detail panel ใหม่
 *  - SVG outline ที่ละเอียดกว่า (Kuwait Bay + Bubiyan + Failaka + Warbah)
 *  - Pin: ถ้ามี logo_url → แสดงรูปกลม | ถ้าไม่มี → ตัวอักษรย่อ
 *  - Smart spread: pin ที่ใกล้กันมาก (Kuwait City area) → เรียงแยกออกห่างกัน
 *  - Detail panel: cover photo + logo + faculty bars + website link
 */

const BBOX = {
  minLat: 28.45,
  maxLat: 30.15,
  minLng: 46.55,
  maxLng: 48.45,
};

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * 100;
  return { x, y };
}

/**
 * Spread pins ที่ใกล้กันมาก (cluster) เพื่อไม่ให้ทับซ้อน
 * - คำนวณตำแหน่งจริงก่อน
 * - ถ้ามี pin อื่นภายในรัศมี — กระจายตามมุม
 */
function spreadPins(
  insts: InstitutionItem[]
): Array<{ inst: InstitutionItem; x: number; y: number; anchor: { x: number; y: number } }> {
  const positions = insts.map((inst) => {
    const { x, y } = project(inst.lat, inst.lng);
    return { inst, x, y, anchor: { x, y } };
  });

  // หา cluster (pins ภายในรัศมี 4 หน่วย)
  const CLUSTER_RADIUS = 4;
  const visited = new Set<number>();
  for (let i = 0; i < positions.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [i];
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS) {
        cluster.push(j);
        visited.add(j);
      }
    }
    visited.add(i);

    // ถ้า cluster มีมากกว่า 1 → กระจายเป็นวงกลมรอบจุดศูนย์
    if (cluster.length > 1) {
      const cx = cluster.reduce((s, k) => s + positions[k].anchor.x, 0) / cluster.length;
      const cy = cluster.reduce((s, k) => s + positions[k].anchor.y, 0) / cluster.length;
      const spread = 5.5; // หน่วย % บน viewBox
      cluster.forEach((k, idx) => {
        const angle = (idx / cluster.length) * Math.PI * 2 - Math.PI / 2;
        positions[k].x = cx + Math.cos(angle) * spread;
        positions[k].y = cy + Math.sin(angle) * spread;
      });
    }
  }
  return positions;
}

export function KuwaitMap({
  institutions,
  labels,
}: {
  institutions: InstitutionItem[];
  labels: {
    mapNote: string;
    gulf: string;
    studentsLabel: string;
    areaLabel: string;
    facultyTitle: string;
    websiteLabel: string;
  };
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    institutions[0]?.id ?? null
  );
  const selected = institutions.find((i) => i.id === selectedId);
  const pinned = institutions.filter((i) => i.lat !== 0 && i.lng !== 0);
  const spreadPositions = spreadPins(pinned);

  // คำนวณ faculty breakdown
  const facultyItems = selected?.faculty
    ? selected.faculty
        .split(/[,،]/)
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => {
          const [name, countStr] = f.split(":").map((s) => s.trim());
          return { name, count: Number(countStr) || 0 };
        })
    : [];
  const facultyTotal = facultyItems.reduce((s, f) => s + f.count, 0) || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* ═══════════ MAP ═══════════ */}
      <div className="border border-line bg-gradient-to-br from-[#E6F4F2] via-[#D0E9E6] to-[#BCE0DB]">
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "1 / 1" }}
        >
          {/* Notes overlay */}
          <div className="absolute start-4 top-3.5 z-[6] bg-white/85 px-2 py-1 text-[11.5px] tracking-wide text-ink-subtle font-mono">
            {labels.mapNote}
          </div>
          <div className="absolute end-3.5 top-3.5 z-[6] text-[11px] font-bold tracking-wider uppercase text-brand-600">
            {labels.gulf}
          </div>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
          >
            {/* Kuwait mainland — accurate outline based on real geography
                clockwise: NW Iraq border → N → NE → E coast w/ Kuwait Bay → S Saudi → W */}
            <path
              d="M 11.5 14
                 L 38 11.5 L 60 10.5 L 67 12
                 L 70 18 L 71 24
                 L 72 29 L 73 33
                 L 68 36 L 60 39 L 53 42
                 L 49 47 L 55 49
                 L 64 50 L 71 53 L 74 58
                 L 76 65 L 75 73 L 73 80
                 L 67 84 L 55 86 L 38 85 L 22 82 L 12 76
                 L 9 67 L 8 55 L 8 42 L 9 28 L 10.5 18 Z"
              fill="#FBFCFA"
              stroke="#10968D"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />

            {/* Bubiyan Island — large, NE */}
            <path
              d="M 74 13 L 84 14 L 90 18 L 91 25 L 87 30 L 82 31 L 76 27 L 73 21 Z"
              fill="#F2FAF9"
              stroke="#10968D"
              strokeWidth="0.45"
              strokeLinejoin="round"
            />

            {/* Warbah Island — small N of Bubiyan */}
            <path
              d="M 78 9 L 84 9.5 L 83 12 L 78 11 Z"
              fill="#F2FAF9"
              stroke="#10968D"
              strokeWidth="0.35"
            />

            {/* Failaka Island — small E of Kuwait Bay */}
            <ellipse
              cx="68"
              cy="46"
              rx="2.6"
              ry="1.6"
              fill="#F2FAF9"
              stroke="#10968D"
              strokeWidth="0.45"
            />

            {/* Kuwait City area label */}
            <text
              x="52"
              y="55"
              fontSize="2.2"
              fontWeight="600"
              fill="#0B7068"
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
            >
              KUWAIT CITY
            </text>
          </svg>

          {/* PINS — overlay on map */}
          {spreadPositions.map(({ inst, x, y, anchor }) => {
            const isActive = inst.id === selectedId;
            const moved =
              Math.abs(x - anchor.x) > 0.5 || Math.abs(y - anchor.y) > 0.5;
            return (
              <div key={inst.id}>
                {/* leader line ถ้า pin ถูกขยับออกจากตำแหน่งจริง */}
                {moved && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <line
                      x1={anchor.x}
                      y1={anchor.y}
                      x2={x}
                      y2={y}
                      stroke={isActive ? "#10968D" : "#0C3B45"}
                      strokeWidth="0.3"
                      strokeDasharray="0.6 0.6"
                      opacity="0.5"
                    />
                  </svg>
                )}

                {/* Pin button */}
                <button
                  type="button"
                  onClick={() => setSelectedId(inst.id)}
                  aria-label={inst.name}
                  className={[
                    "absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full border-2 border-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    isActive
                      ? "z-30 h-11 w-11 shadow-[0_4px_14px_rgba(16,150,141,.4)] scale-110"
                      : "z-20 h-9 w-9 shadow-md hover:scale-105",
                  ].join(" ")}
                  style={{
                    insetInlineStart: `${x}%`,
                    insetBlockStart: `${y}%`,
                    backgroundColor: isActive ? "#10968D" : "#0C3B45",
                  }}
                >
                  {inst.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inst.logoUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-full object-cover bg-white"
                    />
                  ) : (
                    <span className="text-[9px] font-extrabold text-white leading-none">
                      {inst.short}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ DETAIL PANEL ═══════════ */}
      <aside className="flex flex-col gap-4">
        {selected ? (
          <>
            {/* Selected institution — cover image + body */}
            <div className="overflow-hidden border border-line bg-white">
              {/* Cover photo or gradient header */}
              <div
                className="relative w-full bg-gradient-to-br from-navy via-navy-dark to-brand-900"
                style={{ aspectRatio: "16 / 9" }}
              >
                {selected.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.imageUrl}
                    alt={selected.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[#BBDCD9] text-[11px] font-mono opacity-50">
                    [ campus photo ]
                  </div>
                )}
                {/* Type chip on photo */}
                {selected.type && (
                  <span className="absolute top-3 start-3 inline-block bg-navy/85 backdrop-blur-sm px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-brand-200">
                    {selected.type}
                  </span>
                )}
                {/* Logo — floating bottom-left over photo */}
                {selected.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.logoUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute -bottom-6 start-5 h-14 w-14 rounded-full border-4 border-white bg-white object-cover shadow-md"
                  />
                )}
              </div>

              {/* Body */}
              <div className={`p-5 ${selected.logoUrl ? "pt-8" : ""}`}>
                <h3 className="text-[18px] font-extrabold leading-tight text-navy line-clamp-2">
                  {selected.name}
                </h3>
                {selected.area && (
                  <p className="mt-1 text-[12.5px] text-ink-muted">
                    📍 {selected.area}
                  </p>
                )}

                <div className="mt-4 flex items-end gap-2.5">
                  <span className="font-display text-[40px] font-extrabold leading-none text-brand">
                    {selected.studentsCount}
                  </span>
                  <span className="pb-1.5 text-[12.5px] font-semibold text-ink-muted">
                    {labels.studentsLabel}
                  </span>
                </div>

                {selected.website && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 bg-brand-50 px-4 py-2 text-[13px] font-bold text-brand-700 hover:bg-brand hover:text-white transition-colors"
                  >
                    {labels.websiteLabel} →
                  </a>
                )}
              </div>
            </div>

            {/* Faculty visualization */}
            {facultyItems.length > 0 && (
              <div className="border border-line bg-white p-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand-600">
                    {labels.facultyTitle}
                  </h4>
                  <span className="font-display text-[14px] font-bold text-ink-muted">
                    {facultyTotal} {labels.studentsLabel}
                  </span>
                </div>

                <div className="space-y-3">
                  {facultyItems.map((f) => {
                    const pct = Math.round((f.count / facultyTotal) * 100);
                    return (
                      <div key={f.name}>
                        <div className="mb-1 flex items-baseline justify-between gap-2">
                          <span className="text-[13px] font-semibold text-navy truncate">
                            {f.name}
                          </span>
                          <span className="font-display text-[13px] font-bold text-brand">
                            {f.count}
                          </span>
                        </div>
                        <div className="relative h-1.5 overflow-hidden bg-brand-50">
                          <div
                            className="absolute inset-y-0 start-0 bg-gradient-to-r from-brand to-brand-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="border border-dashed border-line bg-white p-6 text-center text-ink-muted">
            —
          </div>
        )}

        {/* Quick list — เลือกอื่นได้ */}
        <div className="border border-line bg-white p-2">
          {institutions.map((inst) => {
            const isActive = inst.id === selectedId;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => setSelectedId(inst.id)}
                className={[
                  "flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors",
                  isActive ? "bg-brand-50" : "hover:bg-canvas",
                ].join(" ")}
              >
                {inst.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inst.logoUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 flex-none rounded-full border border-line bg-white object-cover"
                  />
                ) : (
                  <span
                    className={[
                      "grid h-8 w-9 flex-none place-items-center text-[10px] font-extrabold",
                      isActive ? "bg-brand text-white" : "bg-navy text-white",
                    ].join(" ")}
                  >
                    {inst.short}
                  </span>
                )}
                <span className="flex-1 text-[14px] font-semibold text-navy truncate">
                  {inst.name}
                </span>
                <span className="font-display text-[13px] font-extrabold text-brand">
                  {inst.studentsCount}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
