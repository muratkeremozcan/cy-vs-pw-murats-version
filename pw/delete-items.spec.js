// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ request }) => {
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await request.post('/reset', { data: { todos: items } })
  })

  test('deletes items', async ({ page }) => {
    const todos = page.locator('.todo-list li')

    await page.goto('/')
    await expect(todos).toHaveCount(items.length)

    // delete one completed item (the middle one)
    await todos.nth(1).hover()
    await todos.nth(1).locator('.destroy').click()

    // confirm the remaining two items are still there
    await expect(todos).toHaveCount(items.length - 1)
    await expect(todos).toHaveText(['Write code', 'Make tests pass'])

    // delete one incomplete item (the first one)
    await todos.first().hover()
    await todos.first().locator('.destroy').click()

    // confirm the one remaining item
    await expect(todos).toHaveCount(items.length - 2)
    await expect(todos).toHaveText('Make tests pass')
  })
})
