// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    // set up a route handler for "/todos" endpoint
    // when the route matches, fulfill it using the loaded items array
    await page.route('/todos', (route) => {
      route.fulfill({
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
    })

    await page.goto('/')
  })

  test('shows the items with css class', async ({ page }) => {
    // wait for the intercepted network call "load"
    await page.waitForResponse('/todos')

    // confirm the the number of shown todos is 3
    // and that todos show up within 100ms of the load network call
    await expect(page.locator('.todo-list li')).toHaveCount(3)
  })
})
