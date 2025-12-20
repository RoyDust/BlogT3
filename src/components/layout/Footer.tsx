"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="onload-animation mt-auto">
      <div className="mx-auto max-w-[var(--page-width)] py-8">
        <div className="card-base p-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Left: Copyright */}
            <div className="text-75 flex items-center gap-2 text-sm">
              <span>© {currentYear} BlogT3</span>
              <span className="text-50">·</span>
              <span className="flex items-center gap-1">
                Made with{" "}
                <Heart className="h-4 w-4 fill-current text-red-500" /> by Zhang
                Wei
              </span>
            </div>

            {/* Right: Links */}
            <div className="text-75 flex items-center gap-4 text-sm">
              <Link
                href="/about"
                className="transition hover:text-[var(--primary)]"
              >
                关于
              </Link>
              <span className="text-50">·</span>
              <Link
                href="/rss.xml"
                className="transition hover:text-[var(--primary)]"
              >
                RSS
              </Link>
              <span className="text-50">·</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[var(--primary)]"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Bottom: Tech Stack */}
          <div className="mt-4 border-t border-dashed border-[var(--line-color)] pt-4 text-center">
            <p className="text-50 text-xs">
              Powered by{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Next.js
              </a>
              {" · "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Supabase
              </a>
              {" · "}
              <a
                href="https://tailwindcss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Tailwind CSS
              </a>
            </p>
            <p className="text-50 mt-1 text-xs">
              基于{" "}
              <a
                href="https://github.com/saicaca/fuwari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                RealBlog (Fuwari)
              </a>{" "}
              设计系统
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
