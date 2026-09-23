import { test, expect } from "@playwright/test";

test.describe("CMS - Authentication", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/id/sign-in");
    await expect(page.getByRole("heading")).toContainText("Masuk");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/id/forgot-password");
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto("/id/reset-password?token=test");
    await expect(page.getByLabel("Password Baru")).toBeVisible();
  });

  test("protected routes redirect to sign-in without session", async ({ page }) => {
    await page.goto("/id/dashboard");
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("robots.txt disallows all crawling", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("Disallow: /");
  });
});
