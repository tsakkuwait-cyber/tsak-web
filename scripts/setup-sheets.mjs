/**
 * ════════════════════════════════════════════════════════════════
 *  setup-sheets.mjs — สคริปต์ตั้งค่า Google Sheet ครั้งเดียว
 *
 *  ใช้เมื่อ:
 *   • Setup ครั้งแรก (สร้าง tabs ทั้งหมด + ใส่ข้อมูลตัวอย่าง)
 *   • Reset ข้อมูลกลับเป็น default
 *   • เพิ่ม tab ใหม่ที่โค้ดต้องการ
 *
 *  ต้องการก่อนรัน:
 *   1. .env.local มี GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
 *   2. Service Account ต้องเป็น "Editor" ของ Sheet (ไม่ใช่ Viewer)
 *
 *  วิธีรัน:
 *      npm run setup-sheets
 * ════════════════════════════════════════════════════════════════
 */

import { google } from "googleapis";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ── โหลด .env.local เอง (ไม่ใช้ Next.js loader) ────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
if (!existsSync(envPath)) {
  console.error("❌ ไม่พบ .env.local — กรุณาสร้างก่อน");
  process.exit(1);
}
for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let value = m[2];
  // ตัด quote ครอบ (ถ้ามี)
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!process.env[m[1]]) process.env[m[1]] = value;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error("❌ ขาด env vars: GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  // ⚠️ ต้องใช้ scope เต็ม (ไม่ใช่ readonly) — Service Account ต้องเป็น Editor
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// ════════════════════════════════════════════════════════════════
//  DATA — แก้ตรงนี้เพื่อเปลี่ยนค่า default
// ════════════════════════════════════════════════════════════════

/** Helper: สร้างสูตรแปลภาษา */
const tr = (col, row, to) => `=IFERROR(GOOGLETRANSLATE(${col}${row},"th","${to}"),"")`;

/** Tab: stats */
const statsData = [
  ["key", "value", "label_th", "label_en", "label_ar"],
  ["members", "58", "นักศึกษาไทย", tr("C", 2, "en"), tr("C", 2, "ar")],
  ["institutions", "4", "สถาบันการศึกษา", tr("C", 3, "en"), tr("C", 3, "ar")],
  ["years", "31", "ปีที่ดำเนินงาน", tr("C", 4, "en"), tr("C", 4, "ar")],
  ["events", "40+", "กิจกรรมต่อปี", tr("C", 5, "en"), tr("C", 5, "ar")],
  ["male", "29", "ชาย", tr("C", 6, "en"), tr("C", 6, "ar")],
  ["female", "29", "หญิง", tr("C", 7, "en"), tr("C", 7, "ar")],
  ["alumni", "200+", "ศิษย์เก่า", tr("C", 8, "en"), tr("C", 8, "ar")],
  ["scholarships", "15", "ทุนการศึกษา", tr("C", 9, "en"), tr("C", 9, "ar")],
];

/** Tab: content — ข้อความบนเว็บที่แก้ได้ */
const contentData = [
  ["key", "value_th", "value_en", "value_ar", "note"],
  ["hero_kicker", "ยินดีต้อนรับ", tr("B", 2, "en"), tr("B", 2, "ar"), "คำขึ้นต้น Hero"],
  ["hero_title", "บ้านของนักศึกษาไทย ในรัฐคูเวต", tr("B", 3, "en"), tr("B", 3, "ar"), "หัวข้อใหญ่ Hero"],
  ["hero_lead", "ชมรมนักศึกษาไทยในคูเวต เป็นศูนย์รวมและสื่อกลางของนักศึกษาไทยที่กำลังศึกษาในรัฐคูเวต เราดูแลกันเหมือนครอบครัว", tr("B", 4, "en"), tr("B", 4, "ar"), "คำบรรยาย Hero"],
  ["about_title", "ดูแลกัน เหมือนครอบครัวเดียวกัน", tr("B", 5, "en"), tr("B", 5, "ar"), "Section 01 About"],
  ["about_text", "ชมรมก่อตั้งขึ้นเพื่อเป็นสื่อกลางระหว่างนักศึกษาไทย สถานเอกอัครราชทูต และชุมชนไทยในคูเวต เราจัดกิจกรรม ให้คำปรึกษา และช่วยเหลือสมาชิกในยามจำเป็น", tr("B", 6, "en"), tr("B", 6, "ar"), "เนื้อหา Section 01"],
  ["cta_band_title", "ร่วมสนับสนุนนักศึกษาไทยในคูเวต", tr("B", 7, "en"), tr("B", 7, "ar"), "CTA band title"],
  ["cta_band_text", "การสนับสนุนของท่านช่วยให้ชมรมจัดกิจกรรมและมอบทุนการศึกษาแก่สมาชิก ชมรมไม่มีการบังคับบริจาค", tr("B", 8, "en"), tr("B", 8, "ar"), "CTA band text"],
  ["est_year", "2011", "", "", "ปีก่อตั้งชมรม"],
  ["hero_photo_url", "", "", "", "URL รูปกลุ่มสมาชิก (Google Drive) แสดงใน Hero หน้าแรก"],
  ["about_photo_url", "", "", "", "URL รูปประกอบ Section 01 About (ครอบครัวของเรา)"],
  ["pillar_1_photo_url", "", "", "", "รูปประกอบ Pillar 1 — ต้อนรับน้องใหม่"],
  ["pillar_2_photo_url", "", "", "", "รูปประกอบ Pillar 2 — สนับสนุนการเรียน"],
  ["pillar_3_photo_url", "", "", "", "รูปประกอบ Pillar 3 — สืบสานวัฒนธรรม"],
];

/** Tab: institutions — 4 สถาบันที่นักศึกษาไทยเรียนจริงในคูเวต
 *  faculty_th: รูปแบบ "name:count, name:count" (จำนวน นศ. ไทยในแต่ละคณะ)
 *  lat/lng: พิกัดจริง ใช้ปักหมุดบนแผนที่
 */
const institutionsData = [
  ["id", "short", "name_th", "name_en", "name_ar", "students", "area_th", "area_en", "area_ar", "type_th", "type_en", "type_ar", "faculty_th", "faculty_en", "faculty_ar", "logo_url", "image_url", "website", "lat", "lng", "published"],
  ["1", "KU", "มหาวิทยาลัยคูเวต", tr("C", 2, "en"), tr("C", 2, "ar"), "28", "ชาดียา", tr("G", 2, "en"), tr("G", 2, "ar"), "รัฐบาล (อุดมศึกษา)", tr("J", 2, "en"), tr("J", 2, "ar"), "วิศวกรรมศาสตร์:5, แพทยศาสตร์:8, รัฐศาสตร์:6, บริหารธุรกิจ:9", tr("M", 2, "en"), tr("M", 2, "ar"), "", "", "https://www.ku.edu.kw", "29.243", "47.937", "TRUE"],
  ["2", "PAAET", "องค์การการศึกษาประยุกต์และฝึกอบรม", tr("C", 3, "en"), tr("C", 3, "ar"), "20", "อัดไลียา", tr("G", 3, "en"), tr("G", 3, "ar"), "รัฐบาล (อุดมศึกษา)", tr("J", 3, "en"), tr("J", 3, "ar"), "เทคโนโลยี:8, ครุศาสตร์:4, สาธารณสุข:3, บริหารธุรกิจ:5", tr("M", 3, "en"), tr("M", 3, "ar"), "", "", "https://www.paaet.edu.kw", "29.346", "47.991", "TRUE"],
  ["3", "BHS", "โรงเรียนมัธยมชาย", tr("C", 4, "en"), tr("C", 4, "ar"), "6", "เมืองคูเวต", tr("G", 4, "en"), tr("G", 4, "ar"), "รัฐบาล (มัธยมศึกษา)", tr("J", 4, "en"), tr("J", 4, "ar"), "ม.4:3, ม.5:2, ม.6:1", tr("M", 4, "en"), tr("M", 4, "ar"), "", "", "", "29.378", "47.990", "TRUE"],
  ["4", "GHS", "โรงเรียนมัธยมหญิง", tr("C", 5, "en"), tr("C", 5, "ar"), "4", "เมืองคูเวต", tr("G", 5, "en"), tr("G", 5, "ar"), "รัฐบาล (มัธยมศึกษา)", tr("J", 5, "en"), tr("J", 5, "ar"), "ม.4:2, ม.5:2, ม.6:0", tr("M", 5, "en"), tr("M", 5, "ar"), "", "", "", "29.385", "47.965", "TRUE"],
];

/** Tab: committee */
const committeeData = [
  ["id", "year", "council_type", "role_th", "role_en", "role_ar", "name_th", "name_en", "name_ar", "avatar_url", "email", "phone", "line", "published"],
  ["1", "2026", "main", "ประธานชมรม", tr("D", 2, "en"), tr("D", 2, "ar"), "นายภานุ ใจดี", tr("G", 2, "en"), tr("G", 2, "ar"), "", "panu@example.com", "+966 5xxx xxxx", "@panu", "TRUE"],
  ["2", "2026", "main", "รองประธาน", tr("D", 3, "en"), tr("D", 3, "ar"), "นายธนัท สมาร์ท", tr("G", 3, "en"), tr("G", 3, "ar"), "", "thanat@example.com", "", "@thanat", "TRUE"],
  ["3", "2026", "main", "เลขานุการ", tr("D", 4, "en"), tr("D", 4, "ar"), "นายเก่ง พูดเก่ง", tr("G", 4, "en"), tr("G", 4, "ar"), "", "keng@example.com", "", "", "TRUE"],
  ["4", "2026", "main", "เหรัญญิก", tr("D", 5, "en"), tr("D", 5, "ar"), "นายเงิน รักษาดี", tr("G", 5, "en"), tr("G", 5, "ar"), "", "ngern@example.com", "", "", "TRUE"],
  ["5", "2026", "female", "ประธานสภาหญิง", tr("D", 6, "en"), tr("D", 6, "ar"), "นางสาวสุดา ดีงาม", tr("G", 6, "en"), tr("G", 6, "ar"), "", "suda@example.com", "+966 5xxx xxxx", "@suda", "TRUE"],
  ["6", "2026", "female", "รองประธานสภาหญิง", tr("D", 7, "en"), tr("D", 7, "ar"), "นางสาวพิมพ์ใจ มีเงิน", tr("G", 7, "en"), tr("G", 7, "ar"), "", "pimjai@example.com", "", "@pimjai", "TRUE"],
  ["7", "2026", "female", "เลขานุการสภาหญิง", tr("D", 8, "en"), tr("D", 8, "ar"), "นางสาวจอย รักกิจกรรม", tr("G", 8, "en"), tr("G", 8, "ar"), "", "joy@example.com", "", "", "TRUE"],
  ["8", "2026", "female", "เหรัญญิกสภาหญิง", tr("D", 9, "en"), tr("D", 9, "ar"), "นางสาวมุก รักษาเงิน", tr("G", 9, "en"), tr("G", 9, "ar"), "", "muk@example.com", "", "@muk", "TRUE"],
];

/** Tab: channels */
const channelsData = [
  ["key", "icon", "label_th", "label_en", "label_ar", "value", "href", "published"],
  ["email", "@", "อีเมล", tr("C", 2, "en"), tr("C", 2, "ar"), "info@thaikuwait.org", "mailto:info@thaikuwait.org", "TRUE"],
  ["phone", "☎", "โทรศัพท์", tr("C", 3, "en"), tr("C", 3, "ar"), "+965 5xxx xxxx", "tel:+9655xxxxxxx", "TRUE"],
  ["address", "⌖", "ที่อยู่", tr("C", 4, "en"), tr("C", 4, "ar"), "เมืองคูเวต รัฐคูเวต", "", "TRUE"],
  ["facebook", "f", "Facebook", "Facebook", "Facebook", "@tsak.kuwait", "https://facebook.com/tsak.kuwait", "TRUE"],
  ["instagram", "◎", "Instagram", "Instagram", "Instagram", "@tsak.kuwait", "https://instagram.com/tsak.kuwait", "TRUE"],
  ["line", "L", "LINE", "LINE", "LINE", "@tsakkuwait", "https://line.me/R/ti/p/@tsakkuwait", "TRUE"],
];

/** Tab: activities — ตัวอย่าง 5 รายการพร้อม audience + cover_url */
const activitiesData = [
  ["id", "date", "cover_url", "image_url", "published", "title_th", "title_en", "title_ar", "desc_th", "desc_en", "desc_ar", "location_th", "location_en", "location_ar", "audience"],
  ["1", "2026-04-13", "", "", "TRUE", "เทศกาลสงกรานต์ 2026", tr("F", 2, "en"), tr("F", 2, "ar"), "เฉลิมฉลองวันปีใหม่ไทย ด้วยพิธีรดน้ำดำหัว อาหารไทย", tr("I", 2, "en"), tr("I", 2, "ar"), "สถานเอกอัครราชทูตไทย เมืองคูเวต", tr("L", 2, "en"), tr("L", 2, "ar"), "all"],
  ["2", "2025-11-15", "", "", "TRUE", "เทศกาลลอยกระทง 2025", tr("F", 3, "en"), tr("F", 3, "ar"), "งานลอยกระทงประจำปี พร้อมกระทง ดนตรีไทย และอาหารไทย", tr("I", 3, "en"), tr("I", 3, "ar"), "สถานเอกอัครราชทูตไทย", tr("L", 3, "en"), tr("L", 3, "ar"), "all"],
  ["3", "2025-09-10", "", "", "TRUE", "ต้อนรับน้องใหม่ 2025", tr("F", 4, "en"), tr("F", 4, "ar"), "Orientation สำหรับนักศึกษาไทยที่เพิ่งมาถึง ช่วยเรื่องที่พักและการลงทะเบียนเรียน", tr("I", 4, "en"), tr("I", 4, "ar"), "มหาวิทยาลัยคูเวต", tr("L", 4, "en"), tr("L", 4, "ar"), "all"],
  ["4", "2025-07-12", "", "", "TRUE", "กิจกรรมสภานักศึกษาหญิง", tr("F", 5, "en"), tr("F", 5, "ar"), "เวิร์กช็อปทำขนมไทย + แลกเปลี่ยนวัฒนธรรม เฉพาะสมาชิกหญิง", tr("I", 5, "en"), tr("I", 5, "ar"), "บ้านพักประธานสภาหญิง", tr("L", 5, "en"), tr("L", 5, "ar"), "female"],
  ["5", "2025-06-20", "", "", "TRUE", "ฟุตบอลสานสัมพันธ์", tr("F", 6, "en"), tr("F", 6, "ar"), "แข่งฟุตบอลกับนักศึกษานานาชาติ — เฉพาะนักศึกษาชาย", tr("I", 6, "en"), tr("I", 6, "ar"), "GUST Sports Complex", tr("L", 6, "en"), tr("L", 6, "ar"), "male"],
];

/** Tab: highlights — poster gallery style (รูปเป็นหลัก)
 *  type values: graduation | scholarship | award | welcome | story | volunteer
 *
 *  🎯 ใช้งาน:
 *    • รูปการ์ดจบการศึกษา / รูปได้รางวัล / รูปกิจกรรม ฯลฯ → paste URL Drive ใน photo_url
 *    • name = ชื่อคน (แสดงใต้รูป)
 *    • headline (short) = คำบรรยายสั้น (แสดงใน lightbox)
 *    • story = เนื้อหายาว (optional, แสดงใน lightbox)
 *    • ระบบจะเรียงตาม year ล่าสุดขึ้นก่อน
 */
/** Highlights schema (columns letters for reference):
 *   A id | B year | C type
 *   D name_th | E name_en | F name_ar     (สูตรแปลอัตโนมัติ E,F จาก D)
 *   G institution_th | H institution_en | I institution_ar  (สูตรแปลจาก G)
 *   J major_th | K major_en | L major_ar   (สูตรแปลจาก J)
 *   M headline_th | N headline_en | O headline_ar   (สูตรแปลจาก M)
 *   P story_th | Q story_en | R story_ar   (สูตรแปลจาก P)
 *   S photo_url | T collection | U is_cover | V published
 */
const highlightsData = [
  ["id", "year", "type", "name_th", "name_en", "name_ar", "institution_th", "institution_en", "institution_ar", "major_th", "major_en", "major_ar", "headline_th", "headline_en", "headline_ar", "story_th", "story_en", "story_ar", "photo_url", "collection", "is_cover", "published"],
  // Cover of class-2025-sumait collection
  ["1", "2025", "graduation", "", tr("D", 2, "en"), tr("D", 2, "ar"), "สถาบันอับดุลเราะห์มาน อัล-สุไมต์", tr("G", 2, "en"), tr("G", 2, "ar"), "", tr("J", 2, "en"), tr("J", 2, "ar"), "รุ่นจบการศึกษา 2025 · Al-Sumait", tr("M", 2, "en"), tr("M", 2, "ar"), "ผู้จบการศึกษาจากสถาบัน Abdulrahman Al-Sumait ปีการศึกษา 2025", tr("P", 2, "en"), tr("P", 2, "ar"), "", "class-2025-sumait", "TRUE", "TRUE"],
  ["2", "2025", "graduation", "นายอักรอม มะเซ็ง", tr("D", 3, "en"), tr("D", 3, "ar"), "สถาบันอับดุลเราะห์มาน อัล-สุไมต์", tr("G", 3, "en"), tr("G", 3, "ar"), "ชะรีอะฮ์และหลักนิติศาสตร์", tr("J", 3, "en"), tr("J", 3, "ar"), "จบการศึกษา ปีการศึกษา 2025", tr("M", 3, "en"), tr("M", 3, "ar"), "", "", "", "", "class-2025-sumait", "FALSE", "TRUE"],
  ["3", "2025", "graduation", "นายอัลอะรอฟ มะเยาะ", tr("D", 4, "en"), tr("D", 4, "ar"), "สถาบันอับดุลเราะห์มาน อัล-สุไมต์", tr("G", 4, "en"), tr("G", 4, "ar"), "ชะรีอะฮ์และหลักนิติศาสตร์", tr("J", 4, "en"), tr("J", 4, "ar"), "จบการศึกษา ปีการศึกษา 2025", tr("M", 4, "en"), tr("M", 4, "ar"), "", "", "", "", "class-2025-sumait", "FALSE", "TRUE"],
  ["4", "2025", "graduation", "นายอัฟฟาน พาลีเขตต์", tr("D", 5, "en"), tr("D", 5, "ar"), "สถาบันอับดุลเราะห์มาน อัล-สุไมต์", tr("G", 5, "en"), tr("G", 5, "ar"), "ศึกษาศาสตร์ (อาหรับ)", tr("J", 5, "en"), tr("J", 5, "ar"), "จบการศึกษา ปีการศึกษา 2025", tr("M", 5, "en"), tr("M", 5, "ar"), "", "", "", "", "class-2025-sumait", "FALSE", "TRUE"],
  ["5", "2025", "graduation", "นายอันศอร มุสโตฟาดี", tr("D", 6, "en"), tr("D", 6, "ar"), "สถาบันอับดุลเราะห์มาน อัล-สุไมต์", tr("G", 6, "en"), tr("G", 6, "ar"), "อักษรศาสตร์ (อาหรับและวรรณกรรม)", tr("J", 6, "en"), tr("J", 6, "ar"), "จบการศึกษา ปีการศึกษา 2025", tr("M", 6, "en"), tr("M", 6, "ar"), "", "", "", "", "class-2025-sumait", "FALSE", "TRUE"],
];

const TABS = {
  stats: statsData,
  content: contentData,
  institutions: institutionsData,
  committee: committeeData,
  channels: channelsData,
  activities: activitiesData,
  highlights: highlightsData,
};

// ════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════

async function main() {
  // flag --force = บังคับเขียนทับแม้มีข้อมูลอยู่แล้ว (ยกเว้น protected tabs)
  const FORCE = process.argv.includes("--force");
  // Tabs ที่มีข้อมูลจริงของชมรม — ห้าม overwrite ยกเว้นใส่ --i-know-what-im-doing
  const PROTECTED_TABS = new Set(["activities", "highlights", "committee"]);
  const DANGER_OVERRIDE = process.argv.includes("--i-know-what-im-doing");

  // flag --only=tab1,tab2 = ทำเฉพาะ tab ที่ระบุ (comma-separated)
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const ONLY = onlyArg
    ? new Set(onlyArg.replace("--only=", "").split(",").map((s) => s.trim()))
    : null;

  console.log("🔗 เชื่อม Google Sheets API...");
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  console.log(`📄 พบ spreadsheet: "${meta.data.properties?.title}"`);
  if (FORCE) console.log("⚠️  --force flag ON: จะเขียนทับทุก tab");
  if (ONLY) console.log(`🎯 --only filter: ${[...ONLY].join(", ")}`);
  console.log("");

  const existingSheets = new Set(
    (meta.data.sheets || []).map((s) => s.properties?.title)
  );

  // STEP 1: สร้าง tab ที่ยังไม่มี (filter ตาม --only ด้วย)
  const targetTabs = Object.keys(TABS).filter((t) => !ONLY || ONLY.has(t));
  if (ONLY && targetTabs.length === 0) {
    console.error(`❌ --only filter ไม่ตรงกับ tab ใดเลย (available: ${Object.keys(TABS).join(", ")})`);
    process.exit(1);
  }
  const toAdd = targetTabs.filter((t) => !existingSheets.has(t));
  if (toAdd.length > 0) {
    console.log(`➕ สร้าง tabs ใหม่: ${toAdd.join(", ")}`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: toAdd.map((title) => ({
          addSheet: { properties: { title, gridProperties: { rowCount: 100, columnCount: 26 } } },
        })),
      },
    });
  }

  // STEP 2: เขียนเฉพาะ tab ที่ว่าง (หรือทุก tab ถ้า --force)
  let skipped = 0;
  for (const [tabName, rows] of Object.entries(TABS)) {
    // skip ถ้ามี --only filter และ tab นี้ไม่ใช่
    if (ONLY && !ONLY.has(tabName)) continue;
    // ตรวจว่า tab มีข้อมูลอยู่แล้วไหม
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: tabName,
    });
    const existingRows = existing.data.values?.length ?? 0;
    const hasData = existingRows > 1;

    // 🛡️ Protected tabs (activities/highlights/committee) — ห้าม overwrite แม้ --force
    // เว้นแต่ใส่ --i-know-what-im-doing เพิ่มอีกครั้ง
    if (hasData && PROTECTED_TABS.has(tabName) && !DANGER_OVERRIDE) {
      console.log(
        `🛡️  ข้าม "${tabName}" (protected — มีข้อมูลจริง ${existingRows - 1} แถว)`
      );
      console.log(
        `    ⚠️ ถ้ายืนยันจะเขียนทับ ใช้: --only=${tabName} --force --i-know-what-im-doing`
      );
      skipped++;
      continue;
    }

    if (!FORCE && hasData) {
      console.log(`⏭️  ข้าม "${tabName}" — มีข้อมูล ${existingRows - 1} แถวอยู่แล้ว`);
      skipped++;
      continue;
    }

    console.log(`✏️  เขียน tab "${tabName}" (${rows.length - 1} แถวข้อมูล)`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: tabName,
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  if (skipped > 0) {
    console.log(
      `\n💡 ข้าม ${skipped} tab ที่มีข้อมูลอยู่แล้ว — ใช้ "npm run setup-sheets -- --force" เพื่อเขียนทับ`
    );
  }

  // STEP 3: format header row ของทุก tab (bold + background)
  console.log("🎨 จัด format header...");
  const formatted = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const formatRequests = [];
  for (const sheet of formatted.data.sheets || []) {
    const title = sheet.properties?.title;
    if (!TABS[title]) continue;
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: sheet.properties.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.96, blue: 0.94 },
            textFormat: { bold: true },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat)",
      },
    });
    formatRequests.push({
      updateSheetProperties: {
        properties: {
          sheetId: sheet.properties.sheetId,
          gridProperties: { frozenRowCount: 1 },
        },
        fields: "gridProperties.frozenRowCount",
      },
    });
  }
  if (formatRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: formatRequests },
    });
  }

  console.log("\n✅ เสร็จเรียบร้อย!");
  console.log(`🔗 https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);
  console.log("ขั้นถัดไป: refresh เว็บที่ http://localhost:3000/th");
}

main().catch((err) => {
  console.error("\n❌ Error:");
  if (err.code === 403) {
    console.error("→ Service Account ไม่มีสิทธิ์เขียน Sheet");
    console.error("→ เปิด Sheet → กด Share → เปลี่ยน service account เป็น 'Editor'");
  } else {
    console.error(err.message || err);
  }
  process.exit(1);
});
