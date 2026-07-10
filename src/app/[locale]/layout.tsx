import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Cairo, Prompt, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../globals.css";
import {
  locales,
  localeDirections,
  isLocale,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getChannels } from "@/lib/google-sheets";
import { siteUrl, absoluteUrl, ogLocales, localeAlternates } from "@/lib/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ComingSoon } from "@/components/ComingSoon";

/* ------------------------------------------------------------
 *  Font loading (next/font/google)
 *  - ลงทะเบียน 3 ฟอนต์ตามภาษาแล้ว expose เป็น CSS variables
 *  - tailwind.config.ts อ้างอิง var(--font-*) เหล่านี้
 * ------------------------------------------------------------ */

const fontCairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const fontPrompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

/* ------------------------------------------------------------
 *  Static params — แจ้ง Next.js ว่า [locale] เป็นได้ค่าไหนบ้าง
 * ------------------------------------------------------------ */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/* ------------------------------------------------------------
 *  Metadata ตามภาษา (SEO + แท็บเบราว์เซอร์)
 * ------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale: Locale = params.locale;
  const dict = await getDictionary(locale);
  const isComingSoon = process.env.NEXT_PUBLIC_SITE_STATUS === "coming_soon";

  return {
    metadataBase: new URL(siteUrl),
    // "%s · TSAK" — หน้าย่อยตั้ง title เองแล้วต่อท้ายด้วยชื่อชมรม
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.brand.shortLabel ?? "TSAK"}`,
    },
    description: dict.meta.description,
    applicationName: dict.brand.name,
    alternates: localeAlternates(locale),
    // ถ้าอยู่ coming-soon → ห้าม index (กัน Google เก็บหน้า splash)
    robots: isComingSoon
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: dict.brand.name,
      title: dict.meta.title,
      description: dict.meta.description,
      url: absoluteUrl(`/${locale}`),
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

/* ------------------------------------------------------------
 *  Layout หลัก — หัวใจของระบบ i18n + RTL
 * ------------------------------------------------------------ */

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const dir = localeDirections[locale];
  // จับคู่ฟอนต์ตาม locale (อ้างอิง design)
  const activeFontVar = {
    th: "var(--font-prompt)",
    en: "var(--font-poppins)",
    ar: "var(--font-cairo)",
  }[locale];

  const [dict, channels] = await Promise.all([
    getDictionary(locale),
    getChannels(locale),
  ]);

  // ⚠️ Toggle "Coming Soon" mode
  //   - ตั้งใน Vercel env var: NEXT_PUBLIC_SITE_STATUS=coming_soon
  //   - เปิดเว็บจริง: ลบ env var ออก
  //   - Bypass สำหรับ preview: ใส่ ?preview=PREVIEW_KEY ใน URL ครั้งเดียว (cookie 30 วัน)
  const previewKey = process.env.PREVIEW_KEY;
  const cookieStore = cookies();
  const hasPreviewCookie =
    !!previewKey && cookieStore.get("tsak_preview")?.value === previewKey;
  const isComingSoon =
    process.env.NEXT_PUBLIC_SITE_STATUS === "coming_soon" && !hasPreviewCookie;

  // JSON-LD (Organization) — ช่วยให้ Google แสดงชื่อ/โลโก้ชมรมใน search result
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: dict.brand.name,
    alternateName: dict.brand.shortLabel,
    description: dict.meta.description,
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl("/logo.jpg"),
    email: "info@thaikuwait.org",
    areaServed: "KW",
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontCairo.variable} ${fontPrompt.variable} ${fontPoppins.variable}`}
      style={{ ["--font-active" as string]: activeFontVar }}
    >
      <body className="min-h-screen flex flex-col">
        {!isComingSoon && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
        )}
        {isComingSoon ? (
          <ComingSoon locale={locale} dict={dict} />
        ) : (
          <>
            <Navbar locale={locale} dict={dict} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} dict={dict} channels={channels} />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
