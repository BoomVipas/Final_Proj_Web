import { AppShell } from "@/components/app-shell";

export default function DashboardPage() {
  return (
    <AppShell
      activePath="/dashboard"
      title="แดชบอร์ด"
      description="ภาพรวมสถานะการจัดยาและการแจ้งเตือนของวันนี้"
    >
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["จัดยาเสร็จแล้ว", "12"],
          ["รอดำเนินการ", "42"],
          ["แจ้งเตือนสต๊อก", "3"],
          ["ผู้ป่วยทั้งหมด", "54"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-bg-base p-4 text-center"
          >
            <p className="m-0 text-base text-text-secondary">{label}</p>
            <p className="mt-2 text-[36px] font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
