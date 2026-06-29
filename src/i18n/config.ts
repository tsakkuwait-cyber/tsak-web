/**
 * ศูนย์กลางการตั้งค่า i18n
 * - เพิ่ม/ลบภาษาแก้ที่ไฟล์นี้ที่เดียว ทั้งระบบจะอัปเดตตาม (type-safe)
 * - `dir` ใช้กำหนดทิศทาง HTML (ltr/rtl) อัตโนมัติใน layout
 */

export const locales = ["th", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const localeNames: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
  ar: "العربية",
};

/** ทิศทางของแต่ละภาษา — ภาษาอาหรับเป็น RTL */
export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  th: "ltr",
  en: "ltr",
  ar: "rtl",
};

/** ตรวจสอบว่า string ที่รับมาเป็น Locale ที่รองรับหรือไม่ (type guard) */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
