import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";

async function Tabs() {
  const tabs = [
    { label: "Dashboard", href: "/mt/dashboard" },
    { label: "Teams", href: "/mt/teams" },
    { label: "Prognoses", href: "/mt/prognoses" },
    { label: "KPI Beheer", href: "/mt/kpi-beheer" },
    { label: "MT KPI's", href: "/mt/mt-only-kpis" },
  ];

  return (
    <div className="border-b border-line">
      <div className="max-w-7xl mx-auto px-4 flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="py-4 px-2 text-sm font-medium border-b-2 border-transparent text-text-muted hover:text-charcoal transition"
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function MtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth("MT");

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      <header className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold font-serif text-charcoal">KPI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{user.name}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-3 py-1 text-sm border border-line rounded hover:bg-bg-soft transition"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      <Tabs />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
