import { AppShell } from "@/components/app-shell";

type ResidentMedicationPageProps = {
  params: {
    id: string;
  };
};

export default function ResidentMedicationPage({
  params,
}: ResidentMedicationPageProps) {
  return (
    <AppShell
      activePath="/residents"
      title={`แผนยา ผู้ป่วย #${params.id}`}
      description="ตารางรายการยาและช่วงเวลาการจ่ายยา"
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full border border-meal-beforeBreakfast/40 bg-meal-beforeBreakfast/20 px-4 py-2 text-base font-semibold text-blue-200">
          ก่อนอาหารเช้า
        </span>
        <span className="rounded-full border border-meal-afterBreakfast/40 bg-meal-afterBreakfast/20 px-4 py-2 text-base font-semibold text-emerald-200">
          หลังอาหารเช้า
        </span>
        <span className="rounded-full border border-meal-afterDinner/40 bg-meal-afterDinner/20 px-4 py-2 text-base font-semibold text-amber-200">
          หลังอาหารเย็น
        </span>
        <span className="rounded-full border border-meal-bedtime/40 bg-meal-bedtime/20 px-4 py-2 text-base font-semibold text-violet-200">
          ก่อนนอน
        </span>
      </div>
    </AppShell>
  );
}
