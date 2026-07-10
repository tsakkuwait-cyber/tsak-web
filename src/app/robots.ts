import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt — บอก bot ว่า crawl ได้หรือไม่ + ชี้ไป sitemap
 *   ช่วง coming-soon (NEXT_PUBLIC_SITE_STATUS=coming_soon) → ห้าม crawl ทั้งเว็บ
 *   กัน Google index หน้า splash ก่อน launch จริง
 */
export default function robots(): MetadataRoute.Robots {
  const isComingSoon = process.env.NEXT_PUBLIC_SITE_STATUS === "coming_soon";

  if (isComingSoon) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
