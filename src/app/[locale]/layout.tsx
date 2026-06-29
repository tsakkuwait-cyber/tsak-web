import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
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

  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontCairo.variable} ${fontPrompt.variable} ${fontPoppins.variable}`}
      style={{ ["--font-active" as string]: activeFontVar }}
    >
      <body className="min-h-screen flex flex-col">
        <Navbar locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
        {/* Vercel Analytics — เก็บสถิติเข้าชม (เห็นใน Vercel dashboard หลัง deploy) */}
        <Analytics />
        {/* Speed Insights — เก็บ Core Web Vitals (ความเร็วเว็บ) */}
        <SpeedInsights />
      </body>
    </html>
  );
}
