import { redirect } from "next/navigation";
import { defaultLocale } from "@graffio/i18n";

/**
 * CMS root page — redirects to sign-in.
 * No public content on the CMS app.
 */
export default function CmsRootPage() {
  redirect(`/${defaultLocale}/sign-in`);
}
