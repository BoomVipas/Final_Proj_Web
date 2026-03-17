import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell
      activePath="/settings"
      title="ตั้งค่า"
      description="จัดการผู้ใช้งานและค่าระบบของสถานดูแล"
    />
  );
}
