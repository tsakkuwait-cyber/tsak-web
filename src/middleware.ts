import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const PREVIEW_COOKIE = "tsak_preview";
const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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
  const { pathname, searchParams } = request.nextUrl;

  // ── Preview bypass: ถ้ามี ?preview=KEY ตรงกับ env → ตั้ง cookie แล้ว redirect URL สะอาด ──
  const previewKey = process.env.PREVIEW_KEY;
  const queryPreview = searchParams.get("preview");
  if (previewKey && queryPreview === previewKey) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("preview");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(PREVIEW_COOKIE, previewKey, {
      maxAge: PREVIEW_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    return response;
  }

  // ── Locale redirect (เดิม) ──
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
