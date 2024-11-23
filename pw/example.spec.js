// @ts-check
const { test, expect } = require('@playwright/test')

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('cy-vs-pw-example-todomvc')

  // https://playwright.dev/docs/locators
  // and the count assertion
  // https://playwright.dev/docs/api/class-locatorassertions
  await expect(page.locator('.todo-list li')).toHaveCount(3, { timeout: 5000 })
})
