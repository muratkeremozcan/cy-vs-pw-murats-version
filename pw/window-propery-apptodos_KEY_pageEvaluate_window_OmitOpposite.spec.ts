import type { Todo } from '../@types/todo'
import { test, expect } from './support/fixtures'
const todos: Todo[] = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    await resetAndVisit(todos)
  })
  test('gets the todos from the application', async ({ page }) => {
    // get the list of todos from the application
    // using the "window.appTodos" property
    // @ts-ignore
    // const appTodos = await page.evaluate(() => window.appTodos)
    const appTodos = await page.evaluate(() => window.appTodos)

    // confirm that the todo titles you got from the app
    // are the same as the titles in the loaded todos fixture
    const titles = appTodos.map((t: Todo) => t.title)
    const expectedTitles = todos.map((t: Todo) => t.title)
    expect(titles).toEqual(expectedTitles)

    // confirm that each item in the todos list points at the list
    // via the "list" property
    // the opposite of Omit<Todo, 'list'>  is  Todo & { list: Todo[]}
    appTodos.forEach((todo: Todo & { list: Todo[] }, k: number) => {
      expect(todo.list, `item ${k + 1}`).toEqual(appTodos)
    })
  })
})
