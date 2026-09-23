import * as React from "react";
import { ShieldCheck, Circle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 md:px-6 py-4 w-full mt-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <ShieldCheck className="size-3.5" />
          <span>256-Bit SSL Enkripsi TLS 1.3</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <Circle className="size-2 fill-emerald-500 text-emerald-500" />
          <span>Server Sentral: Optimal</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Perlu hak akses baru?{" "}
          <button className="text-blue-600 hover:underline font-medium">Kontak IT Admin</button>
        </div>
        <button className="hover:text-slate-800 transition-colors font-medium">
          Panduan Portal
        </button>
      </div>
    </footer>
  );
}
