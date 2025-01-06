import type { Locator } from '@playwright/test'
import { test, expect } from './support/fixtures'
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    // await new Promise((resolve) => setTimeout(resolve, 2000))
    await resetAndVisit(items)
  })

  const deleteNth = async (todos: Locator, n: number) => {
    await todos.nth(n).hover()
    await todos.nth(n).locator('.destroy').click()
  }

  test('deletes items', async ({ page }) => {
    const todos = page.locator('.todo-list li')
    await expect(todos).toHaveCount(items.length)

    // delete one completed item (the middle one)
    await deleteNth(todos, 1)

    // confirm the remaining two items are still there
    await expect(todos).toHaveCount(items.length - 1)
    await expect(todos).toHaveText(['Write code $1', 'Make tests pass $59'])

    // delete one incomplete item (the first one)
    await deleteNth(todos, 0)

    // confirm the one remaining item
    await expect(todos).toHaveCount(items.length - 2)
    await expect(todos).toHaveText('Make tests pass $59')
  })
})
