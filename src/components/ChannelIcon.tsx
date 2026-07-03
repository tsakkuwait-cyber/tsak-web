import type { CSSProperties } from "react";

/**
 * ChannelIcon — SVG icons (monochrome, no color) สำหรับช่องทางติดต่อ
 * เมื่อใช้ต้องห่อด้วย wrapper สี่เหลี่ยม/วงกลม + สีเดียวกันทั้งเว็บ (ดูสบายตา)
 * ทุก path ใช้ stroke="currentColor" → สืบสีจาก parent (text-navy / text-brand-200 ฯลฯ)
 */

type IconKey =
  | "email"
  | "phone"
  | "line"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "address"
  | "location"
  | "web"
  | "generic";

const ICONS: Record<IconKey, JSX.Element> = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  line: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="3" />
      <path d="M7 15v-6M7 12l3 3M13 15v-6M13 9l3 6v-6" />
    </>
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zM8 9c0-.6.4-1 1-1h1l1 2.5-1 1a7 7 0 0 0 3.5 3.5l1-1L16 15v1c0 .6-.4 1-1 1a8 8 0 0 1-7-8z" />
  ),
  facebook: (
    <path d="M14 8h2V5h-2.5A3.5 3.5 0 0 0 10 8.5V11H8v3h2v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  address: (
    <>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  generic: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16v.5" />
    </>
  ),
};

/** normalize key จาก sheet → icon key */
function resolveKey(raw?: string): IconKey {
  const k = (raw ?? "").toLowerCase().trim();
  if (k === "mail" || k === "e-mail") return "email";
  if (k === "tel" || k === "mobile") return "phone";
  if (k === "map" || k === "loc") return "location";
  if (k === "ig") return "instagram";
  if (k === "fb") return "facebook";
  if (k === "wa" || k === "wsp") return "whatsapp";
  if (k in ICONS) return k as IconKey;
  return "generic";
}

export function ChannelIcon({
  channelKey,
  size = 16,
  strokeWidth = 1.6,
  style,
  className,
}: {
  channelKey?: string;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const key = resolveKey(channelKey);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {ICONS[key]}
    </svg>
  );
}
