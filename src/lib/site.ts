/**
 * Site URL — แหล่งเดียวสำหรับ absolute URL (SEO: metadataBase, og, sitemap, canonical)
 *
 * ลำดับความสำคัญ:
 *   1. NEXT_PUBLIC_SITE_URL          — ตั้งเองที่ Vercel (โดเมนจริง เช่น https://tsak-web.vercel.app)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel ใส่ให้อัตโนมัติ (โดเมน production ของ project)
 *   3. http://localhost:3000         — ตอน dev
 *
 * ตั้งค่า NEXT_PUBLIC_SITE_URL ที่ Vercel ครั้งเดียวเพื่อความชัวร์ (ไม่มี trailing slash)
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

/** ต่อ path เข้ากับ siteUrl เป็น absolute URL (path ควรขึ้นต้นด้วย "/") */
export function absoluteUrl(path = ""): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

import { locales, defaultLocale, type Locale } from "@/i18n/config";

/** OpenGraph locale code ตามภาษา (og:locale) */
export const ogLocales: Record<Locale, string> = {
  th: "th_TH",
  en: "en_US",
  ar: "ar_KW",
};

/**
 * สร้าง alternates (canonical + hreflang languages) สำหรับหน้าใดๆ
 * @param locale  ภาษาปัจจุบัน → canonical ชี้มาที่ตัวเอง
 * @param suffix  path หลัง /{locale} เช่น "" (home), "/activities"
 *
 * ผลลัพธ์: canonical = /{locale}{suffix}, languages = ทุกภาษา + x-default (→ en)
 */
export function localeAlternates(locale: Locale, suffix = "") {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = absoluteUrl(`/${l}${suffix}`);
  }
  languages["x-default"] = absoluteUrl(`/${defaultLocale}${suffix}`);
  return {
    canonical: absoluteUrl(`/${locale}${suffix}`),
    languages,
  };
}
