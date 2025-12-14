import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            BlogT3
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
            >
              首页
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
            >
              博客
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1">{children}</div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-slate-600">
            <p>© 2025 BlogT3. Built with Next.js 15 & Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
