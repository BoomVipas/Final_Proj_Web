import { AppShell } from "@/components/app-shell";

type ResidentDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ResidentDetailPage({ params }: ResidentDetailPageProps) {
  return (
    <AppShell
      activePath="/residents"
      title={`ข้อมูลผู้ป่วย #${params.id}`}
      description="หน้ารายละเอียดผู้ป่วยพร้อมแท็บยาและประวัติ"
    >
      <div className="mt-6 rounded-lg border border-border bg-bg-base p-4">
        <p className="m-0 text-base text-text-secondary">
          เตรียมเชื่อมต่อข้อมูลจริงจาก Supabase ใน Sprint ถัดไป
        </p>
      </div>
    </AppShell>
  );
}
