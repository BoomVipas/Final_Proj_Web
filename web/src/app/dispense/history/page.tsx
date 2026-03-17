import { AppShell } from "@/components/app-shell";

export default function DispenseHistoryPage() {
  return (
    <AppShell
      activePath="/dispense/history"
      title="ประวัติการจ่ายยา"
      description="บันทึกการจ่ายยาทั้งหมดเพื่อการตรวจสอบย้อนหลัง"
    >
      <div className="mt-6 rounded-lg border border-border bg-bg-base p-4">
        <p className="m-0 text-base text-text-secondary">
          ตารางประวัติการจ่ายยาจะเชื่อมต่อข้อมูลจาก `dispense_events` แบบ immutable
        </p>
      </div>
    </AppShell>
  );
}
