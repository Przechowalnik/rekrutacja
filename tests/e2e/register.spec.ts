import { expect, test } from "@playwright/test";

import { E_Routes, getRoute } from "~/constants/routes";

import { isEnableCreateOrLoginCompany_TESTS } from "../constants/flags.tests";

test.describe("Registration page", () => {
  test("Visibility UI-s", async ({ page }) => {
    await page.goto(
      getRoute({
        route: E_Routes.registration,
      }),
    );

    await page.waitForSelector("main");

    // check title
    await expect(page.getByRole("heading", { name: "title" })).toBeVisible();

    // check description
    await expect(page.getByText("description")).toBeVisible();

    // check information
    await expect(page.getByText("information")).toBeVisible();

    // check buttons
    await expect(
      page.getByRole("link", { exact: true, name: "buttonLogin" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        exact: true,
        name: "buttonRegistrationAccount",
      }),
    ).toBeVisible();

    if (isEnableCreateOrLoginCompany_TESTS()) {
      await expect(
        page.getByRole("link", {
          exact: true,
          name: "buttonRegistrationCompany",
        }),
      ).toBeVisible();
    }
  });
});
