"use client";

import { useState } from "react";
import { CmsSidebar } from "./sidebar";
import { CmsHeader } from "./header";
import { Footer } from "@graffio/ui";
import type { SessionUser } from "@graffio/auth";

export function AppLayout({
  children,
  user,
  supabaseUrl,
  menus = [],
}: {
  children: React.ReactNode;
  user: SessionUser;
  supabaseUrl?: string;
  menus?: any[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CmsSidebar
          user={user}
          supabaseUrl={supabaseUrl}
          onClose={() => setIsMobileMenuOpen(false)}
          menus={menus}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <CmsHeader user={user} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 w-full flex flex-col pb-4">
          <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1 flex flex-col">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
