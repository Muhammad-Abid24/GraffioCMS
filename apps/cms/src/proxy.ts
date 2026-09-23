import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@graffio/i18n";

export default createMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  matcher: ["/", "/(id|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
