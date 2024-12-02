// @ts-check
const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ request, page }) => {
  // if the application throws an unhandled error  we want to fail the test.
  // In PW, we have to register the error callback before visiting the page
  page.on('pageerror', (exception) => {
    throw new Error('App threw an error')
  })

  await page.goto('/')

  // https://playwright.dev/docs/locators
  // https://playwright.dev/docs/api/class-locatorassertions
  await expect(page.locator('body')).toHaveClass('loaded')
  // same thing
  await page.locator('body.loaded').waitFor()
})

test('has title', async ({ page }, testInfo) => {
  console.log('running test "%s"', testInfo.titlePath.join('/'))
  await expect(page).toHaveTitle('cy-vs-pw-example-todomvc')
})

test('adding todos', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?')
  await input.fill('Write code')
  await input.press('Enter')

  const todos = page.locator('.todo-list li label')
  expect(await todos.count()).toBeGreaterThanOrEqual(1)
  // Check if at least one element contains the text
  page.locator('li.todo', { hasText: 'Write code' })
})
