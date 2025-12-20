"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home, Search, Palette, Menu } from "lucide-react";
import { ThemeSwitch } from "../ui/ThemeSwitch";
import { HuePicker } from "../ui/HuePicker";
import { useScrollHide } from "@/hooks/useScrollHide";

const navLinks = [
  { name: "首页", href: "/" },
  { name: "博客", href: "/blog" },
  { name: "归档", href: "/archive" },
  { name: "关于", href: "/about" },
];

export function Navbar() {
  const [showHuePicker, setShowHuePicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isHidden = useScrollHide({ threshold: 100, delta: 5 });

  return (
    <div
      id="navbar"
      className={`onload-animation sticky top-0 z-50 transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Top spacer for animation */}
      <div className="absolute -top-8 right-0 left-0 h-8 bg-[var(--card-bg)] transition" />

      <div className="card-base mx-auto flex h-[4.5rem] max-w-[var(--page-width)] items-center justify-between !overflow-visible !rounded-t-none px-4">
        {/* Logo */}
        <Link
          href="/"
          className="btn-plain scale-animation h-[3.25rem] rounded-lg px-5 font-bold"
        >
          <div className="text-md flex items-center text-[var(--primary)]">
            <Home className="mr-2 -mb-1 h-7 w-7" />
            BlogT3
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-plain scale-animation h-11 rounded-lg px-5 font-bold"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center">
          {/* Search (Placeholder) */}
          <button
            aria-label="搜索"
            className="btn-plain scale-animation h-11 w-11 rounded-lg"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Hue Picker */}
          <button
            aria-label="主题色设置"
            className="btn-plain scale-animation h-11 w-11 rounded-lg"
            onClick={() => setShowHuePicker(!showHuePicker)}
          >
            <Palette className="h-5 w-5" />
          </button>

          {/* Theme Switch */}
          <ThemeSwitch />

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="btn-plain scale-animation h-11 w-11 rounded-lg md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {showMobileMenu && (
          <div className="card-base float-panel absolute top-[5.25rem] right-4 left-4 p-2 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-plain scale-animation flex h-11 w-full items-center justify-start rounded-lg px-4 font-bold"
                onClick={() => setShowMobileMenu(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Hue Picker Panel */}
        <HuePicker isOpen={showHuePicker} />
      </div>
    </div>
  );
}
