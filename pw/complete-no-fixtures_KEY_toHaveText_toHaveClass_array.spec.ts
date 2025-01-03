import type { Todo } from '../@types/todo'
import { test, expect } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')

test.describe('Complete todos', () => {
  test.beforeEach(async ({ request, page }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await page.locator('body.loaded').waitFor()
  })

  test('completes a todo', async ({ page }) => {
    const todos = page.locator('.todo-list li')
    const todoLabels = todos.locator('label')
    const count = page.locator('[data-cy="remaining-count"]')

    // confirm the item labels
    const labels = items.map((item) => item.title)
    expect(todoLabels).toHaveCount(items.length)
    expect(todoLabels).toHaveText(labels)

    // confirm the "2" todos remaining is shown
    await expect(count).toHaveText(String(items.length - 1))

    // complete the first item by clicking its toggle element
    await todos.first().locator('.toggle').click()

    // confirm completed vs not completed
    await expect(todos.first()).toHaveClass(/completed/)
    await expect(todos.nth(1)).toHaveClass(/completed/)
    await expect(todos.nth(2)).not.toHaveClass(/completed/)

    // confirm classes for all 3 elements at once
    await expect(todos).toHaveClass([
      'todo completed',
      'todo completed',
      'todo',
    ])

    // confirm there is 1 remaining items
    await expect(count).toHaveText(String(items.length - 2))
    // and that we can clear the completed items button appears
    await expect(
      page.getByRole('button', { name: 'Clear completed ' }),
    ).toBeVisible()
  })
})
