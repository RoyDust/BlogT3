'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--page-bg)] transition-colors">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="max-w-[var(--page-width)] mx-auto w-full flex gap-4 px-4 py-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          )}

          {/* Main Content */}
          <main
            id="main-content"
            className={`flex-1 min-w-0 onload-animation ${showSidebar ? '' : 'max-w-4xl mx-auto'}`}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
