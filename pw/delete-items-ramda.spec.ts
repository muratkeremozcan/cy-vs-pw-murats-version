import type { Page } from '@playwright/test'
import { test, expect } from './support/fixtures'
const items = require('../fixtures/three.json')

/**
 * Composes asynchronous functions, passing the same 'page' argument to each function in sequence.
 * Each function receives 'page' and is executed after the previous one completes.
 * @param {...Function} fns - The asynchronous functions to compose.
 * @returns {Function} A function that takes 'page' and returns a Promise that resolves when all functions have completed.
 */
const asyncPipe =
  (...fns: any[]) =>
  (page: Page) =>
    fns.reduce((promise, fn) => promise.then(() => fn(page)), Promise.resolve())

// Helper functions accepting 'page' as an argument
const deleteTodoAtIndex = (index: number) => async (page: Page) => {
  const todos = page.locator('.todo-list li')
  await todos.nth(index).hover()
  await todos.nth(index).locator('.destroy').click()
}

const verifyTodosCount = (expectedCount: number) => async (page: Page) => {
  const todos = page.locator('.todo-list li')
  await expect(todos).toHaveCount(expectedCount)
}

const verifyTodosText = (expectedTexts: string[]) => async (page: Page) => {
  const todos = page.locator('.todo-list li')
  await expect(todos).toHaveText(expectedTexts)
}

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await resetAndVisit(items)
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
