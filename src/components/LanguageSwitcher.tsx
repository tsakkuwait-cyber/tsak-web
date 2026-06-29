"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/**
 * Language Switcher — pill style ตาม design
 * - ปุ่ม active = พื้น navy + ตัวอักษรขาว
 * - ปุ่ม inactive = พื้นใส + ตัวอักษร ink-muted
 * - ทั้งหมดอยู่ในเส้นรอบ rounded-full + border line เดียว
 */
const labels: Record<Locale, string> = {
  th: "ไทย",
  en: "EN",
  ar: "عربي",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  const buildHref = (target: Locale) => {
    if (!pathname) return `/${target}`;
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  };

  return (
    <div
      className="flex items-center overflow-hidden rounded-sm border border-line bg-white"
      role="group"
      aria-label="Language switcher"
    >
      {locales.map((loc) => {
        const isActive = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={buildHref(loc)}
            aria-current={isActive ? "true" : undefined}
            className={[
              "px-[13px] py-2 text-[13px] font-bold transition-colors",
              isActive
                ? "bg-navy text-white"
                : "text-ink-muted hover:bg-canvas",
            ].join(" ")}
          >
            {labels[loc]}
          </Link>
        );
      })}
    </div>
  );
}
