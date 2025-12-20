import "~/app/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ThemeProvider } from "~/components/ui/ThemeProvider";
import { BackToTop } from "~/components/ui/BackToTop";
import { SessionProvider } from "~/components/providers/SessionProvider";
import { getThemeInitScript } from "~/lib/theme-utils";

export const metadata: Metadata = {
  title: "BlogT3 - 现代化博客平台",
  description: "基于 Next.js 15 和 Supabase 构建的类型安全博客系统",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitScript(),
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <BackToTop />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
