import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { locales, localeNames } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * ComingSoon — splash page เต็มหน้าจอ ซ่อนเว็บจริง
 * - แสดงเมื่อ NEXT_PUBLIC_SITE_STATUS = "coming_soon"
 * - มี language switcher (เห็นได้ทั้ง 3 ภาษา)
 * - Petrol theme เด่นเป็นมืออาชีพ
 */
export function ComingSoon({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-navy text-white overflow-hidden">
      {/* Soft glow + orbs — elegant */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div
        className="absolute -top-40 -end-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(16,150,141,0.3), transparent)",
        }}
      />
      <div
        className="absolute -bottom-40 -start-40 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(127,216,207,0.14), transparent)",
        }}
      />
      {/* Kuwait outline */}
      <svg
        viewBox="0 0 100 100"
        className="absolute -end-16 -bottom-20 pointer-events-none"
        style={{
          width: "min(60vw, 600px)",
          height: "min(60vw, 600px)",
          opacity: 0.1,
        }}
      >
        <path
          d="M 13 14 L 28 12 L 46 11 L 60 11 L 67 13 L 70 17 L 71 22 L 72 28 L 74 34 L 70 38 L 62 40 L 54 42 L 48 46 L 52 51 L 60 52 L 68 53 L 74 58 L 77 65 L 77 73 L 75 80 L 70 85 L 60 87 L 42 87 L 24 85 L 14 82 L 9 75 L 7 62 L 7 48 L 8 32 L 10 22 Z"
          fill="none"
          stroke="#7FD8CF"
          strokeWidth="0.8"
        />
      </svg>

      {/* Top — accent bar + lang switcher */}
      <div className="h-[3px] w-full bg-brand" />
      <div className="container relative z-10 flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="TSAK" className="h-11 w-11 object-contain" />
          <span className="text-[13px] font-bold tracking-wider text-[#BBDCD9]">
            {dict.brand.shortLabel}
          </span>
        </div>
        {/* Lang switcher (inline, no Link routing — เปลี่ยน path เท่านั้น) */}
        <div className="flex items-center overflow-hidden rounded-sm border border-white/20 bg-white/5">
          {locales.map((loc) => {
            const isActive = loc === locale;
            return (
              <Link
                key={loc}
                href={`/${loc}`}
                className={[
                  "px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                  isActive
                    ? "bg-brand text-white"
                    : "text-[#BBDCD9] hover:bg-white/10",
                ].join(" ")}
              >
                {localeNames[loc]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Center content */}
      <main className="container relative z-10 flex flex-1 flex-col items-center justify-center text-center py-12">
        {/* Big logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt="TSAK"
          className="h-[clamp(100px,15vw,140px)] w-[clamp(100px,15vw,140px)] object-contain mb-8"
        />

        {/* Brand label */}
        <div className="font-display text-[13px] font-bold tracking-[0.16em] uppercase text-brand-200 mb-3">
          EST. 2011
        </div>

        {/* Brand name (big) */}
        <h1 className="text-[clamp(28px,4.5vw,52px)] font-extrabold leading-[1.15] max-w-[20ch]">
          {dict.brand.name}
        </h1>

        {/* Coming Soon badge */}
        <div className="mt-10 inline-flex items-center gap-3 bg-brand px-7 py-3 text-[15px] font-bold tracking-wider uppercase shadow-cta">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          {dict.comingSoon.badge}
        </div>

        {/* Subtitle */}
        <p className="mt-8 max-w-[50ch] text-[clamp(15px,1.6vw,18px)] leading-[1.85] text-[#BBDCD9]">
          {dict.comingSoon.message}
        </p>

        {/* Optional — contact for urgent matters */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[13px] text-[#BBDCD9]">
          <span>{dict.comingSoon.contactLabel}</span>
          <a
            href="mailto:info@thaikuwait.org"
            className="font-semibold text-brand-200 hover:text-white"
          >
            info@thaikuwait.org
          </a>
        </div>
      </main>

      {/* Footer accent */}
      <div className="container relative z-10 py-6 text-center text-[12px] text-[#7FD8CF]/60">
        © {new Date().getFullYear()} {dict.brand.name}
      </div>
    </div>
  );
}
