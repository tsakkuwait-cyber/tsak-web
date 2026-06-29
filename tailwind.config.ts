import type { Config } from "tailwindcss";

/**
 * Tailwind config สำหรับเว็บไซต์ชมรมนักศึกษาไทยในคูเวต
 * - ลงทะเบียนฟอนต์ 3 ภาษา: Cairo (AR), Prompt (TH), Poppins (EN)
 *   โดยอ้างอิงจาก CSS variables ที่เซตไว้ใน app/[locale]/layout.tsx (next/font)
 * - Palette อ้างอิงจาก design (Thai Students Kuwait.html):
 *     navy   #002B5B  → Hero/Header text, dark sections
 *     blue   #1597D5  → CTA buttons, accents, primary actions
 *     blue-light #8FD3F4 → subtle highlights
 */
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Petrol — ใช้กับ Hero, Footer, Heading (เปลี่ยนจาก navy → petrol teal)
        navy: {
          DEFAULT: "#0C3B45",
          dark: "#082A31",
          50: "#E5EFF1",
          100: "#C3D8DB",
          200: "#9DBDC2",
          300: "#6F9DA5",
          400: "#3E6F78",
          500: "#0C3B45",
          600: "#0A323A",
          700: "#082A31",
          800: "#061E23",
          900: "#031115",
        },
        // Teal accent — ใช้กับปุ่ม CTA "Support" และ accent links
        brand: {
          DEFAULT: "#10968D",
          50: "#E1F4F1",
          100: "#BBDCD9",
          200: "#7FD8CF",
          300: "#4FC3B7",
          400: "#2BAFA2",
          500: "#10968D",
          600: "#0B7068",
          700: "#085850",
          800: "#054039",
          900: "#022823",
        },
        // Text & surface tokens จาก design
        ink: {
          DEFAULT: "#16222E",
          soft: "#41505E",
          muted: "#58697B",
          subtle: "#5B7186",
        },
        line: "#D7E8E5",
        canvas: "#F2FAF9",
      },
      fontFamily: {
        // ฟอนต์เริ่มต้น (sans) จะเปลี่ยนตาม locale ผ่าน CSS variable
        sans: ["var(--font-active)", "system-ui", "sans-serif"],
        th: ["var(--font-prompt)", "system-ui", "sans-serif"],
        en: ["var(--font-poppins)", "system-ui", "sans-serif"],
        ar: ["var(--font-cairo)", "system-ui", "sans-serif"],
        // ใช้ Poppins สำหรับเลข/section markers (เลขดูคมกว่า)
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1180px",
        },
      },
      boxShadow: {
        cta: "0 4px 16px rgba(16,150,141,.30)",
        card: "0 1px 2px rgba(0,0,0,.03)",
        soft: "0 8px 30px rgba(12,59,69,.08)",
      },
      backgroundImage: {
        "page-gradient":
          "linear-gradient(180deg, #FFFFFF 0%, #F2FAF9 45%, #E3F2F0 100%)",
        "hero-glow":
          "radial-gradient(820px 460px at 78% -20%, rgba(16,150,141,.16), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
