// @ts-check
const { test, expect } = require('@playwright/test')
const R = require('ramda')
const items = require('../fixtures/three.json')

const asyncPipe = R.pipeWith((f, res) => Promise.resolve(res).then(f))

const todosSelector = '.todo-list li'

// curry the page in
const deleteTodoAtIndex = (index) => async (page) => {
  const todos = page.locator(todosSelector)
  await todos.nth(index).hover()
  await todos.nth(index).locator('.destroy').click()
}

const verifyTodosCount = (expectedCount) => async (page) => {
  const todos = page.locator(todosSelector)
  await expect(todos).toHaveCount(expectedCount)
}

const verifyTodosText = (expectedTexts) => async (page) => {
  const todos = page.locator(todosSelector)
  await expect(todos).toHaveText(expectedTexts)
}

test.describe('App', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/reset', { data: { todos: items } })
  })

  test('deletes items', async ({ page }) => {
    const todos = page.locator(todosSelector)
    await page.goto('/')
    await expect(todos).toHaveCount(items.length)

    await asyncPipe(
      deleteTodoAtIndex(1),
      verifyTodosCount(items.length - 1),
      verifyTodosText(['Write code', 'Make tests pass']),
    )()

    await asyncPipe(
      deleteTodoAtIndex(0),
      verifyTodosCount(items.length - 2),
      verifyTodosText(['Make tests pass']),
    )()
  })
})
