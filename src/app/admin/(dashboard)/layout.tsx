import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <h1 className="text-xl font-bold text-slate-900">BlogT3 Admin</h1>
        </div>
        <AdminNav />
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <p className="text-sm text-slate-600">
                欢迎, <span className="font-medium text-slate-900">{session.user?.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                查看网站
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
