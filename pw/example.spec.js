// @ts-check
const { test, expect } = require('@playwright/test')

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000')

  await expect(page).toHaveTitle('cy-vs-pw-example-todomvc')
})
