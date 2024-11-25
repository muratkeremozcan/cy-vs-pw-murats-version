// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')

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

    const labels = items.map((item) => item.title)

    await expect(todoLabels).toHaveCount(items.length)
    await expect(todoLabels).toHaveText(labels)

    await expect(count).toHaveText(String(items.length))

    await todos.first().locator('.toggle').click()
    await expect(todos.first()).toHaveClass(/completed/)

    await expect(todos.nth(1)).not.toHaveClass(/completed/)
    await expect(todos.nth(2)).not.toHaveClass(/completed/)

    await expect(todos).toHaveClass(['todo completed', 'todo', 'todo'])

    await expect(count).toHaveText(String(items.length - 1))

    await expect(
      page.getByRole('button', { name: 'Clear completed' }),
    ).toBeVisible()
  })
})
