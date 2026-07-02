import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Dynamic OG image — 1200×630 (Facebook/Twitter/LINE standard)
 * แสดง petrol theme + brand name + Kuwait Tower silhouette
 * Auto-detect ตาม locale (title/description จาก dict)
 */

export const runtime = "edge";
export const alt = "Thai Student Association in Kuwait";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const dict = await getDictionary(locale);
  const brandName =
    locale === "en"
      ? "Thai Student Association in Kuwait"
      : dict.brand.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0C3B45 0%, #082A31 60%, #041619 100%)",
          color: "white",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Kuwait Tower silhouette (top-right decorative) */}
        <svg
          width="360"
          height="360"
          viewBox="0 0 240 260"
          style={{
            position: "absolute",
            top: 20,
            right: 40,
            opacity: 0.14,
          }}
        >
          {/* Tall tower */}
          <line x1="120" y1="260" x2="120" y2="60" stroke="#7FD8CF" strokeWidth="2.5" />
          <circle cx="120" cy="90" r="24" stroke="#7FD8CF" strokeWidth="2.5" fill="none" />
          <circle cx="120" cy="145" r="18" stroke="#7FD8CF" strokeWidth="2.5" fill="none" />
          <line x1="120" y1="60" x2="120" y2="30" stroke="#7FD8CF" strokeWidth="2.5" />
          {/* Medium tower */}
          <line x1="180" y1="260" x2="180" y2="130" stroke="#7FD8CF" strokeWidth="2.5" />
          <circle cx="180" cy="155" r="14" stroke="#7FD8CF" strokeWidth="2.5" fill="none" />
          <line x1="180" y1="130" x2="180" y2="110" stroke="#7FD8CF" strokeWidth="2.5" />
          {/* Short spire */}
          <line x1="215" y1="260" x2="215" y2="175" stroke="#7FD8CF" strokeWidth="2.5" />
          {/* Ground */}
          <line x1="60" y1="260" x2="240" y2="260" stroke="#7FD8CF" strokeWidth="1.5" />
        </svg>

        {/* Accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#10968D",
          }}
        />

        {/* Star badge */}
        <div
          style={{
            width: 130,
            height: 130,
            background: "#10968D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 65,
            marginBottom: 40,
            boxShadow: "0 20px 40px rgba(16,150,141,0.4)",
          }}
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
            <path d="M12 2 L14.5 9 L22 9 L15.5 13.5 L18 21 L12 17 L6 21 L8.5 13.5 L2 9 L9.5 9 Z" />
          </svg>
        </div>

        {/* Kicker */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#7FD8CF",
            textTransform: "uppercase",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ width: 40, height: 2, background: "#7FD8CF" }} />
          EST. 2011
          <span style={{ width: 40, height: 2, background: "#7FD8CF" }} />
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1000,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          {brandName}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#BBDCD9",
            fontWeight: 500,
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span>THAI STUDENT ASSOCIATION</span>
          <span style={{ color: "#7FD8CF" }}>·</span>
          <span>KUWAIT</span>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#10968D",
          }}
        />
      </div>
    ),
    size
  );
}
