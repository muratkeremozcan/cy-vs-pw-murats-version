// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../fixtures/three.json')
const { resetAndVisit } = require('./support/ui-helpers/reset-and-visit')

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
  test.beforeEach(async ({ page, request }) => {
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    // plain function version (not using fixture) needs to pass in page and request
    await resetAndVisit({ page, request, data: items })
  })

  test('deletes items', async ({ page }) => {
    const todos = page.locator('.todo-list li')
    await expect(todos).toHaveCount(items.length)

    await asyncPipe(
      deleteTodoAtIndex(1),
      verifyTodosCount(items.length - 1),
      verifyTodosText(['Write code $1', 'Make tests pass $59']),
    )(page)

    await asyncPipe(
      deleteTodoAtIndex(0),
      verifyTodosCount(items.length - 2),
      verifyTodosText(['Make tests pass $59']),
    )(page)
  })
})
