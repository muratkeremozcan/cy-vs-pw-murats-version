// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('App', () => {
  let load

  test.beforeEach(async ({ page }) => {
    // spy on the network calls to "/todos" endpoint
    load = page.waitForRequest('/todos')
    await page.goto('/')
  })

  test('shows the same number of items as sent by the server', async ({
    page,
  }) => {
    // confirm the network call has happened
    // and get the response as json
    // confirm the page shows the same number of todo items
    // as sent by the server
    const request = await load
    const response = await request.response()
    const todos = await response.json()

    await expect(page.locator('.todo-list li')).toHaveCount(todos.length)
  })
})