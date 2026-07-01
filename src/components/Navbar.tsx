import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

/**
 * Navbar — Server Component
 * Desktop (≥ md): logo + nav links + lang switcher + Support CTA
 * Mobile  (< md): logo + lang switcher + burger menu (เมนู+CTA ย้ายเข้า drawer)
 */
export function Navbar({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navItems = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/students`, label: dict.nav.students },
    { href: `/${locale}/activities`, label: dict.nav.activities },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const supportHref = `/${locale}/contact`;

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-50 w-full border-b border-line bg-white/[0.93] backdrop-blur-md"
    >
      {/* accent bar 3px ตาม petrol design */}
      <div className="h-[3px] w-full bg-brand" />
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* LOGO + brand — โลโก้ลอย ไม่มีกรอบ (โลโก้มีวงกลมเหลืองอยู่แล้ว) */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 min-w-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="TSAK"
            className="h-11 w-11 sm:h-[52px] sm:w-[52px] flex-none object-contain"
          />
          <span className="flex flex-col leading-tight text-start min-w-0">
            <span className="font-extrabold text-[13px] sm:text-[15px] text-navy truncate max-w-[180px] sm:max-w-none">
              {dict.brand.name}
            </span>
            <span className="hidden sm:block text-[11.5px] font-medium tracking-wider text-ink-subtle">
              {dict.brand.shortLabel}
            </span>
          </span>
        </Link>

        {/* DESKTOP nav */}
        <nav className="hidden md:flex items-center gap-x-[clamp(14px,2.5vw,30px)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[15px] font-semibold text-ink-muted hover:text-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT side: Lang switcher + (desktop) Support CTA + (mobile) Burger */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <LanguageSwitcher currentLocale={locale} />

          {/* Desktop only — Support CTA inline */}
          <Link
            href={supportHref}
            className="hidden md:inline-flex whitespace-nowrap rounded-sm bg-brand px-5 py-[11px] text-[14px] font-bold text-white shadow-cta hover:bg-brand-600 transition-colors"
          >
            {dict.cta.support}
          </Link>

          {/* Mobile only — Burger menu (เมนูและ Support ย้ายเข้า drawer) */}
          <MobileMenu
            navItems={navItems}
            supportLabel={dict.cta.support}
            supportHref={supportHref}
          />
        </div>
      </div>
    </header>
  );
}
