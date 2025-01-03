import type { Todo } from '../@types/todo'
import type { Locator } from '@playwright/test'
import { test, expect } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')
const { map, path, pipe, invoker } = require('ramda')

test.describe('App', () => {
  let todos: Locator
  test.beforeEach(async ({ page, resetAndVisit }) => {
    await resetAndVisit(items)
    todos = page.locator('.todo-list li')
  })

  test('shows items sorted by price', async () => {
    // confirm there are several items
    // and parse each item's title to get the prices
    // and confirm they are sorted in the ascending order
    await expect(async () => {
      const titles = await todos.allTextContents() // or todos.allInnerTexts
      const matches = titles.map((s) => s.match(/\$(?<price>\d+)/))
      const strings = matches.map((m) => m?.groups?.price)
      const prices = strings.map((s) => (s ? parseFloat(s) : 0))
      const sorted = structuredClone(prices).sort() // doesn't mutate the original prices
      console.log(sorted)

      expect(sorted, 'sorted from min to max').toEqual(prices)
    }).toPass()
  })

  test('ramda version - shows items sorted by price', async () => {
    await expect(async () => {
      const titles = await todos.allTextContents() // or todos.allInnerTexts
      const prices = pipe(
        map(invoker(1, 'match')(/\$(\d+(\.\d+)?)/)),
        map(path([1])),
        map(parseFloat),
      )(titles)
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
    // timeouts in PW: timeout is added directly to the assertion
    await expect(todos).toHaveClass(cssClasses, { timeout: 7000 })
  })
})
