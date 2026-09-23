import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@graffio/i18n";

export const routing = defineRouting({
  locales,
  defaultLocale,
});
