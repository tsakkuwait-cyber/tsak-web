import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://tsak-web.vercel.app");

/**
 * sitemap.xml — บอก Google หน้าไหนมีบ้าง
 * - แต่ละหน้ามีเวอร์ชั่นของ 3 ภาษา
 * - Alternates (hreflang) ใช้บอกความสัมพันธ์ระหว่างภาษา
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/students", "/activities", "/contact"];
  const lastModified = new Date();

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: page === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${page}`])
        ),
      },
    }))
  );
}
