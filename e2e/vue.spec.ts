import { test, expect } from "@playwright/test"

// See here how to get started:
// https://playwright.dev/docs/intro
test("visits the app root url", async ({ page }) => {
	await page.goto("/")

	await expect(page.locator("p")).toHaveText("Write something on the canvas and see it displayed on the LED strip.")
})

// navigate to effects page via navigation
test("navigates to effects page", async ({ page }) => {
	await page.goto("/")

	await page.getByRole("button", { name: /Effects/ }).click()

	await expect(page).toHaveURL("/effects")
	await expect(page.locator("p")).toHaveText("Select an effect")
})
