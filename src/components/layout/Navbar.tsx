'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Palette, Menu } from 'lucide-react';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { HuePicker } from '../ui/HuePicker';

const navLinks = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '归档', href: '/archive' },
  { name: '关于', href: '/about' },
];

export function Navbar() {
  const [showHuePicker, setShowHuePicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div id="navbar" className="sticky top-0 z-50 onload-animation">
      {/* Top spacer for animation */}
      <div className="absolute h-8 left-0 right-0 -top-8 bg-[var(--card-bg)] transition" />

      <div className="card-base !overflow-visible max-w-[var(--page-width)] h-[4.5rem] !rounded-t-none mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="btn-plain scale-animation rounded-lg h-[3.25rem] px-5 font-bold"
        >
          <div className="flex items-center text-[var(--primary)] text-md">
            <Home className="h-7 w-7 mr-2 -mb-1" />
            BlogT3
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-plain scale-animation rounded-lg h-11 px-5 font-bold"
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
            className="btn-plain scale-animation rounded-lg h-11 w-11"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Hue Picker */}
          <button
            aria-label="主题色设置"
            className="btn-plain scale-animation rounded-lg h-11 w-11"
            onClick={() => setShowHuePicker(!showHuePicker)}
          >
            <Palette className="h-5 w-5" />
          </button>

          {/* Theme Switch */}
          <ThemeSwitch />

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="btn-plain scale-animation rounded-lg h-11 w-11 md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {showMobileMenu && (
          <div className="absolute top-[5.25rem] left-4 right-4 card-base float-panel p-2 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-plain scale-animation rounded-lg h-11 px-4 font-bold flex items-center justify-start w-full"
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
