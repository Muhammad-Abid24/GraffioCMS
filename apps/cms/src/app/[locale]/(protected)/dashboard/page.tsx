import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Circle, TrendingUp, CheckCircle2, MapPin, PlaySquare } from "lucide-react";
import { Button } from "@graffio/ui";
import type { SessionUser } from "@graffio/auth";

import { cookies } from "next/headers";
import { requireUser } from "@graffio/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const { user } = await requireUser(token);

  const t = await getTranslations("dashboard");

  // Format date helper
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl flex-1">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
          <span>IKHTISAR SISTEM</span>
          <span>&bull;</span>
          <span className="text-emerald-600">SEMUA LAYANAN NORMAL</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Selamat Datang Kembali, <span className="text-blue-600">{user.displayName}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {dateStr} &bull; Ringkasan performa konten dari PT. XYZ
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left Card - Digital Performance Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-border/50 h-[420px] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 z-10 relative">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                PERFORMA DIGITAL
              </div>
              <h2 className="text-lg font-bold text-slate-900">Trafik Kunjungan Company Profile</h2>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-500">
              <button className="px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                7 Hari
              </button>
              <button className="px-3 py-1.5 rounded-md bg-white text-blue-600 shadow-sm">
                30 Hari
              </button>
              <button className="px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                1 Tahun
              </button>
            </div>
          </div>

          <div className="flex items-center gap-12 z-10 relative mb-4">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">Total Pageviews</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 leading-none">48,250</span>
                <span className="flex items-center text-xs font-bold text-emerald-600 mb-1">
                  +18.4%
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">Pengunjung Unik</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 leading-none">19,420</span>
                <span className="flex items-center text-xs font-bold text-emerald-600 mb-1">
                  +9.1%
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">Rerata Durasi Sesi</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 leading-none">03:42</span>
                <span className="text-xs font-bold text-slate-500 mb-1">Menit</span>
              </div>
            </div>
          </div>

          {/* SVG Area Chart Decoration */}
          <div className="absolute inset-x-0 bottom-0 h-64 overflow-hidden pointer-events-none">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Green dashed line (Comparison) */}
              <path
                d="M0,250 C150,220 300,180 500,200 C700,220 850,150 1000,160"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeDasharray="6,6"
              />
              {/* Blue solid area (Current) */}
              <path
                d="M0,220 C200,120 400,190 600,160 C700,140 750,40 850,120 C950,200 980,100 1000,80 L1000,300 L0,300 Z"
                fill="url(#blueGradient)"
              />
              <path
                d="M0,220 C200,120 400,190 600,160 C700,140 750,40 850,120 C950,200 980,100 1000,80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Data point circle */}
              <circle cx="710" cy="115" r="5" fill="#3b82f6" className="ring-4 ring-blue-100" />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-4 inset-x-8 flex justify-between text-xs font-semibold text-slate-400">
              <span>01 Mei</span>
              <span>07 Mei</span>
              <span>14 Mei</span>
              <span>21 Mei</span>
              <span className="text-slate-600">Hari Ini (24 Mei)</span>
            </div>
          </div>
        </div>

        {/* Right Card - SEO Audit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-border/50 h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                AUDIT KUALITAS
              </div>
              <div className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Optimal
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-6">Kesehatan & SEO Website</h2>

            {/* Gauge Graphic */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-5 mb-6">
              <div className="relative size-20 flex-shrink-0">
                <svg
                  className="size-full -rotate-90"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-slate-200"
                    strokeWidth="3"
                  />
                  {/* Progress Circle (94% = 94.4 dash out of 100.5) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-emerald-600"
                    strokeWidth="3"
                    strokeDasharray="94.4, 100.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 leading-none">94</span>
                  <span className="text-[9px] font-bold text-slate-400">/100</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-900 mb-1">Skor SEO Baik</div>
                <p className="text-xs text-slate-500 leading-snug">
                  Sitemap & Meta Tag terpasang rapi di semua halaman.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 flex justify-between items-center text-sm font-medium text-slate-700">
                  <span>OpenGraph & Twitter Card</span>
                  <span className="text-xs text-emerald-600 font-bold">Terverifikasi</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 flex justify-between items-center text-sm font-medium text-slate-700">
                  <span>Google Maps Static & Embed</span>
                  <span className="text-xs text-emerald-600 font-bold">Aktif</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PlaySquare className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 flex justify-between items-center text-sm font-medium text-slate-700">
                  <span>Video Profil Perusahaan</span>
                  <span className="text-xs text-emerald-600 font-bold">Berjalan</span>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold mt-4">
            Jalankan Audit SEO Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
