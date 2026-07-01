import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getChannels } from "@/lib/google-sheets";

/**
 * Footer — dark navy 4 columns
 *  - Column 1: brand + about
 *  - Column 2: quick links
 *  - Column 3: contact (จาก channels sheet — dynamic)
 *  - Column 4: follow / lang note
 *  - Bottom: rights + developer credit
 */
export async function Footer({
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

  // Pull contact channels from sheet (server-side)
  const channels = await getChannels(locale);
  const contactChannels = channels.filter((ch) =>
    ["email", "phone", "address"].includes(ch.key)
  );
  const socialChannels = channels.filter((ch) =>
    ["facebook", "instagram", "line"].includes(ch.key)
  );

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

        {/* Column 3 — Contact (from sheet) */}
        <div>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-brand-200">
            {dict.footer.contactT}
          </div>
          <div className="flex flex-col gap-[11px] text-[14.5px]">
            {contactChannels.length > 0 ? (
              contactChannels.map((ch) => {
                const content = (
                  <span dir="auto" className="truncate">
                    {ch.value}
                  </span>
                );
                return ch.href ? (
                  <a
                    key={ch.key}
                    href={ch.href}
                    className="hover:text-white transition-colors truncate"
                  >
                    {content}
                  </a>
                ) : (
                  <span key={ch.key} className="truncate">{content}</span>
                );
              })
            ) : (
              <span dir="auto">info@thaikuwait.org</span>
            )}
          </div>
        </div>

        {/* Column 4 — Follow / Social */}
        <div>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-brand-200">
            {dict.footer.follow}
          </div>
          {socialChannels.length > 0 ? (
            <div className="flex flex-col gap-[11px] text-[14.5px]">
              {socialChannels.map((ch) =>
                ch.href ? (
                  <a
                    key={ch.key}
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <span className="grid h-6 w-6 place-items-center bg-white/10 text-[11px] font-bold text-brand-200">
                      {ch.icon}
                    </span>
                    <span dir="auto" className="truncate">
                      {ch.value}
                    </span>
                  </a>
                ) : (
                  <span key={ch.key} className="inline-flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center bg-white/10 text-[11px] font-bold text-brand-200">
                      {ch.icon}
                    </span>
                    <span dir="auto" className="truncate">
                      {ch.value}
                    </span>
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="m-0 text-[13px] leading-relaxed">{dict.footer.langNote}</p>
          )}
        </div>
      </div>

      {/* bottom bar — rights + developer credit */}
      <div className="border-t border-white/10">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-5 text-[12.5px]">
          <div>
            © {year} {dict.brand.name} · {dict.footer.rights}
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-[#7FD8CF]/70">Developed by</span>
            <a
              href="https://github.com/tsakkuwait-cyber"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-200 hover:text-white transition-colors"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white text-[10px] font-extrabold">
                M
              </span>
              Munardil
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
