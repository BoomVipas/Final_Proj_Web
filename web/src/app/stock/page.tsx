import { AppShell } from "@/components/app-shell";

export default function StockPage() {
  return (
    <AppShell
      activePath="/stock"
      title="สต๊อกยา"
      description="สถานะปริมาณยาและการแจ้งเตือนใกล้หมด"
    >
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-status-success/40 bg-status-success/15 p-4">
          <p className="m-0 text-base font-semibold text-green-300">คงเหลือปกติ</p>
        </div>
        <div className="rounded-lg border border-status-warning/40 bg-status-warning/15 p-4">
          <p className="m-0 text-base font-semibold text-amber-200">เตือน</p>
        </div>
        <div className="rounded-lg border border-status-critical/40 bg-status-critical/15 p-4">
          <p className="m-0 text-base font-semibold text-red-300">วิกฤต</p>
        </div>
      </div>
    </AppShell>
  );
}
