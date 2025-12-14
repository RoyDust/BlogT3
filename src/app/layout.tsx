import "~/app/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogT3 - 现代化博客平台",
  description: "基于 Next.js 15 和 Supabase 构建的类型安全博客系统",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
