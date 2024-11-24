// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Complete todos', () => {
  test.beforeEach(async ({ request, page }) => {
    await request.post('/reset', { data: { todos: [] } })
    await page.goto('/')
    await page.locator('body.loaded').waitFor()
  })

  test('completes a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    const todos = page.locator('.todo-list li')
    const todoLabels = todos.locator('label')
    const count = page.locator('[data-cy="remaining-count"]')

    await input.fill('Write code')
    await input.press('Enter')
    await input.fill('Write tests')
    await input.press('Enter')
    await input.fill('Make tests pass')
    await input.press('Enter')

    await expect(todoLabels).toHaveText([
      'Write code',
      'Write tests',
      'Make tests pass',
    ])

    await expect(count).toHaveText('3')

    await todos.first().locator('.toggle').click()
    await expect(todos.first()).toHaveClass(/completed/)

    await expect(todos.nth(1)).not.toHaveClass(/completed/)
    await expect(todos.nth(2)).not.toHaveClass(/completed/)

    await expect(todos).toHaveClass(['todo completed', 'todo', 'todo'])

    await expect(count).toHaveText('2')

    await expect(
      page.getByRole('button', { name: 'Clear completed' }),
    ).toBeVisible()
  })
})
