"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@graffio/ui";
import Link from "next/link";
import { forgotPasswordAction } from "./action";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {
    success: false,
    error: null,
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("forgotPassword")}</CardTitle>
        <CardDescription>Masukkan email Anda untuk menerima link reset password.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.success && (
            <div role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">
              {t("resetLinkSent")}
            </div>
          )}
          {state.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "..." : t("sendResetLink")}
          </Button>
          <Link
            href="./sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
