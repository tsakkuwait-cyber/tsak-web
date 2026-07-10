import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Dynamic OpenGraph image (1200×630) — รูป preview ตอนแชร์ลิงก์
 *   - วาดด้วยโค้ด ไม่ต้องมีไฟล์รูป · ใช้สี brand (navy/teal)
 *   - ข้อความอังกฤษล้วน → ไม่ต้องโหลดฟอนต์ไทย/อาหรับ (เร็ว + ไม่พัง)
 *   Next.js จะ inject <meta property="og:image"> ให้อัตโนมัติ
 */
export const runtime = "edge";
export const alt = "Thai Student Association in Kuwait";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0C3B45";
const TEAL = "#10968D";
const MINT = "#7FD8CF";

export default async function OgImage({
  params,
}: {
  params: { locale: string };
}) {
  // ใช้ tagline อังกฤษเสมอ (ชื่อทางการเป็นภาษาอังกฤษ) — locale แค่ validate
  const locale = isLocale(params.locale) ? params.locale : "en";
  const dict = await getDictionary(locale);
  void dict;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${NAVY} 0%, #0a2e36 100%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* accent bar */}
        <div style={{ display: "flex", width: 120, height: 8, background: TEAL }} />

        {/* main copy */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: MINT,
              fontWeight: 700,
            }}
          >
            Est. 2011 · Kuwait
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 82,
              lineHeight: 1.05,
              fontWeight: 800,
              color: "white",
              maxWidth: 960,
            }}
          >
            Thai Student Association in Kuwait
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              color: "#BBDCD9",
              fontWeight: 500,
            }}
          >
            The voice of Thai students in the State of Kuwait
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: MINT, fontWeight: 700 }}>
            thaikuwait.org
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: TEAL }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: MINT }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#F4C430" }} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
