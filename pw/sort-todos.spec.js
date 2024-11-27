// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')
const { tap, map, path, pipe } = require('ramda')

test.describe('App', () => {
  test.beforeEach(async ({ request, page }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
  })

  test('shows items sorted by price', async ({ page }) => {
    const todos = page.locator('.todo-list li')

    // confirm there are several items
    // and parse each item's title to get the prices
    // and confirm they are sorted in the ascending order
    await expect(async () => {
      const titles = await todos.allTextContents()
      const matches = titles.map((s) => s.match(/\$(?<price>\d+)/))
      const strings = matches.map((m) => m?.groups?.price)
      // @ts-ignore
      const prices = strings.map(parseFloat)
      const sorted = structuredClone(prices).sort() // doesn't mutate the original prices
      console.log(sorted)
      expect(sorted, 'sorted from min to max').toEqual(prices)
    }).toPass()
  })

  test('ramda version', async ({ page }) => {
    const todos = page.locator('.todo-list li')

    await expect(async () => {
      const titles = await todos.allTextContents()

      // Functional pipeline to extract and parse prices
      const extractPrices = pipe(
        map((s) => s.match(/\$(\d+(\.\d+)?)/)), // Match prices like $59 or $59.99
        tap(console.log),
        map(path([1])), // Extract the captured price string
        tap(console.log),
        map(parseFloat), // Convert price strings to numbers
      )
      const prices = extractPrices(titles)
      const sorted = structuredClone(prices).sort()

      expect(sorted, 'sorted from min to max').toEqual(prices)
    }).toPass()
  })
})
