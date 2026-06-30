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
 *  PRESIDENT CARD — horizontal hero, full width
 * ──────────────────────────────────────────────────────────── */
function PresidentCard({ m, showPhoto }: { m: CouncilMember; showPhoto: boolean }) {
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-0 overflow-hidden border-2 border-navy bg-navy text-white">
      {/* Photo / decorative head */}
      <div className="relative aspect-square sm:aspect-auto sm:h-full bg-gradient-to-br from-navy via-navy to-navy-dark">
        {showPhoto && m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <DecorativeInitial name={m.name} size="lg" dark />
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col gap-4 p-[clamp(20px,3vw,32px)]">
        <div>
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-brand-200">
            {m.role}
          </div>
          <h3 className="mt-1.5 text-[clamp(22px,2.8vw,28px)] font-extrabold leading-tight">
            {m.name}
          </h3>
        </div>
        <div className="mt-auto">
          <MemberContacts m={m} dark />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  MEMBER CARD — vertical grid card
 * ──────────────────────────────────────────────────────────── */
function MemberCard({ m, showPhoto }: { m: CouncilMember; showPhoto: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden border border-line bg-white transition-shadow hover:shadow-card">
      {/* Head — photo or decorative initial */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
        {showPhoto && m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <DecorativeInitial name={m.name} size="md" />
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-3 p-[18px]">
        <div>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">
            {m.role}
          </div>
          <h3 className="mt-1.5 text-[16px] font-extrabold leading-tight text-navy line-clamp-2">
            {m.name}
          </h3>
        </div>
        <div className="mt-auto">
          <MemberContacts m={m} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  DECORATIVE INITIAL — สำหรับการ์ดที่ไม่มีรูป
 *  (เน้น typography + decorative element ไม่ใช่ icon ทั่วไป)
 * ──────────────────────────────────────────────────────────── */
function DecorativeInitial({
  name,
  size = "md",
  dark = false,
}: {
  name: string;
  size?: "md" | "lg";
  dark?: boolean;
}) {
  const initial = initialOf(name);
  const initialClass =
    size === "lg"
      ? "text-[clamp(80px,12vw,120px)]"
      : "text-[clamp(60px,10vw,90px)]";

  return (
    <div className="absolute inset-0 grid place-items-center">
      {/* subtle decorative pattern lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.08]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50 Q 25 30 50 50 T 100 50"
          stroke={dark ? "#7FD8CF" : "#0C3B45"}
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M0 65 Q 25 45 50 65 T 100 65"
          stroke={dark ? "#7FD8CF" : "#0C3B45"}
          strokeWidth="0.5"
          fill="none"
        />
      </svg>
      {/* main initial */}
      <span
        className={`font-display font-extrabold leading-none ${initialClass} ${
          dark ? "text-brand-200/50" : "text-brand-600/30"
        }`}
        aria-hidden
      >
        {initial}
      </span>
      {/* corner accent line */}
      <span
        className={`absolute bottom-3 start-3 h-px w-8 ${
          dark ? "bg-brand-200" : "bg-brand"
        }`}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  COUNCIL SECTION — reusable
 * ──────────────────────────────────────────────────────────── */
function CouncilSection({
  title,
  subtitle,
  members,
  showPhoto,
  withPresident = true,
}: {
  title: string;
  subtitle?: string;
  members: CouncilMember[];
  showPhoto: boolean;
  withPresident?: boolean;
}) {
  if (members.length === 0) return null;

  const president = withPresident ? members[0] : null;
  const rest = withPresident ? members.slice(1) : members;

  return (
    <div className="mb-12 last:mb-0">
      {/* Section header */}
      <div className="mb-6 flex items-baseline gap-4">
        <div>
          <div className="text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
            {title}
          </div>
          {subtitle && (
            <div className="mt-1 text-[12px] text-ink-subtle">{subtitle}</div>
          )}
        </div>
        <span className="flex-1 h-px bg-line" />
      </div>

      {/* President (hero card) */}
      {president && <PresidentCard m={president} showPhoto={showPhoto} />}

      {/* Other members */}
      {rest.length > 0 && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {rest.map((m) => (
            <MemberCard key={m.id} m={m} showPhoto={showPhoto} />
          ))}
        </div>
      )}
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
                showPhoto={true}
              />
              <CouncilSection
                title={femaleTitle}
                members={femaleCouncil}
                showPhoto={false}
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
                      <span className="text-[14.5px] font-semibold text-navy overflow-hidden text-ellipsis">
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
