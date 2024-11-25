// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')

/**
 * Composes asynchronous functions, passing the same 'page' argument to each function in sequence.
 * Each function receives 'page' and is executed after the previous one completes.
 * @param {...Function} fns - The asynchronous functions to compose.
 * @returns {Function} A function that takes 'page' and returns a Promise that resolves when all functions have completed.
 */
const asyncPipe =
  (...fns) =>
  (page) =>
    fns.reduce((promise, fn) => promise.then(() => fn(page)), Promise.resolve())

// Helper functions accepting 'page' as an argument
const deleteTodoAtIndex = (index) => async (page) => {
  const todos = page.locator('.todo-list li')
  await todos.nth(index).hover()
  await todos.nth(index).locator('.destroy').click()
}

const verifyTodosCount = (expectedCount) => async (page) => {
  const todos = page.locator('.todo-list li')
  await expect(todos).toHaveCount(expectedCount)
}

const verifyTodosText = (expectedTexts) => async (page) => {
  const todos = page.locator('.todo-list li')
  await expect(todos).toHaveText(expectedTexts)
}

test.describe('App', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/reset', { data: { todos: items } })
  })

  test('deletes items', async ({ page }) => {
    await page.goto('/')
    const todos = page.locator('.todo-list li')
    await expect(todos).toHaveCount(items.length)

    // Pass page to asyncPipe
    await asyncPipe(
      deleteTodoAtIndex(1),
      verifyTodosCount(items.length - 1),
      verifyTodosText(['Write code', 'Make tests pass']),
    )(page)

    await asyncPipe(
      deleteTodoAtIndex(0),
      verifyTodosCount(items.length - 2),
      verifyTodosText(['Make tests pass']),
    )(page)
  })
})
