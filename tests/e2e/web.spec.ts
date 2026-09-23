import { test, expect } from "@playwright/test";

test.describe("Web - Public Page", () => {
  test("homepage loads and has correct title", async ({ page }) => {
    await page.goto("/id");
    await expect(page).toHaveTitle(/Graffio/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("no /cms route exists on public site", async ({ page }) => {
    const response = await page.goto("/cms");
    expect(response?.status()).toBe(404);
  });
});
