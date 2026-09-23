import type { MetadataRoute } from "next";

/**
 * CMS robots.txt — noindex, nofollow for all CMS pages.
 * Per Instructions.md §4: CMS should not be indexed.
 * robots.txt is NOT an access control mechanism.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
