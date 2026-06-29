import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="mt-4 text-neutral-600">
        Page not found / ไม่พบหน้าที่ค้นหา / الصفحة غير موجودة
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-600 transition-colors"
      >
        ← Home
      </Link>
    </div>
  );
}
