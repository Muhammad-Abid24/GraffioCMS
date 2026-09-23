"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@graffio/ui";
import type { SessionUser } from "@graffio/auth";
import {
  LayoutDashboard,
  Layers,
  ChevronDown,
  Box,
  ExternalLink,
  Circle,
  Building,
  HelpCircle,
} from "lucide-react";
import { logoutAction } from "./logout-action";
import { LanguageSwitcher } from "@/components/language-switcher";

function getIconComponent(iconName: string | null) {
  switch (iconName) {
    case "layout-dashboard":
      return <LayoutDashboard className="size-5" />;
    case "building":
      return <Building className="size-5" />;
    case "help-circle":
      return <HelpCircle className="size-5" />;
    case "master":
    default:
      return <Box className="size-5" />;
  }
}

interface MenuItem {
  key: string;
  labelKey: string;
  href: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const SYSTEM_MENUS: MenuItem[] = [
  {
    key: "dashboard",
    labelKey: "nav.dashboard",
    href: "dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
];

const PLACEHOLDER_MENUS: MenuItem[] = [
  {
    key: "master",
    labelKey: "nav.master",
    href: "#",
    icon: <Box className="size-5" />,
    children: [
      {
        key: "company-profile",
        labelKey: "nav.companyProfile",
        href: "company-profile",
        icon: null,
      },
      {
        key: "faq",
        labelKey: "nav.faq",
        href: "faq",
        icon: null,
      },
    ],
  },
];

export function CmsSidebar({
  user,
  supabaseUrl,
  onClose,
  menus = [],
}: {
  user: SessionUser;
  supabaseUrl?: string;
  onClose?: () => void;
  menus?: any[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const toggleMenu = (menuId: number, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const rootMenus = menus.filter((m) => !m.parentId);
  const childMenus = menus.filter((m) => m.parentId);

  const menuTree = rootMenus.map((root) => ({
    ...root,
    children: childMenus.filter((child) => child.parentId === root.menuId),
  }));

  const supabaseRef = supabaseUrl?.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
  const supabaseDashboardUrl = supabaseRef
    ? `https://supabase.com/dashboard/project/${supabaseRef}/editor`
    : "https://supabase.com/dashboard";

  const hostingUrl = "https://auth.hostinger.com/id/login";

  return (
    <aside className="flex w-72 md:w-64 flex-col bg-[#242b3d] text-slate-300 shadow-xl overflow-hidden h-screen">
      {/* Top Brand Section */}
      <div className="flex flex-col border-b border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-white leading-none">
              GRAFFIO <span className="font-light text-blue-400">CMS</span>
            </div>
            <div className="text-[7px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
              Content Management System
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden ml-auto flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-white tracking-wide">PT. XYZ</h2>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
            Company
            <br />
            Profile
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Sidebar">
        <div className="px-3 mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          Navigasi Utama
        </div>
        {menuTree.map((item) => {
          const expectedPath = `/${locale}/${item.menuUrl}`;
          const isActive = pathname === expectedPath || pathname.startsWith(`${expectedPath}/`);
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus[item.menuId];

          return (
            <div key={item.menuAlias} className="space-y-1">
              <Link
                href={hasChildren ? "#" : `/${locale}/${item.menuUrl}`}
                onClick={hasChildren ? (e) => toggleMenu(item.menuId, e) : onClose}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive && !hasChildren
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
                aria-current={isActive && !hasChildren ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  {getIconComponent(item.menuIcon)}
                  {item.menuName}
                </div>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      "size-4 text-slate-500 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                )}
              </Link>

              {/* Children */}
              {hasChildren && isOpen && (
                <div className="ml-9 mt-1 space-y-1 border-l border-slate-700/50 pl-2">
                  {item.children.map((child: any) => {
                    const expectedChildPath = `/${locale}/${child.menuUrl}`;
                    const isChildActive =
                      pathname === expectedChildPath ||
                      pathname.startsWith(`${expectedChildPath}/`);
                    return (
                      <Link
                        key={child.menuAlias}
                        href={`/${locale}/${child.menuUrl}`}
                        onClick={onClose}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          isChildActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
                        )}
                      >
                        {child.menuName}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-700/50 p-4 bg-slate-900/20">
        <LanguageSwitcher theme="dark" />
      </div>

      {/* Footer Section */}
      <div className="border-t border-slate-700/50 p-4 bg-slate-900/20">
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Circle className="size-2 fill-emerald-400 text-emerald-400" />
            <span>DB Online/Live</span>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href={hostingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between rounded-md bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="size-3.5" />
              Quick View Hosting
            </div>
          </a>
          <a
            href={supabaseDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between rounded-md bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="size-3.5" />
              Quick View Database
            </div>
          </a>
        </div>

        {/* Mobile Profile & Logout (Hidden on Desktop) */}
        <div className="md:hidden mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.displayName}`}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white leading-tight">{user.displayName}</span>
              <span className="text-xs text-slate-400 truncate w-32">{user.email}</span>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
