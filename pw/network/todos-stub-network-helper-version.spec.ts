import { test, expect } from '../support/fixtures'
import type { InterceptNetworkCall } from '../support/utils/network'
const items = require('../../fixtures/three.json')

test.describe('network GET stub - network helpers version', () => {
  let load: InterceptNetworkCall

  test.beforeEach(async ({ page, interceptNetworkCall }) => {
    // set up a route handler for "/todos" endpoint
    // when the route matches, fulfill it using the loaded items array
    load = interceptNetworkCall({
      method: 'GET',
      url: '/todos',
      fulfillResponse: {
        body: items,
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
