"use client";

import { useTranslations } from "next-intl";
import { Home, Eye, Bell, LogOut, ChevronDown } from "lucide-react";
import type { SessionUser } from "@graffio/auth";
import { Button } from "@graffio/ui";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

import { logoutAction } from "./logout-action";

export function CmsHeader({ user, onMenuClick }: { user: SessionUser; onMenuClick?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Parse path for breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  // Optional: slice out locale (assuming first segment is locale, e.g. 'id' or 'en')
  const pathSegments = segments.length > 1 ? segments.slice(1) : segments;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 capitalize">
          <Home className="size-4 text-slate-500 hidden sm:block" />

          {pathSegments.length === 0 ? (
            <>
              <span className="text-slate-400 hidden sm:block">/</span>
              <span>Dashboard</span>
            </>
          ) : (
            pathSegments.map((segment, index) => {
              const formattedName = segment.replace(/-/g, " ");
              const isLast = index === pathSegments.length - 1;
              return (
                <div key={segment} className="flex items-center gap-2">
                  <span className="text-slate-400 hidden sm:block">/</span>
                  <span className={isLast ? "text-slate-900" : "text-slate-500 hidden sm:block"}>
                    {formattedName}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        <a
          href={process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-9 gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md px-3 md:px-4 shadow-sm text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <Eye className="size-4" />
          <span className="hidden sm:inline">Live Website</span>
        </a>

        <button className="relative text-slate-600 hover:text-slate-900 transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-0 right-0 block size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Profile Dropdown Container (Hidden on Mobile) */}
        <div className="hidden md:block relative border-l pl-6 border-slate-200" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 -m-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.displayName}`}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-900 leading-tight">
                {user.displayName}
              </span>
              {/* <span className="text-[11px] font-medium text-slate-500">
                Super Admin
              </span> */}
            </div>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 mb-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-500">Masuk sebagai</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
