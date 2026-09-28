import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function AmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth("AM");

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
