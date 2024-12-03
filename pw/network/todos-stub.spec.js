// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../../fixtures/three.json')
const { interceptNetworkCall } = require('../support/utils/network')

test.describe(' - regular version', () => {
  test.beforeEach(async ({ page }) => {
    // set up a route handler for "/todos" endpoint
    // when the route matches, fulfill it using the loaded items array
    page.route('/todos', (route) => {
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

    // confirm the the number of shown todos is items.length
    // and that todos show up within 100ms of the load network call
    await expect(page.locator('.todo-list li')).toHaveCount(items.length)
  })
})

test.describe('network helpers version', () => {
  let load

  test.beforeEach(async ({ page }) => {
    // set up a route handler for "/todos" endpoint
    // when the route matches, fulfill it using the loaded items array
    load = interceptNetworkCall({
      method: 'GET',
      url: '/todos',
      page,
      fulfillResponse: {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      },
    })

    await page.goto('/')
  })

  test('shows the items with css class', async ({ page }) => {
    // wait for the intercepted network call "load"
    await load

    // confirm the the number of shown todos is items.length
    // and that todos show up within 100ms of the load network call
    await expect(page.locator('.todo-list li')).toHaveCount(items.length)
  })
})
