import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Footer — match petrol design
 *   - พื้น navy-dark (เข้มกว่า navy ของ hero)
 *   - 4 cols: brand+about | quick links | contact | follow
 *   - bottom bar เล็กๆ
 */
export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();
  const quickLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/students`, label: dict.nav.students },
    { href: `/${locale}/activities`, label: dict.nav.activities },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <footer className="bg-navy-dark text-[#9CC6C2]">
      <div
        className="container grid gap-9 py-[clamp(44px,6vw,64px)]"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {/* Column 1 — Brand + About */}
        <div className="max-w-[30ch]">
          <div className="mb-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="TSAK"
              className="h-12 w-12 flex-none object-contain"
            />
            <span className="font-extrabold text-[15px] leading-tight text-white">
              {dict.brand.name}
            </span>
          </div>
          <p className="m-0 text-[14px] leading-relaxed text-[#8FA9C2]">
            {dict.footer.about}
          </p>
        </div>

        {/* Column 2 — Quick links */}
        <div>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-brand-200">
            {dict.footer.quick}
          </div>
          <div className="flex flex-col items-start gap-[11px]">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[14.5px] hover:text-white transition-colors text-start"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3 — Contact */}
        <div>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-brand-200">
            {dict.footer.contactT}
          </div>
          <div className="flex flex-col gap-[11px] text-[14.5px]">
            <span>info@thaikuwait.org</span>
            <span dir="ltr">+965 5xxx xxxx</span>
            <span>{dict.footer.location}</span>
          </div>
        </div>

        {/* Column 4 — Follow */}
        <div>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-brand-200">
            {dict.footer.follow}
          </div>
          <p className="m-0 text-[13px] leading-relaxed">{dict.footer.langNote}</p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 text-center text-[13px]">
          © {year} {dict.brand.name} · {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
