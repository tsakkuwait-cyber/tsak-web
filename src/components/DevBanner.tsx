/**
 * DevBanner — แถบแจ้งสถานะ "อยู่ในช่วงพัฒนา"
 *
 * เพื่อให้ผู้เข้าชมจาก QR code ทราบว่าเว็บยังไม่สมบูรณ์
 *
 * ⚠️ ลบ banner ตอนเปิดจริง:
 *   ไปที่ layout.tsx → ลบ <DevBanner ... /> ออก (1 บรรทัด)
 *   หรือ comment ออกชั่วคราว
 */
export function DevBanner({
  message,
}: {
  message: string;
}) {
  return (
    <div className="w-full bg-[#FFF4D6] border-b border-[#F0D178] text-[#7A5A00]">
      <div className="container py-1.5 flex items-center justify-center gap-2 text-[12.5px] font-semibold text-center">
        <span aria-hidden>🚧</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
