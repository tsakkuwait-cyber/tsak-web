"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * MobileMenu — burger menu สำหรับ viewport เล็ก (< md)
 * - แสดงเฉพาะเมื่อ Navbar ซ่อนเมนูปกติ (md:hidden)
 * - คลิก burger → เปิด drawer slide-down เต็มความกว้าง
 * - ปิดอัตโนมัติเมื่อ:
 *   1) กดที่ link เมนูใดเมนูหนึ่ง (route change)
 *   2) กดปุ่ม ✕
 *   3) กดที่ backdrop ด้านนอก
 *   4) กด Esc
 */
export function MobileMenu({
  navItems,
  supportLabel,
  supportHref,
}: {
  navItems: Array<{ href: string; label: string }>;
  supportLabel: string;
  supportHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ปิดเมนูเมื่อเปลี่ยน route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ปิดเมนูเมื่อกด Esc + ล็อก scroll เวลาเปิด
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Burger button (เห็นเฉพาะมือถือ) */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden grid h-10 w-10 place-items-center rounded-sm border border-line text-navy hover:bg-canvas transition-colors"
      >
        {open ? (
          // X icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          // Burger icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Backdrop + Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 top-16 z-40 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer slide-down */}
          <div
            className="md:hidden fixed inset-x-0 top-16 z-50 border-b border-line bg-white shadow-soft animate-in slide-in-from-top duration-200"
            role="dialog"
            aria-modal="true"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block rounded-sm px-4 py-3 text-[16px] font-semibold transition-colors",
                      isActive
                        ? "bg-brand-50 text-navy"
                        : "text-ink-soft hover:bg-canvas hover:text-navy",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Support CTA แยกข้างล่าง */}
              <Link
                href={supportHref}
                className="mt-3 inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-[15px] font-bold text-white shadow-cta hover:bg-brand-600 transition-colors"
              >
                {supportLabel}
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
