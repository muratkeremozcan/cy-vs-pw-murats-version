// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ request, page }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await expect(page.locator('.todo')).toHaveCount(3)
  })
  test('stores todos in the local storage', async ({ page, request }) => {
    // the local storage should have three items
    // under the property "todos"
    // get the local storage item "todos" and parse it
    // and return back to the test
    // Tip: use page.evaluate to run code in the browser
    const todos = await page.evaluate(() =>
      // @ts-expect-error
      JSON.parse(localStorage.getItem('todos')),
    )
    expect(todos).toHaveLength(3)
  })
})
