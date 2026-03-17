import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  activePath: string;
  title: string;
  description: string;
  children?: ReactNode;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: "🏠" },
  { href: "/residents", label: "ผู้ป่วย", icon: "👥" },
  { href: "/stock", label: "สต๊อกยา", icon: "💊" },
  { href: "/dispense/history", label: "ประวัติการจ่ายยา", icon: "📋" },
  { href: "/settings", label: "ตั้งค่า", icon: "⚙️" },
];

function isActive(activePath: string, href: string): boolean {
  if (href === "/residents") {
    return activePath.startsWith("/residents");
  }
  return activePath === href;
}

export function AppShell({
  activePath,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px]">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-bg-surface/70 p-4 lg:flex lg:flex-col">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary-glow)]" />
            <p className="m-0 text-[22px] font-bold text-primary">MEDCARE</p>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(activePath, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-base font-semibold transition",
                    active
                      ? "border-border-active bg-primary/15 text-text-primary"
                      : "border-transparent text-text-secondary hover:border-border hover:bg-bg-elevated/60 hover:text-text-primary",
                  ].join(" ")}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-bg-base/95 px-6 backdrop-blur">
            <div className="text-base font-semibold text-text-secondary">
              เมดแคร์ / <span className="text-text-primary">{title}</span>
            </div>
            <div className="flex min-h-12 items-center rounded-full border border-border px-4 text-base font-semibold text-text-secondary">
              ผู้ใช้งานระบบ
            </div>
          </header>

          <section className="flex-1 p-6">
            <div className="rounded-xl border border-border bg-bg-surface p-6 shadow-card">
              <h1 className="m-0 text-[28px] font-bold text-text-primary">{title}</h1>
              <p className="mt-3 text-lg text-text-secondary">{description}</p>
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
