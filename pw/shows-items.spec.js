// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ request }) => {
    // confirm there are several items
    // and some are completed and some are not
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((item) => item.completed)).toBe(true)
    expect(items.some((item) => !item.completed)).toBe(true)

    await request.post('/reset', { data: { todos: items } })
  })

  test('shows items', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')
    const count = page.locator('[data-cy="remaining-count"]')

    await page.goto('/')

    // shows N items
    await expect(todos).toHaveCount(items.length)

    // go through the items and confirm each is rendered correctly
    // - label text
    // - completed or not
    items.forEach((item, k) => {
      expect(todos.nth(k).locator('label')).toHaveText(item.title)

      if (item.completed) {
        expect(todos.nth(k)).toHaveClass(/completed/)
      } else {
        expect(todos.nth(k)).not.toHaveClass(/completed/)
      }
    })

    // confirm the remaining items count is correct
    const n = items.filter((item) => !item.completed).length
    await expect(count).toHaveText(String(n))
  })
})
