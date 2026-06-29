import "server-only";
import type { Locale } from "./config";

/**
 * Dynamic import dictionary ตาม locale (server-side เท่านั้น)
 * - แต่ละไฟล์ JSON จะถูก split bundle แยกกัน → ไม่ส่งภาษาอื่นมาที่ client
 * - ใช้ใน Server Component: const dict = await getDictionary(locale)
 */

const dictionaries = {
  th: () => import("./dictionaries/th.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["th"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.th;
  return loader();
}
