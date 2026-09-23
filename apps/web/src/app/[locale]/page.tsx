import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graffio — Modern Web Platform",
  description: "Graffio is a modern, fast, and accessible web platform built with Next.js.",
};

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t("appName")}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Modern, fast, and accessible web platform.
        </p>
      </div>
    </main>
  );
}
