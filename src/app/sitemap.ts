import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";

/**
 * sitemap.xml — แผนที่บอก Google ว่ามีหน้าอะไรบ้าง (ทุกหน้า × ทุกภาษา)
 *   แต่ละ URL แนบ alternates (hreflang) ของทุกภาษาไว้ด้วย
 */
const PATHS = ["", "/students", "/activities", "/resources", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, absoluteUrl(`/${l}${path}`)])
        ),
      },
    }))
  );
}
