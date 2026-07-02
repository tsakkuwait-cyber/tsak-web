import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://tsak-web.vercel.app");

/**
 * robots.txt — บอก search engine ว่าเก็บ index ได้/ไม่ได้
 * - ตอน coming_soon: block all (กัน crawler เก็บหน้า splash)
 * - ตอน live: allow all + shows sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const isComingSoon =
    process.env.NEXT_PUBLIC_SITE_STATUS === "coming_soon";

  if (isComingSoon) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
