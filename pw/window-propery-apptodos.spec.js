// @ts-check
const { test, expect } = require('@playwright/test')
const todos = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/reset', { data: { todos } })
    await page.goto('/')
    await expect(await page.locator('.todo').count()).toBe(3)
  })
  test('gets the todos from the application', async ({ page, request }) => {
    // get the list of todos from the application
    // using the "window.appTodos" property
    // @ts-ignore
    const appTodos = await page.evaluate(() => window.appTodos)

    // confirm that the todo titles you got from the app
    // are the same as the titles in the loaded todos fixture
    const titles = appTodos.map((t) => t.title)
    const expectedTitles = todos.map((t) => t.title)
    expect(titles).toEqual(expectedTitles)

    // confirm that each item in the todos list points at the list
    // via the "list" property
    appTodos.forEach((todo, k) => {
      expect(todo.list, `item ${k + 1}`).toEqual(appTodos)
    })
  })
})
