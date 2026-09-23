"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@graffio/ui";

export function LanguageSwitcher({
  className,
  theme = "light",
}: {
  className?: string;
  theme?: "light" | "dark";
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract locale from pathname (e.g., /id/dashboard -> id)
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0] === "en" || segments[0] === "id" ? segments[0] : "id";

  const switchLanguage = (newLocale: "id" | "en") => {
    if (newLocale === currentLocale) return;

    const restOfPath = segments.slice(1).join("/");
    const newPath = `/${newLocale}/${restOfPath}${window.location.search}`;
    router.push(newPath);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg border w-fit",
        theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-800 border-slate-700",
        className,
      )}
    >
      <Globe
        className={cn(
          "size-4 ml-1.5 mr-1",
          theme === "light" ? "text-slate-400" : "text-slate-500",
        )}
      />
      <button
        onClick={() => switchLanguage("id")}
        className={cn(
          "px-2.5 py-1 text-xs font-bold rounded-md transition-colors",
          currentLocale === "id"
            ? theme === "light"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
              : "bg-slate-700 text-white shadow-sm ring-1 ring-slate-600/50"
            : theme === "light"
              ? "text-slate-500 hover:text-slate-700"
              : "text-slate-400 hover:text-slate-300",
        )}
      >
        ID
      </button>
      <button
        onClick={() => switchLanguage("en")}
        className={cn(
          "px-2.5 py-1 text-xs font-bold rounded-md transition-colors",
          currentLocale === "en"
            ? theme === "light"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
              : "bg-slate-700 text-white shadow-sm ring-1 ring-slate-600/50"
            : theme === "light"
              ? "text-slate-500 hover:text-slate-700"
              : "text-slate-400 hover:text-slate-300",
        )}
      >
        EN
      </button>
    </div>
  );
}
