import { Navbar } from '~/components/layout/Navbar';
import { Sidebar } from '~/components/layout/Sidebar';
import { Footer } from '~/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] transition-colors">
      {/* Navbar - 固定在顶部 */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[var(--page-width)] flex-1 gap-4 px-4 py-6">
          {/* Sidebar - 固定在左侧 */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content - 只有这部分会随路由变化 */}
          <main
            id="main-content"
            className="onload-animation min-w-0 flex-1"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Footer - 移到外层,全宽显示 */}
      <Footer />
    </div>
  );
}
