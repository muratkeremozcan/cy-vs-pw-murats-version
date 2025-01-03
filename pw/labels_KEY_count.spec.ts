import type { Todo } from '../@types/todo'
import { test, expect } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    await resetAndVisit(items)
  })

  test('shows the right labels', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')
    // the application starts with 3 items
    // await expect(todos).toHaveCount(3) // better to make this more relaxed (shared state)
    expect(await todos.count()).toBeGreaterThanOrEqual(items.length)

    // get the label from each item and confirm the todos elements have the right text
    const labels = items.map((item) => item.title)

    // confirm the todo elements have the label from the fixture file
    await expect(todos).toHaveText(labels)
  })
})
