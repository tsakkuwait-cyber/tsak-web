import Link from "next/link";

/**
 * ปุ่ม CTA "Support" — สี brand blue + soft shadow
 * (อ้างอิง design: background:#1597D5 + box-shadow rgba(21,151,213,.35))
 */
export function DonateButton({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "outline";
}) {
  if (variant === "outline") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-sm border-[1.5px] border-white/45 px-[30px] py-[15px] text-[15px] font-semibold text-white hover:bg-white hover:text-navy transition-colors whitespace-nowrap"
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-sm bg-brand px-[30px] py-[15px] text-[15px] font-bold text-white shadow-cta hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
