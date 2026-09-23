import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@graffio/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@graffio/i18n/messages/${locale}.json`)).default,
  };
});
