"use client";

import { useState } from "react";
import type { InstitutionItem } from "@/lib/google-sheets";

/**
 * KuwaitMap — แผนที่คูเวต SVG + ปักหมุดสถาบันจากพิกัด lat/lng จริง
 *  - คลิก pin → เปิด detail panel ด้านล่างแสดง logo, รูป, คณะ, website
 *  - Lat/Lng → x/y ผ่าน projection แบบง่าย (Kuwait bounding box)
 *  - ถ้าสถาบันไม่มี lat/lng → ไม่แสดงบนแผนที่ (กัน NaN)
 */

// Kuwait approximate bounding box (สำหรับ projection)
// แมตช์กับ SVG path ด้านล่าง — ขยายให้มี padding รอบประเทศ
const BBOX = {
  minLat: 28.45,
  maxLat: 30.15,
  minLng: 46.55,
  maxLng: 48.45,
};

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
  // y กลับด้านเพราะ SVG y นับลง
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * 100;
  return { x, y };
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

  // เฉพาะที่มี lat/lng → แสดงบนแผนที่
  const pinned = institutions.filter((i) => i.lat !== 0 && i.lng !== 0);

  return (
    <div className="flex flex-wrap items-stretch gap-[26px]">
      {/* ─── MAP ─────────────────────────────────── */}
      <div className="flex-[2_1_380px] min-w-[300px]">
        <div
          className="relative overflow-hidden border border-line bg-gradient-to-br from-[#E6F4F2] via-[#D0E9E6] to-[#BCE0DB]"
          style={{ aspectRatio: "1 / 1" }}
        >
          {/* Notes overlay */}
          <div className="absolute start-4 top-3.5 z-[6] bg-white/80 px-2 py-1 text-[11.5px] tracking-wide text-ink-subtle font-mono">
            {labels.mapNote}
          </div>
          <div className="absolute end-3.5 top-3.5 z-[6] text-[11px] font-bold tracking-wider uppercase text-brand-600">
            {labels.gulf}
          </div>

          {/* แผนที่คูเวตแบบเสมือนจริง — มี Kuwait Bay + Bubiyan + Failaka */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
          >
            {/* แผ่นดินใหญ่ Kuwait
                ลำดับ clockwise: NW → NE (Iraq border) → E-coast with Kuwait Bay indent → S (Saudi border) → W back to NW */}
            <path
              d="M 12 14
                 L 38 12 L 60 11 L 68 13
                 L 70 22 L 72 30
                 L 64 38 L 56 44
                 L 64 48 L 72 52
                 L 76 62 L 74 75 L 68 83
                 L 50 85 L 28 82 L 12 75
                 L 8 52 L 10 30 Z"
              fill="#FBFCFA"
              stroke="#10968D"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            {/* เกาะ Bubiyan (ใหญ่ NE) */}
            <path
              d="M 73 13 L 88 16 L 90 28 L 82 30 L 74 22 Z"
              fill="#F2FAF9"
              stroke="#10968D"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            {/* เกาะ Warbah (เล็กที่สุด N ของ Bubiyan) */}
            <path
              d="M 76 10 L 82 11 L 81 13 L 76 12 Z"
              fill="#F2FAF9"
              stroke="#10968D"
              strokeWidth="0.4"
            />
            {/* เกาะ Failaka (เล็ก E ของ Kuwait Bay) */}
            <ellipse cx="78" cy="46" rx="3" ry="1.8" fill="#F2FAF9" stroke="#10968D" strokeWidth="0.5" />

            {/* Pins (lat/lng → x/y %) */}
            {pinned.map((inst) => {
              const { x, y } = project(inst.lat, inst.lng);
              const isActive = inst.id === selectedId;
              return (
                <g
                  key={inst.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setSelectedId(inst.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* shadow / outer ring */}
                  <circle
                    r={isActive ? 3.6 : 2.6}
                    fill={isActive ? "#10968D" : "#0C3B45"}
                    opacity={isActive ? 0.25 : 0.18}
                  />
                  {/* main pin */}
                  <circle
                    r={isActive ? 2.2 : 1.6}
                    fill={isActive ? "#10968D" : "#0C3B45"}
                    stroke="#FFFFFF"
                    strokeWidth="0.4"
                  />
                  {/* label code */}
                  <text
                    y={isActive ? -4 : -3}
                    textAnchor="middle"
                    fontSize="2.4"
                    fontWeight="800"
                    fill={isActive ? "#10968D" : "#0C3B45"}
                    style={{ pointerEvents: "none" }}
                  >
                    {inst.short}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Click overlay (สำหรับ pin ที่ตำแหน่ง — บางทีคลิกที่ pin SVG ยาก) */}
          <div className="absolute inset-0">
            {pinned.map((inst) => {
              const { x, y } = project(inst.lat, inst.lng);
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedId(inst.id)}
                  className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  style={{ insetInlineStart: `${x}%`, insetBlockStart: `${y}%` }}
                  aria-label={inst.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── DETAIL PANEL ────────────────────────── */}
      <aside className="flex-1 basis-[290px] min-w-[270px] flex flex-col gap-4">
        {selected ? (
          <>
            {/* Selected institution dark card */}
            <div className="bg-navy text-white">
              {selected.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  referrerPolicy="no-referrer"
                  className="h-[140px] w-full object-cover"
                />
              )}
              <div className="p-[22px]">
                <div className="flex items-start gap-3.5">
                  {selected.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.logoUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 flex-none rounded-sm bg-white object-contain p-1"
                    />
                  ) : (
                    <span className="grid h-12 w-12 flex-none place-items-center bg-white/10 text-[14px] font-extrabold text-brand-200">
                      {selected.short}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold tracking-wider uppercase text-brand-200">
                      {selected.type}
                    </div>
                    <h3 className="mt-1 text-[19px] font-extrabold leading-[1.3]">
                      {selected.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  <div>
                    <div className="font-display text-[32px] font-extrabold leading-none text-brand-200">
                      {selected.studentsCount}
                    </div>
                    <div className="mt-1 text-[12.5px] text-[#BBDCD9]">
                      {labels.studentsLabel}
                    </div>
                  </div>
                  {selected.area && (
                    <div>
                      <div className="mt-1.5 text-[15px] font-bold">
                        {selected.area}
                      </div>
                      <div className="mt-1 text-[12.5px] text-[#BBDCD9]">
                        {labels.areaLabel}
                      </div>
                    </div>
                  )}
                </div>

                {selected.website && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-200 hover:text-white"
                  >
                    {labels.websiteLabel} →
                  </a>
                )}
              </div>
            </div>

            {/* Faculty chips — รองรับ "name:count" format
                ถ้ามี ":" → แยก name + count
                ถ้าไม่มี → แสดง name อย่างเดียว */}
            {selected.faculty && (
              <div className="border border-line bg-white p-4">
                <div className="text-[12px] font-bold tracking-wider uppercase text-ink-subtle">
                  {labels.facultyTitle}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.faculty
                    .split(/[,،]/)
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f) => {
                      const [name, count] = f.split(":").map((s) => s.trim());
                      return (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 bg-brand-50 px-2.5 py-1 text-[12.5px] font-semibold text-navy"
                        >
                          <span>{name}</span>
                          {count && (
                            <span className="font-display text-brand-600 font-extrabold">
                              {count}
                            </span>
                          )}
                        </span>
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

        {/* Quick list — คลิกเปลี่ยน selected */}
        <div className="border border-line bg-white p-2">
          {institutions.map((inst) => {
            const isActive = inst.id === selectedId;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => setSelectedId(inst.id)}
                className={[
                  "flex w-full items-center gap-3 px-3 py-2.5 text-start",
                  isActive ? "bg-brand-50" : "hover:bg-canvas",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-7 w-9 flex-none place-items-center text-[11px] font-extrabold",
                    isActive
                      ? "bg-brand text-white"
                      : "bg-navy text-white",
                  ].join(" ")}
                >
                  {inst.short}
                </span>
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
