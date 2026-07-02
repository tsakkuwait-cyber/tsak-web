/**
 * ════════════════════════════════════════════════════════════════
 *  gen-qr.mjs — สร้าง QR code ของเว็บ TSAK
 *
 *  Output 2 ไฟล์ที่ public/:
 *    • qr.svg — infinite scalable ใช้ในโปสเตอร์/ป้ายใหญ่ (แนะนำ)
 *    • qr.png — universal เอาไปใส่ document/social ได้เลย
 *
 *  Colors:
 *    • Dark modules: #0C3B45 (petrol — brand)
 *    • Background:   #FFFFFF
 *
 *  วิธีใช้:
 *      npm run gen-qr                          # ใช้ URL default
 *      npm run gen-qr https://tsak-web.vercel.app/th   # กำหนด URL เอง
 * ════════════════════════════════════════════════════════════════
 */

import QRCode from "qrcode";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const url = process.argv[2] || "https://tsak-web.vercel.app";

const options = {
  errorCorrectionLevel: "H", // สูงสุด — ทนต่อการบดบัง 30%
  margin: 2,
  color: {
    dark: "#0C3B45", // petrol
    light: "#FFFFFF",
  },
};

console.log(`🔗 URL: ${url}\n`);

// 1) SVG — scalable ใช้ในโปสเตอร์
const svg = await QRCode.toString(url, {
  ...options,
  type: "svg",
  width: 1000,
});
const svgPath = join(publicDir, "qr.svg");
writeFileSync(svgPath, svg);
console.log(`✅ SVG: ${svgPath}`);

// 2) PNG — universal
const pngPath = join(publicDir, "qr.png");
await QRCode.toFile(pngPath, url, {
  ...options,
  width: 1200, // ใหญ่พอสำหรับ print
});
console.log(`✅ PNG: ${pngPath}`);

console.log(`\n🎉 เสร็จ! เปิดไฟล์ที่ public/qr.svg หรือ public/qr.png ได้เลย`);
console.log(`   → ใช้ SVG สำหรับโปสเตอร์ (คมชัดทุกขนาด)`);
console.log(`   → ใช้ PNG สำหรับ social/document\n`);
