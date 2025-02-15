// this test is simply blasphemous..

import { test, type Page, expect } from '@playwright/test'
const todos = require('../fixtures/three.json')
// const isCI = require('is-ci')

// confirm there are more than 1 todos
expect(todos.length, 'number of todos').toBeGreaterThan(1)

test.describe.configure({ mode: 'serial' })

test.describe('serial run', () => {
  // if (isCI) {
  //   test.skip(true, 'Skipping serial tests in CI environment')
  // }
  // reuse the same page for all tests
  let page: Page

  test.beforeAll(async ({ browser, request }) => {
    page = await browser.newPage()
    await request.post('/reset', { data: { todos } })
  })

  test.afterAll(async () => {
    // do not forget to clean up
    await page.close()
  })

  test('shows the list of todos', async () => {
    await page.goto('/')
    // confirm the number of todos shown
    await expect(page.locator('.todo')).toHaveCount(todos.length)
    // confirm the all todos are active (do not have class completed)
    await expect(page.locator('.todo:not(.completed)')).toHaveCount(
      todos.length - 1,
    )
    // there should be no completed todos
    await expect(page.locator('.todo.completed')).toHaveCount(todos.length - 2)
  })

  test('completes the first todo', async () => {
    // find the first todo and click on its ".toggle" button
    await page.locator('.todo .toggle').first().click()
    // the first todo should get the class "completed"
    await expect(page.locator('.todo').first()).toHaveClass(/completed/)
  })

  test('clears completed todos', async () => {
    // click on the button with the text "Clear completed"
    await page.getByText('Clear completed').click()
    // the number of todos should go down by 1
    await expect(page.locator('.todo')).toHaveCount(todos.length - 2)
    // there should be no completed todos
    await expect(page.locator('.todo.completed')).toHaveCount(0)
  })
})
