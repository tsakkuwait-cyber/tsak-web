import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Middleware สำหรับจัดการ Locale ใน URL
 * - ถ้า path ไม่มี locale prefix (เช่น "/", "/about") → redirect ไปยัง /{defaultLocale}/...
 * - ถ้ามี locale prefix อยู่แล้ว → ผ่านไปตามปกติ
 *
 * ตัวอย่าง:
 *   /            → /th
 *   /about       → /th/about
 *   /en/about    → ผ่านเลย
 */
function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocalePrefix(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // ข้าม static files, _next, favicon, robots, sitemap, api
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
