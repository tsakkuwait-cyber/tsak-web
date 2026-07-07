import "server-only";
import { google, type sheets_v4, type drive_v3 } from "googleapis";

/**
 * ============================================================
 *  Google Sheets API Client — คลังข้อมูลหลังบ้านแบบ "ฟรี 100%"
 * ============================================================
 *
 *  รุ่นพี่ตั้งใจให้รุ่นน้องที่ไม่ต้องเป็นโปรแกรมเมอร์ก็แก้ข้อมูล
 *  ในเว็บได้เพียงเปิด Google Sheet แล้วพิมพ์ตามคอลัมน์ที่กำหนด
 *
 *  --------------------------------------------------------------
 *  📋 โครงสร้าง Spreadsheet ที่แนะนำ (เพิ่ม sheet ได้ตามความต้องการ)
 *  --------------------------------------------------------------
 *
 *  Sheet ที่ 1: "stats"  — ตัวเลขสถิติบนหน้าแรก
 *    | key          | value | label_th       | label_en              | label_ar      |
 *    |--------------|-------|----------------|------------------------|---------------|
 *    | members      | 120   | สมาชิก          | Members                | الأعضاء       |
 *    | activities   | 18    | กิจกรรมในปีนี้  | Activities this year   | أنشطة هذا العام |
 *    | universities | 7     | มหาวิทยาลัย     | Universities           | الجامعات      |
 *    | years        | 25    | ปีที่ก่อตั้ง   | Years since founding   | سنوات         |
 *
 *  Sheet ที่ 2: "activities" — รายการกิจกรรม (กรอกครบทั้ง 3 ภาษา)
 *    | id  | date       | image_url           | published |
 *    | title_th | title_en | title_ar |
 *    | desc_th  | desc_en  | desc_ar  |
 *    | location_th | location_en | location_ar |
 *
 *  Sheet ที่ 3: "members" — รายชื่อสมาชิก (ข้อมูลไม่ลับ)
 *    | id  | name_th | name_en | name_ar | university | major | year | avatar_url |
 *
 *  Sheet ที่ 4: "committee" — คณะกรรมการชมรมประจำปี
 *    | id | year | role_th | role_en | role_ar |
 *    | name_th | name_en | name_ar | avatar_url | bio_th | bio_en | bio_ar |
 *
 *  💡 หลักการ Naming Convention
 *     - ใช้ snake_case + suffix ภาษา: `<field>_<locale>`
 *     - คอลัมน์แรกของทุก sheet ควรเป็น "id" (unique) เพื่อตั้ง key ตอน render
 *     - คอลัมน์ "published" (TRUE/FALSE) เอาไว้ซ่อน/แสดงโดยไม่ต้องลบแถว
 *     - แถวที่ 1 ของทุก sheet = header (ห้ามลบ ห้ามแก้ลำดับ)
 *
 *  --------------------------------------------------------------
 *  🔐 ขั้นตอน Setup Service Account (ครั้งเดียว)
 *  --------------------------------------------------------------
 *  1) ไป https://console.cloud.google.com → สร้าง Project ใหม่
 *  2) เมนู "APIs & Services" → เปิด "Google Sheets API"
 *  3) "Credentials" → "Create Credentials" → "Service Account"
 *  4) สร้าง JSON key → ดาวน์โหลด → คัดลอกค่าใส่ .env.local
 *  5) เปิด Google Sheet → กด "Share" → ใส่ email ของ service account
 *     (ต้องเป็น Viewer ขึ้นไป — ใช้ Editor ถ้าจะให้เว็บเขียนได้)
 *  6) คัดลอก Sheet ID จาก URL ใส่ .env.local
 * ============================================================
 */

// ---------------------------------------------------------------
// 1) Singleton client — สร้างครั้งเดียวต่อ process
// ---------------------------------------------------------------

let cachedAuth: InstanceType<typeof google.auth.JWT> | null = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error("[google-sheets] ขาดค่า GOOGLE_CLIENT_EMAIL หรือ GOOGLE_PRIVATE_KEY");
  }
  cachedAuth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
  return cachedAuth;
}

let cachedSheetsClient: sheets_v4.Sheets | null = null;
function getSheetsClient(): sheets_v4.Sheets {
  if (cachedSheetsClient) return cachedSheetsClient;
  cachedSheetsClient = google.sheets({ version: "v4", auth: getAuth() });
  return cachedSheetsClient;
}

let cachedDriveClient: drive_v3.Drive | null = null;
function getDriveClient(): drive_v3.Drive {
  if (cachedDriveClient) return cachedDriveClient;
  cachedDriveClient = google.drive({ version: "v3", auth: getAuth() });
  return cachedDriveClient;
}

/**
 * ถ้า URL เป็น Google Drive folder → ดึงรูปทั้งหมดในโฟลเดอร์
 * รองรับ format: https://drive.google.com/drive/folders/{FOLDER_ID}?...
 */
function extractFolderId(url: string): string | null {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

const folderCache = new Map<string, string[]>();

async function listDriveFolderImages(folderId: string): Promise<string[]> {
  if (folderCache.has(folderId)) return folderCache.get(folderId)!;
  try {
    const drive = getDriveClient();
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id,name)",
      orderBy: "name",
      pageSize: 100,
      // Support shared drives too
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const files = res.data.files ?? [];
    console.log(
      `[drive] folder "${folderId}" → พบ ${files.length} รูป`,
      files.slice(0, 3).map((f) => f.name)
    );
    // ใช้ thumbnail URL — เสถียรกว่า lh3 สำหรับไฟล์ที่ shared แบบ Anyone with link
    const urls = files
      .filter((f) => f.id)
      .map(
        (f) => `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`
      );
    folderCache.set(folderId, urls);
    return urls;
  } catch (err) {
    console.error(
      `[drive] อ่าน folder "${folderId}" ล้มเหลว:`,
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

/**
 * แปลง image_url string (comma/newline separated) เป็น array ของรูป
 * รองรับทั้ง single file URL และ folder URL (ดึงทุกรูปในโฟลเดอร์)
 */
async function expandImageUrls(raw: string): Promise<string[]> {
  if (!raw) return [];
  const parts = raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const folderId = extractFolderId(p);
    if (folderId) {
      const folderImgs = await listDriveFolderImages(folderId);
      out.push(...folderImgs);
    } else {
      const normalized = normalizeImageUrl(p);
      if (normalized) out.push(normalized);
    }
  }
  return out;
}

// ---------------------------------------------------------------
// 2) Helper — แปลง rows (string[][]) → array of objects โดยใช้แถวแรกเป็น key
// ---------------------------------------------------------------

export type SheetRow = Record<string, string>;

/**
 * แปลง Google Drive URL ทุก format ให้เป็น URL ที่แสดงเป็นรูปได้จริง
 * Google ปิด /uc?export=view ในปี 2024 → ต้องใช้ /thumbnail API แทน
 *
 * รองรับ input:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?export=view&id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID
 *
 * → output: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600
 *   (เสถียรที่สุดสำหรับไฟล์ที่ share แบบ Anyone with link)
 */
function normalizeImageUrl(url: string): string {
  if (!url) return "";
  // ถ้าเป็น folder URL → ไม่ normalize (return as-is → จะถูก expand ต่อ)
  if (/\/folders\//.test(url)) return url;
  const match = url.match(/(?:\/d\/|[?&]id=)([a-zA-Z0-9_-]{20,})/);
  if (!match) return url;
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
}

function rowsToObjects(rows: string[][]): SheetRow[] {
  if (!rows || rows.length < 2) return [];
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: SheetRow = {};
    header.forEach((key, idx) => {
      obj[key] = (row[idx] ?? "").toString().trim();
    });
    return obj;
  });
}

// ---------------------------------------------------------------
// 3) Core: getSheet() — ดึงข้อมูลจาก sheet (tab) ที่ระบุ
// ---------------------------------------------------------------

/**
 * ดึงข้อมูลจาก Google Sheet 1 tab แล้ว map เป็น array of objects
 *
 * @param sheetName ชื่อ tab (ตรงตามที่ตั้งใน Google Sheets — case sensitive)
 * @param range    A1 notation (default = ทั้ง tab)
 *
 * @example
 *   const activities = await getSheet("activities");
 *   const stats = await getSheet("stats", "A1:E10");
 */
export async function getSheet(
  sheetName: string,
  range?: string
): Promise<SheetRow[]> {
  // ถ้ายังไม่ตั้งค่า .env.local → return array ว่างแบบเงียบๆ
  // เพื่อให้ UI ยังขึ้นได้ตอน dev (ก่อนจะทำ Step 3-5 ใน setup guide)
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[google-sheets] ยังไม่ได้ตั้งค่า env vars — sheet "${sheetName}" จะ return [] (เป็นเรื่องปกติถ้ายังไม่ทำ Step 3-5)`
      );
    }
    return [];
  }

  const sheets = getSheetsClient();
  const fullRange = range ? `${sheetName}!${range}` : sheetName;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
    });
    return rowsToObjects((res.data.values as string[][]) ?? []);
  } catch (err) {
    console.error(`[google-sheets] อ่าน sheet "${sheetName}" ล้มเหลว:`, err);
    return [];
  }
}

// ---------------------------------------------------------------
// 4) Type-safe helpers ตาม schema ที่ออกแบบไว้
// ---------------------------------------------------------------

import type { Locale } from "@/i18n/config";

export interface StatItem {
  key: string;
  /** ค่าตัวเลขจริง (สำหรับ logic เปรียบเทียบ) — NaN ถ้าแปลงไม่ได้ */
  value: number;
  /** ค่าที่จะแสดงผล (รองรับ "40+", "1,200", ฯลฯ) */
  display: string;
  label: string;
}

export interface ActivityItem {
  id: string;
  date: string;
  /** URL รูปทั้งหมด (parse จาก image_url ที่คั่นด้วย comma/newline + expand folder) */
  images: string[];
  /** รูปแรก — ใช้แสดงเป็น thumbnail บนการ์ด (fallback ถ้าไม่มี coverUrl) */
  imageUrl: string;
  /** รูปหน้าปกเฉพาะ (ถ้าตั้งใน sheet — ใช้แทน images[0] ในการ์ด) */
  coverUrl: string;
  title: string;
  description: string;
  location: string;
  audience: "all" | "male" | "female";
}

/** อ่านสถิติแล้ว pick label ตามภาษา
 *  ภาษาอังกฤษ: capitalize ตัวแรกทุกคำ (แก้กรณี GOOGLETRANSLATE คืน lowercase เช่น "alumni")
 */
export async function getStats(locale: Locale): Promise<StatItem[]> {
  const rows = await getSheet("stats");
  return rows.map((r) => {
    const raw = (r.value ?? "").toString().trim();
    let label = r[`label_${locale}`] ?? r.label_en ?? r.key;
    if (locale === "en" && typeof label === "string") {
      label = label.replace(/\b[a-z]/g, (c: string) => c.toUpperCase());
    }
    return {
      key: r.key,
      value: Number(raw),
      display: raw || "—",
      label,
    };
  });
}

export interface InstitutionItem {
  id: string;
  short: string;
  name: string;
  studentsCount: number;
  area: string;
  type: string;
  /** คณะที่นักศึกษาไทยเรียน (แสดงเป็น chip ใน detail panel) */
  faculty: string;
  /** รูปโลโก้สถาบัน — แสดงในการ์ดและ pin บนแผนที่ */
  logoUrl: string;
  /** รูปสถาบัน (campus photo) — แสดงในด้านบนของ detail panel */
  imageUrl: string;
  /** ลิงก์เว็บไซต์ทางการ */
  website: string;
  /** พิกัด lat/lng สำหรับปักหมุดบนแผนที่คูเวต */
  lat: number;
  lng: number;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  year: string;
  /** ประเภทสภา: 'main' (รวม) | 'female' (สภาหญิงแยก) — default = 'main' */
  councilType: "main" | "female";
  /** คณะ + มหาวิทยาลัย (เช่น "วิศวกรรมศาสตร์ · Kuwait University") */
  faculty: string;
  /** ช่องทางติดต่อรายบุคคล (optional) */
  email: string;
  phone: string;
  line: string;
}

export type HighlightType =
  | "graduation"
  | "scholarship"
  | "award"
  | "welcome"
  | "story"
  | "volunteer";

export interface HighlightItem {
  id: string;
  year: string;
  type: HighlightType;
  name: string;
  institution: string;
  major: string;
  photoUrl: string;
  headline: string;
  story: string;
  /** ชื่อกลุ่ม (ว่าง = standalone) — items ที่ collection เดียวกันจะรวมเป็นกลุ่ม */
  collection: string;
  /** TRUE = ใช้เป็น cover ของกลุ่มนี้ (แสดงใน gallery); ถ้าไม่มีตัวไหน TRUE จะใช้ตัวแรก */
  isCover: boolean;
}

export interface DocumentItem {
  id: string;
  /** category — เช่น "ทุนการศึกษา" / "คู่มือ" / "แบบฟอร์ม" */
  category: string;
  title: string;
  description: string;
  /** Drive file ID (แยกออกมา — ใช้สร้าง preview URL ในคอมโพเนนต์) */
  fileId: string;
  /** URL ไฟล์ PDF ใน Drive (public share link) — จะแปลงเป็น direct-download อัตโนมัติ */
  fileUrl: string;
  /** URL รูปหน้าปก (optional — ถ้าไม่มี จะแสดง PDF icon) */
  coverUrl: string;
  /** วันที่ในรูปแบบ YYYY-MM-DD (สำหรับเรียง) */
  date: string;
  /** TRUE = ตรึงบนสุด (แสดงก่อน items อื่น) */
  pinned: boolean;
}

export interface ChannelItem {
  key: string;
  /** อีโมจิ/ตัวอักษรย่อ ใช้แสดงในไอคอนกล่อง */
  icon: string;
  /** label ตามภาษา (เช่น "อีเมล" / "Email" / "البريد") */
  label: string;
  value: string;
  /** URL ถ้าคลิกแล้วลิงก์ออกไป (mailto:, tel:, https:...) */
  href: string;
}

/**
 * อ่านรายชื่อสถาบันการศึกษา (tab "institutions")
 * Schema:
 *   id | short | name_th/en/ar | students | area_th/en/ar | type_th/en/ar
 *   | faculty_th/en/ar | logo_url | image_url | website | lat | lng | published
 */
export async function getInstitutions(locale: Locale): Promise<InstitutionItem[]> {
  const rows = await getSheet("institutions");
  return rows
    .filter((r) => (r.published ?? "TRUE").toUpperCase() !== "FALSE")
    .map((r) => ({
      id: r.id,
      short: r.short,
      name: r[`name_${locale}`] ?? r.name_th ?? r.name_en ?? "",
      studentsCount: Number(r.students) || 0,
      area: r[`area_${locale}`] ?? r.area_th ?? r.area_en ?? "",
      type: r[`type_${locale}`] ?? r.type_th ?? r.type_en ?? "",
      faculty: r[`faculty_${locale}`] ?? r.faculty_th ?? r.faculty_en ?? "",
      logoUrl: normalizeImageUrl(r.logo_url ?? ""),
      imageUrl: normalizeImageUrl(r.image_url ?? ""),
      website: r.website ?? "",
      lat: Number(r.lat) || 0,
      lng: Number(r.lng) || 0,
    }));
}

/**
 * อ่านคณะกรรมการชมรม (tab "committee")
 * Schema:
 *   id | year | council_type (main|female) | role_th/en/ar | name_th/en/ar
 *   | avatar_url | email | phone | line | published
 */
export async function getCouncil(locale: Locale): Promise<CouncilMember[]> {
  const rows = await getSheet("committee");
  return rows
    .filter((r) => (r.published ?? "TRUE").toUpperCase() !== "FALSE")
    .map((r) => {
      const councilType: CouncilMember["councilType"] =
        (r.council_type ?? "main").toLowerCase() === "female" ? "female" : "main";
      return {
        id: r.id,
        year: r.year,
        councilType,
        role: r[`role_${locale}`] ?? r.role_th ?? r.role_en ?? "",
        name: r[`name_${locale}`] ?? r.name_th ?? r.name_en ?? "",
        faculty: r[`faculty_${locale}`] ?? r.faculty_th ?? r.faculty_en ?? "",
        avatarUrl: normalizeImageUrl(r.avatar_url ?? ""),
        email: r.email ?? "",
        phone: r.phone ?? "",
        line: r.line ?? "",
      };
    });
}

/**
 * อ่านช่องทางติดต่อจาก tab "channels"
 * Schema:
 *   key | icon | label_th/en/ar | value | href | published
 *   ตัวอย่าง: email | @ | อีเมล | info@thaikuwait.org | mailto:info@thaikuwait.org
 */
export async function getChannels(locale: Locale): Promise<ChannelItem[]> {
  const rows = await getSheet("channels");
  return rows
    .filter((r) => (r.published ?? "TRUE").toUpperCase() !== "FALSE")
    .map((r) => ({
      key: r.key,
      icon: r.icon || "·",
      label: r[`label_${locale}`] ?? r.label_th ?? r.label_en ?? r.key,
      value: r.value ?? "",
      href: r.href ?? "",
    }));
}

/**
 * อ่าน highlights/spotlights/achievements รวมในตารางเดียว (tab "highlights")
 * Schema:
 *   id | year | type | name | institution | major
 *   | headline_th/en/ar | story_th/en/ar | photo_url | published
 *
 * type values: graduation | scholarship | award | welcome | story | volunteer
 */
export async function getHighlights(locale: Locale): Promise<HighlightItem[]> {
  const rows = await getSheet("highlights");
  return rows
    .filter((r) => (r.published ?? "TRUE").toUpperCase() !== "FALSE")
    .map((r) => {
      const t = (r.type ?? "story").toLowerCase();
      const type: HighlightType = (
        ["graduation", "scholarship", "award", "welcome", "story", "volunteer"].includes(t)
          ? t
          : "story"
      ) as HighlightType;
      return {
        id: r.id,
        year: r.year ?? "",
        type,
        // รองรับทั้งแบบ multi-lang (name_th/en/ar) และแบบเก่า (name เดียว)
        name: r[`name_${locale}`] ?? r.name_th ?? r.name_en ?? r.name ?? "",
        institution:
          r[`institution_${locale}`] ??
          r.institution_th ??
          r.institution_en ??
          r.institution ??
          "",
        major:
          r[`major_${locale}`] ??
          r.major_th ??
          r.major_en ??
          r.major ??
          "",
        photoUrl: normalizeImageUrl(r.photo_url ?? ""),
        headline: r[`headline_${locale}`] ?? r.headline_th ?? r.headline_en ?? "",
        story: r[`story_${locale}`] ?? r.story_th ?? r.story_en ?? "",
        collection: r.collection ?? "",
        isCover: (r.is_cover ?? "").toUpperCase() === "TRUE",
      };
    })
    .sort((a, b) => (a.year < b.year ? 1 : -1));
}

/**
 * อ่านคลังเอกสาร (tab "documents")
 * Schema:
 *   id | category_th/en/ar | title_th/en/ar | desc_th/en/ar | file_url | cover_url | date | pinned | published
 *
 * file_url = Drive link — จะแปลงเป็น `uc?export=download&id=<ID>` ให้ดาวน์โหลดตรง
 * cover_url = optional; ถ้าไม่มี UI จะแสดง PDF icon
 */
export async function getDocuments(locale: Locale): Promise<DocumentItem[]> {
  const rows = await getSheet("documents");
  return rows
    .filter((r) => (r.published ?? "TRUE").toUpperCase() !== "FALSE")
    .map((r) => {
      // แปลง Drive share URL → direct download URL + เก็บ file ID
      const rawUrl = (r.file_url ?? "").trim();
      const fileId =
        rawUrl.match(/\/d\/([^/]+)/)?.[1] ||
        rawUrl.match(/[?&]id=([^&]+)/)?.[1] ||
        "";
      const fileUrl = fileId
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : rawUrl;

      // cover_url จากชีท → ถ้าไม่มี fallback ไป Drive PDF thumbnail (หน้าแรก)
      const rawCover = (r.cover_url ?? "").trim();
      const coverUrl = rawCover
        ? normalizeImageUrl(rawCover)
        : fileId
        ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
        : "";

      return {
        id: r.id,
        category: r[`category_${locale}`] ?? r.category_th ?? r.category_en ?? r.category ?? "",
        title: r[`title_${locale}`] ?? r.title_th ?? r.title_en ?? "",
        description: r[`desc_${locale}`] ?? r.desc_th ?? r.desc_en ?? "",
        fileId,
        fileUrl,
        coverUrl,
        date: r.date ?? "",
        pinned: (r.pinned ?? "").toUpperCase() === "TRUE",
      };
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.date < b.date ? 1 : -1;
    });
}

/**
 * อ่าน content ที่แก้ใน sheet ได้ (tab "content")
 * Schema:
 *   key | value_th | value_en | value_ar | note
 *   ตัวอย่าง key: hero_title, hero_lead, about_title, about_text, cta_band_title, ...
 *
 * ใช้ override ข้อความใน dictionary JSON — ถ้า key ไม่มีใน sheet → fallback ไป dict
 */
export async function getContent(locale: Locale): Promise<Record<string, string>> {
  const rows = await getSheet("content");
  const out: Record<string, string> = {};
  for (const r of rows) {
    const v = r[`value_${locale}`] ?? r.value_th ?? r.value_en;
    if (r.key && v) {
      // Auto-normalize URL fields (key ลงท้ายด้วย _url) — แปลง Drive URL ให้โหลดได้
      out[r.key] = r.key.endsWith("_url") ? normalizeImageUrl(v) : v;
    }
  }
  return out;
}

/** อ่านรายการกิจกรรม — กรองเฉพาะที่ published = TRUE และเรียง date desc */
export async function getActivities(locale: Locale): Promise<ActivityItem[]> {
  const rows = await getSheet("activities");
  const filtered = rows.filter((r) => r.published?.toUpperCase() === "TRUE");
  // ประมวลผลแบบ parallel (แต่ละ activity อาจดึง Drive folder)
  const items = await Promise.all(
    filtered.map(async (r) => {
      // image_url = folder URL / comma-separated URLs (gallery)
      const galleryImages = await expandImageUrls(r.image_url || "");
      // รองรับหลายรูปแบบ: อังกฤษ, ไทย, มีช่องว่าง, มี Zero-Width space
      // ใช้ .includes() แทน === → ทนต่อคำแบบ "เฉพาะชาย" / "ผู้ชายเท่านั้น" ฯลฯ
      const audRaw = String(r.audience ?? "")
        .trim()
        .replace(/[​-‍﻿]/g, "") // ตัด zero-width chars
        .toLowerCase();
      let audience: ActivityItem["audience"] = "all";
      if (
        audRaw.includes("male") && !audRaw.includes("female") ||
        audRaw.includes("ชาย") && !audRaw.includes("หญิง") ||
        audRaw.includes("boy") ||
        audRaw.includes("men")
      ) {
        audience = "male";
      } else if (
        audRaw.includes("female") ||
        audRaw.includes("หญิง") ||
        audRaw.includes("girl") ||
        audRaw.includes("women")
      ) {
        audience = "female";
      }
      if (audRaw && audience === "all" && !audRaw.includes("all") && !audRaw.includes("ทุก") && !audRaw.includes("every")) {
        console.log(`[activity ${r.id}] audience="${r.audience}" ไม่ match → ใช้ default 'all'`);
      }

      // cover_url = single file URL OR folder URL (smart handling)
      let coverUrl = "";
      const rawCover = r.cover_url ?? "";
      if (rawCover) {
        const coverFolderId = extractFolderId(rawCover);
        if (coverFolderId) {
          // cover_url เป็น folder → เอารูปแรก + ใช้เป็น gallery ถ้า image_url ว่าง
          const coverFolderImgs = await listDriveFolderImages(coverFolderId);
          coverUrl = coverFolderImgs[0] ?? "";
          if (galleryImages.length === 0) {
            galleryImages.push(...coverFolderImgs);
          }
        } else {
          coverUrl = normalizeImageUrl(rawCover);
        }
      }
      // ถ้าไม่มี cover explicit → ใช้รูปแรกจาก gallery
      if (!coverUrl && galleryImages.length > 0) {
        coverUrl = galleryImages[0];
      }

      return {
        id: r.id,
        date: r.date,
        images: galleryImages,
        imageUrl: coverUrl,
        coverUrl,
        title: r[`title_${locale}`] ?? r.title_th ?? r.title_en ?? "",
        description: r[`desc_${locale}`] ?? r.desc_th ?? r.desc_en ?? "",
        location: r[`location_${locale}`] ?? r.location_th ?? r.location_en ?? "",
        audience,
      };
    })
  );
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}
