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
  CardContent,
  CardFooter,
} from "@graffio/ui";
import Link from "next/link";
import { resetPasswordAction } from "./action";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {
    success: false,
    error: null,
  });

  if (state.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="status"
            className="rounded-md bg-success/10 p-3 text-sm text-success text-center"
          >
            {t("resetSuccess")}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="./sign-in" className="text-sm text-primary hover:underline">
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "..." : t("resetPassword")}
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
