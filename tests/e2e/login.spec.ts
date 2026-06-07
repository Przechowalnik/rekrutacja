import { expect, test } from "@playwright/test";

import { E_Routes, getRoute } from "~/constants/routes";

test.describe("Login page", () => {
  // This test only works on desktop viewports where login is in top navigation
  test("Navigate from home to login and check UI elements", async ({
    browserName,
    isMobile,
    page,
  }) => {
    const viewport = page.viewportSize();
    const isSmallViewport = isMobile || (viewport && viewport.width < 768);

    // Skip on mobile/small viewport - login button is in hamburger menu
    test.skip(
      !!isSmallViewport,
      "Small viewport navigation requires different flow",
    );

    // Skip on webkit - SSL connect error during navigation
    test.skip(
      browserName === "webkit",
      "Webkit has SSL issues during navigation",
    );

    // Go to home page
    await page.goto(
      getRoute({
        route: E_Routes.home,
      }),
    );

    await page.waitForSelector("main");

    // Click login button in navigation and wait for navigation
    const loginLink = page.getByRole("link", {
      name: "navigation.buttonLogin",
    });
    await loginLink.waitFor({ state: "visible" });

    await Promise.all([
      page.waitForURL("**/logowanie", { timeout: 15_000 }),
      loginLink.click(),
    ]);
    await page.waitForSelector("main");

    // Check login page elements - use form-specific selectors
    await expect(page.getByRole("textbox", { name: "email" })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
