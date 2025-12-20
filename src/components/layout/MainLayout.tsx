"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] transition-colors">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[var(--page-width)] flex-1 gap-4 px-4 py-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          )}

          {/* Main Content */}
          <main
            id="main-content"
            className={`onload-animation min-w-0 flex-1 ${showSidebar ? "" : "mx-auto max-w-4xl"}`}
          >
            {children}
            {/* Footer */}
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
