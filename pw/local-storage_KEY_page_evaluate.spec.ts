import { test, expect } from './support/fixtures'
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    await resetAndVisit(items)
  })
  test('stores todos in the local storage', async ({ page }) => {
    // the local storage should have three items under the property "todos"
    // get the local storage item "todos" and parse it and return back to the test
    // Tip: use page.evaluate to run code in the browser
    const todos = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('todos') as string),
    )
    expect(todos).toHaveLength(3)
  })
})
