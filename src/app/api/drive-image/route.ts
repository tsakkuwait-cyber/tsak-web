import type { NextRequest } from "next/server";

/**
 * Drive image proxy — serve Drive thumbnails through OUR domain
 *
 *   ทำไมต้อง proxy?
 *   - Safari iOS block รูปจาก drive.google.com/lh3 (referrer + cookie issue)
 *   - รูปโหลดใน Chrome desktop ได้ แต่ล่มบน iPhone
 *   - แก้: server-side fetch → serve จาก tsakkuwait.vercel.app → ไม่มี cross-origin
 *
 *   Usage: /api/drive-image?id=<fileId>&sz=w800
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cache 24 ชั่วโมงบน edge — ประหยัด Drive quota + เร็วขึ้น
const CACHE_HEADER = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  const sz = searchParams.get("sz")?.trim() || "w800";

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  // ลอง 2 endpoint ตามลำดับ
  const urls = [
    `https://lh3.googleusercontent.com/d/${id}=${sz}`,
    `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
        // Follow redirects
        redirect: "follow",
      });

      if (!res.ok) continue;
      const contentType = res.headers.get("Content-Type") ?? "image/jpeg";
      // ต้องเป็น image เท่านั้น (บางที Drive ส่ง HTML page มาถ้าไฟล์ไม่ public)
      if (!contentType.startsWith("image/")) continue;

      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": CACHE_HEADER,
        },
      });
    } catch {
      // try next
    }
  }

  return new Response("Not found", { status: 404 });
}
