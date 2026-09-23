import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    SESSION_MAX_AGE_SECONDS: z.coerce.number().default(18000),
    GA4_PROPERTY_ID: z.string().optional(),
    GA4_SERVICE_ACCOUNT_JSON: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
    MAIL_FROM: z.string().optional(),
    MAIL_PROVIDER_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CMS_URL: z.string().url().default("https://cms.example.com"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_MAX_AGE_SECONDS: process.env.SESSION_MAX_AGE_SECONDS,
    GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID,
    GA4_SERVICE_ACCOUNT_JSON: process.env.GA4_SERVICE_ACCOUNT_JSON,
    SENTRY_DSN: process.env.SENTRY_DSN,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_PROVIDER_API_KEY: process.env.MAIL_PROVIDER_API_KEY,
    NEXT_PUBLIC_CMS_URL: process.env.NEXT_PUBLIC_CMS_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
