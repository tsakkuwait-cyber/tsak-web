/**
 * ════════════════════════════════════════════════════════════════
 *  gen-icons.mjs — สร้าง favicon + app icons จาก logo.jpg
 *
 *  Output → src/app/
 *    • icon.png        — 512×512 (browser tab, PWA)
 *    • apple-icon.png  — 180×180 (iOS home screen)
 *
 *  Next.js App Router จะ auto-detect และแทรก <link rel="icon"> ให้เอง
 *
 *  วิธีใช้:
 *      npm run gen-icons
 * ════════════════════════════════════════════════════════════════
 */

import sharp from "sharp";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public", "logo.jpg");
const appDir = join(root, "src", "app");

if (!existsSync(src)) {
  console.error(`❌ ไม่พบ ${src}`);
  process.exit(1);
}

const jobs = [
  { name: "icon.png", size: 512 },
  { name: "apple-icon.png", size: 180 },
];

for (const { name, size } of jobs) {
  const out = join(appDir, name);
  await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✅ ${name} (${size}×${size})`);
}

console.log(`\n🎉 เสร็จ! Next.js จะใช้ไอคอนพวกนี้เป็น favicon อัตโนมัติ`);
console.log(`   → refresh browser (Ctrl+Shift+R) เพื่อให้เห็นผลใหม่`);
