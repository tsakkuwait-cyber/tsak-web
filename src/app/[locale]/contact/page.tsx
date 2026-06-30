import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getCouncil,
  getChannels,
  type CouncilMember,
} from "@/lib/google-sheets";

/**
 * Contact — Council redesigned
 *   - Main council: President เด่น (horizontal hero card) + grid 3-4 col
 *     แต่ละการ์ดมีรูปใหญ่ aspect-square + role + name + contacts
 *   - Female council: ออกแบบเหมือนกันแต่ไม่มีรูป
 *     ใช้ initial decorative + gradient เป็นเอกลักษณ์
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

const FALLBACK_CHANNELS = [
  { key: "email", icon: "@", label: "Email", value: "info@thaikuwait.org", href: "mailto:info@thaikuwait.org" },
];

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  return (words[words.length - 1][0] ?? "?").toUpperCase();
}

/* ────────────────────────────────────────────────────────────
 *  CONTACT ICONS (small)
 * ──────────────────────────────────────────────────────────── */
function MemberContacts({ m, dark = false }: { m: CouncilMember; dark?: boolean }) {
  const items = [
    m.email && { icon: "✉", value: m.email, href: `mailto:${m.email}` },
    m.phone && { icon: "☎", value: m.phone, href: `tel:${m.phone.replace(/\s/g, "")}`, dir: "ltr" as const },
    m.line && { icon: "L", value: m.line, href: m.line.startsWith("http") ? m.line : undefined },
  ].filter(Boolean) as Array<{ icon: string; value: string; href?: string; dir?: "ltr" }>;

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-col gap-1.5 ${dark ? "text-[#BBDCD9]" : "text-ink-muted"}`}>
      {items.map((it, idx) => {
        const inner = (
          <span className="inline-flex items-center gap-2 text-[12.5px]" dir={it.dir}>
            <span
              className={[
                "grid h-[18px] w-[18px] flex-none place-items-center text-[10px] font-bold",
                dark ? "bg-white/15 text-brand-200" : "bg-brand-50 text-navy",
              ].join(" ")}
            >
              {it.icon}
            </span>
            <span className="truncate">{it.value}</span>
          </span>
        );
        return it.href ? (
          <a
            key={idx}
            href={it.href}
            className={dark ? "hover:text-white" : "hover:text-brand transition-colors"}
          >
            {inner}
          </a>
        ) : (
          <span key={idx}>{inner}</span>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  PHOTO CARD — vertical card with portrait photo
 *  - aspect 4:5 ป้องกันหัวขาด
 *  - object-position: center top — เก็บส่วนบน (หัว) ไว้
 *  - President variant: spans 2 cols + navy bg เด่น
 * ──────────────────────────────────────────────────────────── */
function PhotoCard({
  m,
  variant = "default",
}: {
  m: CouncilMember;
  variant?: "president" | "default";
}) {
  const isPresident = variant === "president";

  return (
    <div
      className={[
        "flex flex-col overflow-hidden transition-shadow hover:shadow-soft",
        isPresident
          ? "border-2 border-brand bg-navy text-white"
          : "border border-line bg-white",
      ].join(" ")}
    >
      {/* Photo — aspect 4:5 portrait, top-positioned crop */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100" style={{ aspectRatio: "4 / 5" }}>
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 18%" }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-[80px] font-extrabold text-brand-600/30">
              {initialOf(m.name)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`flex flex-1 flex-col gap-3 ${isPresident ? "p-6" : "p-5"}`}>
        <div>
          <div
            className={[
              "text-[11px] font-bold tracking-[0.12em] uppercase",
              isPresident ? "text-brand-200" : "text-brand-600",
            ].join(" ")}
          >
            {m.role}
          </div>
          <h3
            className={[
              "mt-1.5 font-extrabold leading-tight line-clamp-2",
              isPresident
                ? "text-[clamp(20px,2.2vw,24px)]"
                : "text-[16px] text-navy",
            ].join(" ")}
          >
            {m.name}
          </h3>
        </div>
        <div className="mt-auto">
          <MemberContacts m={m} dark={isPresident} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  NAME CARD — สำหรับสภาหญิง (ไม่มีรูป)
 *  Business-card style — compact + elegant
 *  - border-left accent สีเด่น
 *  - bg ขาวสะอาด
 *  - layout เดียวกับ photo card (role + name + contacts)
 * ──────────────────────────────────────────────────────────── */
function NameCard({
  m,
  variant = "default",
}: {
  m: CouncilMember;
  variant?: "president" | "default";
}) {
  const isPresident = variant === "president";

  return (
    <div
      className={[
        "flex flex-col gap-3 transition-shadow hover:shadow-card",
        isPresident
          ? "border-2 border-brand bg-navy text-white p-7"
          : "border border-line border-l-[3px] border-l-brand bg-white p-5",
      ].join(" ")}
    >
      <div>
        <div
          className={[
            "text-[11px] font-bold tracking-[0.12em] uppercase",
            isPresident ? "text-brand-200" : "text-brand-600",
          ].join(" ")}
        >
          {m.role}
        </div>
        <h3
          className={[
            "mt-1.5 font-extrabold leading-tight",
            isPresident
              ? "text-[clamp(20px,2.2vw,24px)]"
              : "text-[17px] text-navy",
          ].join(" ")}
        >
          {m.name}
        </h3>
      </div>
      <div className="mt-1">
        <MemberContacts m={m} dark={isPresident} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  COUNCIL SECTION — reusable
 *  Grid เดียวสำหรับทุกการ์ด — ประธาน span 2 cols (md+)
 * ──────────────────────────────────────────────────────────── */
function CouncilSection({
  title,
  members,
  variant,
}: {
  title: string;
  members: CouncilMember[];
  /** "photo" = สภาชาย (รูปจริง), "name" = สภาหญิง (การ์ดชื่อ) */
  variant: "photo" | "name";
}) {
  if (members.length === 0) return null;

  const Card = variant === "photo" ? PhotoCard : NameCard;

  return (
    <div className="mb-12 last:mb-0">
      {/* Section header */}
      <div className="mb-6 flex items-baseline gap-4">
        <div className="text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
          {title}
        </div>
        <span className="flex-1 h-px bg-line" />
      </div>

      {/* Grid: มือถือ 1 col / ตั้งแต่ tablet ขึ้น 2 cols (ทุกการ์ดขนาดเท่ากัน) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {members.map((m, idx) => (
          <Card key={m.id} m={m} variant={idx === 0 ? "president" : "default"} />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  PAGE
 * ════════════════════════════════════════════════════════════ */
export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const [dict, council, channelsData] = await Promise.all([
    getDictionary(locale),
    getCouncil(locale),
    getChannels(locale),
  ]);

  const mainCouncil = council.filter((c) => c.councilType === "main");
  const femaleCouncil = council.filter((c) => c.councilType === "female");
  const channels = channelsData.length > 0 ? channelsData : FALLBACK_CHANNELS;

  const d = dict.contact as Record<string, string>;
  const mainTitle = d.councilMainTitle ?? d.councilTitle;
  const femaleTitle = d.councilFemaleTitle ?? d.councilTitle;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="container pt-[clamp(44px,6vw,72px)] pb-[clamp(28px,4vw,40px)]">
        <div className="mb-4 flex items-center gap-3.5">
          <span className="font-display text-[14px] font-extrabold text-brand">01</span>
          <span className="text-[12.5px] font-bold tracking-[0.14em] uppercase text-brand-600">
            {dict.nav.contact}
          </span>
        </div>
        <h1 className="m-0 max-w-[16ch] text-[clamp(27px,3.6vw,42px)] font-extrabold leading-[1.18] text-navy">
          {dict.contact.title}
        </h1>
        <p className="mt-3.5 max-w-[62ch] text-[16px] leading-[1.8] text-ink-soft">
          {dict.contact.intro}
        </p>
      </section>

      {/* ── 2-COL: Councils (LEFT) + Channels/Support (RIGHT) ─── */}
      <section className="container flex flex-wrap items-start gap-x-[clamp(28px,4vw,48px)] gap-y-10 pb-[clamp(48px,7vw,84px)]">
        {/* LEFT — Councils */}
        <div className="flex-[1.5] basis-[420px] min-w-[300px]">
          {council.length === 0 ? (
            <div className="border border-dashed border-line bg-white p-8 text-center text-ink-muted">
              {dict.activities.noEvents.replace("activities", "committee")}
            </div>
          ) : (
            <>
              <CouncilSection
                title={mainTitle}
                members={mainCouncil}
                variant="photo"
              />
              <CouncilSection
                title={femaleTitle}
                members={femaleCouncil}
                variant="name"
              />
            </>
          )}
        </div>

        {/* RIGHT — Channels + Support (sticky) */}
        <aside className="flex-1 basis-[300px] min-w-[280px] flex flex-col gap-[18px] lg:sticky lg:top-[90px]">
          <div className="border border-line border-t-[3px] border-t-brand bg-white p-[22px]">
            <div className="mb-4 text-[13px] font-bold tracking-[0.08em] uppercase text-brand-600">
              {dict.contact.channelsTitle}
            </div>
            <div className="flex flex-col">
              {channels.map((ch, i, arr) => {
                const inner = (
                  <>
                    <span className="flex-none grid h-[38px] w-[38px] place-items-center bg-brand-50 text-[14px] font-extrabold text-navy">
                      {ch.icon}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-[12px] font-semibold text-ink-subtle">
                        {ch.label}
                      </span>
                      <span
                        dir="auto"
                        className="text-[14.5px] font-semibold text-navy overflow-hidden text-ellipsis"
                      >
                        {ch.value}
                      </span>
                    </span>
                  </>
                );
                const rowClasses = [
                  "flex items-center gap-3.5 py-3",
                  i < arr.length - 1 ? "border-b border-line" : "",
                ].join(" ");
                return ch.href ? (
                  <a
                    key={ch.key ?? i}
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`${rowClasses} hover:bg-canvas`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={ch.key ?? i} className={rowClasses}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support */}
          <div className="bg-navy p-[26px] text-white">
            <h2 className="m-0 text-[20px] font-extrabold">{dict.contact.supportTitle}</h2>
            <p className="mt-3 text-[14.5px] leading-[1.8] text-[#BBDCD9]">
              {dict.contact.supportText}
            </p>
            <a
              href="mailto:info@thaikuwait.org?subject=Support%20TSAK"
              className="mt-5 inline-block bg-brand px-[26px] py-[13px] text-[15px] font-bold text-white hover:bg-brand-600 transition-colors"
            >
              {dict.cta.contact}
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
