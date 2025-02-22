import type { Todo } from '../@types/todo'
import { test, expect } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')

// this is pretty yucky...

test.describe('App', () => {
  test.beforeEach(async ({ request }) => {
    // confirm there are several items
    // and some are completed and some are not
    expect(items.length, 'number of items').toBeGreaterThan(0)
    expect(items.some((item) => item.completed)).toBeTruthy()
    expect(items.some((item) => !item.completed)).toBeTruthy()
    await request.post('/reset', { data: { todos: items } })
  })

  test('shows items', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')
    const count = page.locator('[data-cy="remaining-count"]')

    await page.goto('/')

    await test.step(`shows ${items.length} items`, async () => {
      await expect(todos).toHaveCount(items.length)
    })

    await test.step('check each item', async () => {
      for (const [k, item] of items.entries()) {
        const itemLocator = todos.nth(k)
        await expect(itemLocator.locator('label')).toHaveText(item.title)
        if (item.completed) {
          await expect(itemLocator).toHaveClass(/completed/)
        } else {
          await expect(itemLocator).not.toHaveClass(/completed/)
        }
      }
    })

    const n = items.filter((item) => !item.completed).length
    await test.step(`remaining count ${n}`, async () => {
      await expect(count).toHaveText(String(n))
    })
  })
})
