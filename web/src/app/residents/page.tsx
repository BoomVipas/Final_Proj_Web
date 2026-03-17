import { AppShell } from "@/components/app-shell";

export default function ResidentsPage() {
  return (
    <AppShell
      activePath="/residents"
      title="ผู้ป่วย"
      description="รายการผู้ป่วยสำหรับจัดยาและติดตามสถานะรายสัปดาห์"
    >
      <div className="mt-6 rounded-lg border border-border bg-bg-base p-4">
        <p className="m-0 text-base text-text-secondary">
          ตารางผู้ป่วยจะถูกพัฒนาใน Sprint 4
        </p>
      </div>
    </AppShell>
  );
}
