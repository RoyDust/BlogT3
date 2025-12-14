"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "仪表板", href: "/admin", icon: "📊" },
  { name: "文章管理", href: "/admin/posts", icon: "📝" },
  { name: "分类管理", href: "/admin/categories", icon: "📁" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-4">
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <span>🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </nav>
  );
}
