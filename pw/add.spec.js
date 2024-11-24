// @ts-check
const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ request, page }) => {
  await request.post('/reset', { data: { todos: [] } })

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

  await expect(page.locator('.todo-list li')).toHaveCount(0, { timeout: 1000 })
})

test('has title', async ({ page }, testInfo) => {
  console.log('running test "%s"', testInfo.titlePath.join('/'))
  await expect(page).toHaveTitle('cy-vs-pw-example-todomvc')
})

test('adding todos', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?')
  const todos = page.locator('.todo-list li label')

  await input.fill('Write code')
  await input.press('Enter')

  await expect(todos).toHaveCount(1)
  await expect(todos).toHaveText('Write code')
})
