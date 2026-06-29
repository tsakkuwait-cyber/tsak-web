# TSAK Web — ชมรมนักศึกษาไทยในคูเวต

เว็บไซต์อย่างเป็นทางการของชมรมนักศึกษาไทยในประเทศคูเวต
ออกแบบเพื่อให้รุ่นน้องดูแลต่อได้ "ฟรี 100%" และไม่ต้องตั้ง server เอง

---

## 🧱 Tech Stack

| Layer       | เครื่องมือ                              | เหตุผล                                    |
| ----------- | --------------------------------------- | ----------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript    | Static + ISR → Vercel free tier ก็พอ      |
| Styling     | Tailwind CSS                            | เร็ว, type-safe, รองรับ RTL ผ่าน logical |
| i18n        | Dictionary JSON (TH / EN / AR)          | ไม่ต้องพึ่ง library, เปลี่ยนข้อความง่าย   |
| Backend     | Google Sheets API (Service Account)     | ฟรี, รุ่นน้องแก้ข้อมูลในชีตได้ทันที       |
| Deploy      | Vercel (recommended) หรือ Cloudflare    | Free tier เพียงพอสำหรับเว็บชมรม           |

---

## 🚀 เริ่มต้นใช้งาน (Local Dev)

```bash
# 1) ติดตั้ง dependencies
npm install

# 2) สร้างไฟล์ .env.local จาก template แล้วเติมค่าจริง
cp .env.example .env.local

# 3) รัน dev server
npm run dev
# → เปิด http://localhost:3000  (จะ redirect ไป /th อัตโนมัติ)
```

---

## 🌐 ระบบ 3 ภาษา (i18n)

URL pattern: `/{locale}/...` โดย locale = `th` | `en` | `ar`

```
/                 → redirect → /th
/th               → ภาษาไทย (default)
/en/about         → English / About
/ar/activities    → العربية / الأنشطة  (HTML จะถูกตั้งเป็น dir="rtl" อัตโนมัติ)
```

### เพิ่ม/แก้ข้อความ

แก้ไฟล์ JSON ใน [`src/i18n/dictionaries/`](src/i18n/dictionaries/) — มี 3 ไฟล์คู่ขนาน:
`th.json`, `en.json`, `ar.json` (ต้องมี key เดียวกันทั้ง 3 ไฟล์)

### เพิ่มภาษาใหม่ (เช่น ภาษามลายู)

1. เพิ่ม `"ms"` ใน `locales` ที่ [`src/i18n/config.ts`](src/i18n/config.ts)
2. สร้างไฟล์ `src/i18n/dictionaries/ms.json` (copy จาก en.json แล้วแปล)
3. เพิ่ม `ms: () => import(...)` ใน [`src/i18n/get-dictionary.ts`](src/i18n/get-dictionary.ts)

TypeScript จะแจ้งทุกจุดที่ต้องอัปเดต ✨

---

## 📋 Google Sheets เป็นฐานข้อมูล

### ขั้นตอน Setup (ทำครั้งเดียวตอนส่งต่อ)

1. **สร้าง Service Account**
   - เข้า [Google Cloud Console](https://console.cloud.google.com) → New Project
   - "APIs & Services" → เปิด **Google Sheets API**
   - "Credentials" → Create → **Service Account**
   - หลังสร้างเสร็จ → "Keys" → "Add Key" → JSON → ดาวน์โหลด

2. **สร้าง Google Sheet กลางของชมรม**
   - สร้าง Spreadsheet ใหม่ในไดรฟ์ของอีเมลกลางชมรม
   - กด **Share** → ใส่ email ของ Service Account (Viewer ก็พอ)
   - คัดลอก Sheet ID จาก URL: `docs.google.com/spreadsheets/d/<ID>/edit`

3. **กรอกค่าใน `.env.local`**
   ```
   GOOGLE_CLIENT_EMAIL=...        # client_email จาก JSON
   GOOGLE_PRIVATE_KEY="..."       # private_key จาก JSON (คงเครื่องหมาย \n ไว้)
   GOOGLE_SHEET_ID=...
   ```

### 📊 โครงสร้างตาราง (Database Schema)

หลักการ: **ทุกคอลัมน์ที่เป็นข้อความ ใช้ suffix `_th` / `_en` / `_ar`**
รุ่นน้องจะกรอกข้อมูล 3 ภาษาคู่ขนานกันในแถวเดียวได้สะดวก

#### Sheet 1: `stats` (สถิติหน้าแรก)

| key          | value | label_th       | label_en             | label_ar          |
| ------------ | ----- | -------------- | -------------------- | ----------------- |
| members      | 120   | สมาชิก          | Members              | الأعضاء           |
| activities   | 18    | กิจกรรมในปีนี้  | Activities this year | أنشطة هذا العام   |
| universities | 7     | มหาวิทยาลัย     | Universities         | الجامعات          |
| years        | 25    | ปีที่ก่อตั้ง   | Years since founding | سنوات             |

#### Sheet 2: `activities` (กิจกรรม)

| id  | date       | image_url | published | title_th | title_en | title_ar | desc_th | desc_en | desc_ar | location_th | location_en | location_ar |
| --- | ---------- | --------- | --------- | -------- | -------- | -------- | ------- | ------- | ------- | ----------- | ----------- | ----------- |
| 1   | 2026-01-15 | https://… | TRUE      | ลอยกระทง  | Loy Krathong | لوي كراثونغ | …       | …       | …       | …           | …           | …           |

> `published = TRUE/FALSE` → ซ่อน/แสดงโดยไม่ต้องลบแถว

#### Sheet 3: `members` (สมาชิก)

| id | name_th | name_en | name_ar | university | major | year | avatar_url |
| -- | ------- | ------- | ------- | ---------- | ----- | ---- | ---------- |

#### Sheet 4: `committee` (คณะกรรมการประจำปี)

| id | year | role_th | role_en | role_ar | name_th | name_en | name_ar | avatar_url | bio_th | bio_en | bio_ar |
| -- | ---- | ------- | ------- | ------- | ------- | ------- | ------- | ---------- | ------ | ------ | ------ |

### กฎเหล็กสำหรับรุ่นน้องที่กรอกข้อมูล

1. **ห้ามแก้แถว header (แถวที่ 1)** — โค้ดใช้ชื่อคอลัมน์เป็น key
2. **ห้ามเปลี่ยนชื่อ tab/sheet** — `stats`, `activities`, `members`, `committee`
3. คอลัมน์ `id` ห้ามซ้ำกัน
4. รูปภาพ: อัปโหลดลง Google Drive แล้วเปิด link sharing → ใช้ URL
5. หลังแก้ข้อมูล เว็บจะอัปเดตอัตโนมัติทุก 1 ชม. (ตั้งใน env)
   - ต้องการอัปเดตทันที: เข้า Vercel Dashboard → Redeploy

---

## 🎨 ระบบดีไซน์

| Token            | Value     | ใช้กับ                       |
| ---------------- | --------- | ---------------------------- |
| `primary`        | `#0F4C3A` | สีหลักของแบรนด์ (Navbar, H1) |
| `accent`         | `#D4AF37` | ปุ่ม "บริจาค", ไฮไลต์         |
| Font (TH)        | Prompt    | เมื่อ locale = `th`           |
| Font (EN)        | Plus Jakarta Sans | เมื่อ locale = `en`   |
| Font (AR)        | Cairo     | เมื่อ locale = `ar`           |

ทั้งหมดตั้งไว้ใน [`tailwind.config.ts`](tailwind.config.ts)

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx     ← root layout: html dir, fonts, navbar, footer
│   │   ├── page.tsx       ← หน้าแรก (Hero + Stats + Activities)
│   │   └── not-found.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LanguageSwitcher.tsx
│   └── DonateButton.tsx
├── i18n/
│   ├── config.ts          ← locales, defaultLocale, isLocale()
│   ├── get-dictionary.ts  ← dynamic import dictionary
│   └── dictionaries/
│       ├── th.json
│       ├── en.json
│       └── ar.json
├── lib/
│   └── google-sheets.ts   ← Google Sheets API + schema docs
└── middleware.ts          ← redirect / → /th
```

---

## 🚢 Deploy (Vercel — ฟรี)

1. Push โค้ดขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) → New Project → Import
3. ตั้ง Environment Variables 3 ตัว (จาก `.env.example`)
4. Deploy → ได้ URL `<project>.vercel.app`
5. (ตัวเลือก) ผูก custom domain ของชมรม

---

## 🤝 ส่งต่อให้รุ่นถัดไป

ส่งต่อ 3 อย่างให้ committee ปีถัดไป:

1. **Repository access** (GitHub org หรือ transfer ownership)
2. **อีเมลกลางชมรม** ที่ Service Account/Vercel/Domain ผูกอยู่
3. **README.md นี้** — อธิบายทุกอย่างที่จำเป็น

ขอให้สนุกกับการพัฒนาต่อครับ 🇹🇭🇰🇼
