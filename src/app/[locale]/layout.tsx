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

// Base URL — เอาไว้ทำ absolute URLs ใน OG tags
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://tsak-web.vercel.app");

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale);
  const title = dict.meta.title;
  const description = dict.meta.description;
  const url = `${SITE_URL}/${params.locale}`;

  const ogLocale =
    params.locale === "th" ? "th_TH" : params.locale === "ar" ? "ar_KW" : "en_US";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // Open Graph — สำหรับ Facebook, LINE, WhatsApp, Discord
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: dict.brand.name,
      locale: ogLocale,
      // opengraph-image.tsx จะถูก auto-detected
    },
    // Twitter/X — auto-picked from openGraph if not set
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    // Alternates — บอก Google รู้ว่าเว็บมีหลายภาษา
    alternates: {
      canonical: url,
      languages: {
        th: `${SITE_URL}/th`,
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
        "x-default": `${SITE_URL}/th`,
      },
    },
    // Icons + theme color
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
    other: {
      "theme-color": "#0C3B45",
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

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontCairo.variable} ${fontPrompt.variable} ${fontPoppins.variable}`}
      style={{ ["--font-active" as string]: activeFontVar }}
    >
      <body className="min-h-screen flex flex-col">
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
