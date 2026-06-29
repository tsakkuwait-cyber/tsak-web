import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getCouncil,
  getChannels,
  type CouncilMember,
} from "@/lib/google-sheets";

/**
 * Contact — petrol design
 *   Numbered hero
 *   2-col layout:
 *     LEFT  → Council (สภา main + สภา female แยก, แต่ละคนมีช่องทางติดต่อรายคน)
 *     RIGHT → Channels (จาก sheet) + Support (sticky on desktop)
 */

export const revalidate = Number(
  process.env.NEXT_PUBLIC_SHEETS_REVALIDATE_SECONDS ?? 60
);

// fallback channels ถ้า sheet ยังไม่ตั้ง
const FALLBACK_CHANNELS = [
  { key: "email", icon: "@", label: "Email", value: "info@thaikuwait.org", href: "mailto:info@thaikuwait.org" },
];

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  return (words[words.length - 1][0] ?? "?").toUpperCase();
}

// การ์ดสมาชิก reusable
function MemberCard({
  m,
  variant = "default",
}: {
  m: CouncilMember;
  variant?: "president" | "default";
}) {
  if (variant === "president") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-[22px] bg-navy p-[clamp(22px,3vw,30px)] text-white">
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            className="flex-none h-20 w-20 border border-brand-200 object-cover"
          />
        ) : (
          <div className="flex-none grid h-20 w-20 place-items-center border border-brand-200 bg-white/10 text-[32px] font-extrabold text-brand-200">
            {initialOf(m.name)}
          </div>
        )}
        <div className="flex-1 basis-[200px] min-w-0">
          <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-brand-200">
            {m.role}
          </div>
          <div className="mt-1.5 text-[22px] font-extrabold">{m.name}</div>
          <MemberContacts m={m} dark />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5 border border-line bg-white p-[18px]">
      <div className="flex items-center gap-3.5">
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.avatarUrl}
            alt={m.name}
            className="flex-none h-12 w-12 object-cover"
          />
        ) : (
          <span className="flex-none grid h-12 w-12 place-items-center bg-brand-50 text-[20px] font-extrabold text-navy">
            {initialOf(m.name)}
          </span>
        )}
        <span className="flex flex-col min-w-0">
          <span className="text-[15px] font-bold text-navy truncate">{m.name}</span>
          <span className="mt-0.5 text-[12.5px] font-semibold text-brand-600">{m.role}</span>
        </span>
      </div>
      <MemberContacts m={m} />
    </div>
  );
}

// แถวช่องทางติดต่อรายคน — แสดงเฉพาะที่มีค่า
function MemberContacts({ m, dark = false }: { m: CouncilMember; dark?: boolean }) {
  const items = [
    m.email && { icon: "✉", value: m.email, href: `mailto:${m.email}` },
    m.phone && { icon: "☎", value: m.phone, href: `tel:${m.phone.replace(/\s/g, "")}`, dir: "ltr" as const },
    m.line && { icon: "L", value: m.line, href: m.line.startsWith("http") ? m.line : undefined },
  ].filter(Boolean) as Array<{ icon: string; value: string; href?: string; dir?: "ltr" }>;

  if (items.length === 0) return null;

  return (
    <div className={`mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 ${dark ? "text-[#BBDCD9]" : "text-ink-muted"}`}>
      {items.map((it, idx) => {
        const content = (
          <span className="inline-flex items-center gap-1.5 text-[12.5px]" dir={it.dir}>
            <span
              className={[
                "grid h-4 w-4 place-items-center text-[10px] font-bold",
                dark ? "bg-white/15 text-brand-200" : "bg-brand-50 text-navy",
              ].join(" ")}
            >
              {it.icon}
            </span>
            {it.value}
          </span>
        );
        return it.href ? (
          <a
            key={idx}
            href={it.href}
            className={dark ? "hover:text-white" : "hover:text-brand"}
          >
            {content}
          </a>
        ) : (
          <span key={idx}>{content}</span>
        );
      })}
    </div>
  );
}

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

  // dict keys (with fallback to legacy title)
  const d = dict.contact as Record<string, string>;
  const mainTitle = d.councilMainTitle ?? d.councilTitle;
  const femaleTitle = d.councilFemaleTitle ?? d.councilTitle;

  // president = first item ของ main council
  const president = mainCouncil[0];
  const mainRest = mainCouncil.slice(1);

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

      {/* ── 2-COL ────────────────────────────────────────── */}
      <section className="container flex flex-wrap items-start gap-x-[clamp(28px,4vw,48px)] gap-y-10 pb-[clamp(48px,7vw,84px)]">
        {/* LEFT — Councils */}
        <div className="flex-[1.5] basis-[420px] min-w-[300px]">
          {/* MAIN council */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
              {mainTitle}
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          {council.length === 0 ? (
            <div className="border border-dashed border-line bg-white p-8 text-center text-ink-muted">
              {dict.activities.noEvents.replace("activities", "committee")}
            </div>
          ) : (
            <>
              {/* president card */}
              {president && <MemberCard m={president} variant="president" />}
              {mainRest.length > 0 && (
                <div
                  className="grid gap-3.5"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                >
                  {mainRest.map((c) => (
                    <MemberCard key={c.id} m={c} />
                  ))}
                </div>
              )}

              {/* FEMALE council */}
              {femaleCouncil.length > 0 && (
                <>
                  <div className="mt-10 mb-6 flex items-center gap-4">
                    <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-brand-600">
                      {femaleTitle}
                    </span>
                    <span className="flex-1 h-px bg-line" />
                  </div>
                  <div
                    className="grid gap-3.5"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                  >
                    {femaleCouncil.map((c) => (
                      <MemberCard key={c.id} m={c} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* RIGHT — Channels + Support */}
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
