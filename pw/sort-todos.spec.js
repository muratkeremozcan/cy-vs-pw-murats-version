// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')
const { tap, map, path, pipe } = require('ramda')

test.describe('App', () => {
  let todos
  test.beforeEach(async ({ request, page }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await page.locator('.loaded').waitFor()
    todos = page.locator('.todo-list li')
  })

  test('shows items sorted by price', async () => {
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

  test('ramda version - shows items sorted by price', async () => {
    await expect(async () => {
      const titles = await todos.allInnerTexts() // text content without white space

      // Functional pipeline to extract and parse prices
      const extractPrices = pipe(
        map((s) => s.match(/\$(\d+(\.\d+)?)/)), // Match prices like $59 or $59.99
        tap(console.log),
        map(path([1])), // get index 1s in array of arrays
        map(parseFloat), // Convert price strings to numbers
      )
      const prices = extractPrices(titles)
      const sorted = structuredClone(prices).sort()

      expect(sorted, 'sorted from min to max').toEqual(prices)
    }).toPass()
  })

  test('shows the items with css class', async () => {
    // from the list of items get the list of titles
    // and the list of CSS classes each item element should have
    // completed? "todo" + "completed"
    // incomplete? just "todo"
    const titles = items.map((item) => item.title)
    const cssClasses = items.map((item) =>
      item.completed ? 'todo completed' : 'todo',
    )

    // confirm the todo items have the titles and the class names
    await expect(todos).toHaveText(titles)
    await expect(todos).toHaveClass(cssClasses, { timeout: 7000 })
  })
})
