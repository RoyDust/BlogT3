import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 保护 /admin 路由（除了登录页和注册页）
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/register"
  ) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // 检查用户角色，只有 ADMIN 和 MODERATOR 可以访问后台
    // 无 role 或角色不符的用户跳转到登录页重新认证
    const role = (req.auth as any).user?.role;
    if (!role || (role !== "ADMIN" && role !== "MODERATOR")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 如果已登录访问登录页或注册页，重定向到后台首页
  if ((pathname === "/admin/login" || pathname === "/admin/register") && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
