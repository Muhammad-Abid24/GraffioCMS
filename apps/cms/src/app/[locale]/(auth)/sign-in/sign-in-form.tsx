"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button, Input, Label } from "@graffio/ui";
import Link from "next/link";
import Image from "next/image";
import { signInAction } from "./action";
import {
  Circle,
  Globe,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SignInForm() {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState(signInAction, {
    error: null,
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-[700px] w-full md:grid-cols-2 rounded-2xl overflow-hidden bg-background shadow-2xl ring-1 ring-border/50">
      {/* Left Pane - Visual & Brand */}
      <div className="relative hidden md:flex flex-col justify-between p-10 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg_signin.png"
            alt="Dashboard Background"
            width={1000}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium tracking-wide">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <Circle className="size-2 fill-emerald-400 text-emerald-400" />
            <span>GRAFFIO CMS • LIVE ENGINE</span>
          </div>
          <div className="text-white/70">SYS: CMS-NODE-JKT-04</div>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 my-auto pr-8">
          <div className="mb-6 text-6xl font-serif leading-none text-white/40">&rdquo;</div>
          <h2 className="text-3xl leading-snug font-medium mb-8">
            &ldquo;Transformasi profil korporat berskala global melalui kurasi portofolio interaktif
            dan performa publikasi kilat.&rdquo;
          </h2>
          <div className="flex items-center gap-4">
            {/* <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 border border-white/20">
              <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-400" />
            </div> */}
            <div>
              <div className="font-semibold text-lg">Althea Radhitya</div>
              <div className="text-sm text-white/70">VP Corporate Communication & Branding</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/50">
          <div>Graffio &copy; 2024</div>
          <div className="flex items-center gap-1.5">
            <Globe className="size-3.5" />
            <span>Multi-Region CDN (ID-SG)</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-14 lg:p-16 relative">
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <LanguageSwitcher />
        </div>

        {/* Logo Section */}
        <div className="mb-12 mt-4 md:mt-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Layers className="size-6" />
            </div>
            <div className="font-bold text-2xl tracking-tight text-slate-900">
              GRAFFIO <span className="font-light text-slate-500">CMS</span>
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Content Management System &bull; Enterprise
          </div>
        </div>

        {/* Main Form Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Masuk ke Akun Anda
          </h1>
          <p className="text-sm text-slate-500 mb-10 leading-relaxed max-w-[400px]">
            Kelola katalog produk, showroom portofolio, dan narasi reputasi bisnis Anda melalui satu
            sistem kendali terpadu.
          </p>

          <form action={formAction} className="space-y-6">
            {state.error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100"
              >
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                Email Perusahaan
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <AtSign className="size-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="budi.pratama@nexa.co.id"
                  className="pl-10 bg-slate-50 border-slate-200 h-12 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Kata Sandi Portal
                </Label>
                <Link
                  href="./forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="size-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="pl-10 pr-10 bg-slate-50 border-slate-200 h-12 rounded-lg text-lg tracking-widest placeholder:text-sm placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg group"
                disabled={isPending}
              >
                {isPending ? "..." : "Masuk ke Graffio CMS"}
                {!isPending && (
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Pane Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
        </div>
      </div>
    </div>
  );
}
