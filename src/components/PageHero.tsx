/**
 * PageHero — ส่วนหัวมาตรฐานของหน้าใน (Students/Activities/Contact)
 * รูปแบบเดียวกับ design: kicker (blue uppercase) + title (large navy) + intro
 * พื้นขาว + เส้นใต้บางๆ
 */
export function PageHero({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container py-[clamp(44px,6vw,72px)]">
        <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-600">
          {kicker}
        </div>
        <h1 className="mt-3 text-[clamp(28px,3.6vw,42px)] font-extrabold leading-[1.2] text-navy">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-[62ch] text-[17px] leading-[1.8] text-ink-soft">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
