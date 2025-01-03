import type { Todo } from '../@types/todo'
import { test, expect } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    await resetAndVisit(items)
  })
  test('uses ADD_TODO mutation', async ({ page, interceptNetworkCall }) => {
    // the Vuex store used inside the application
    // calls a mutation to add new Todo to the store
    // ADD_TODO(state, todoObject) {
    //   state.todos.push(todoObject)
    // },
    // Can you access the mutations in the store
    // and spy on the ADD_TODO mutation?
    // Note: the list of mutations for ADD_TODO is an array
    await page.evaluate(() => {
      // @ts-ignore
      const ADD_TODO = window.app.$store._mutations.ADD_TODO
      // confirm the list of ADD_TODO mutations has 1 element
      if (ADD_TODO.length !== 1) {
        throw new Error('Expected 1 ADD_TODO mutation')
      }
      // spy on the first mutation and give it an alias "addTodo"
      // store all arguments in an array "window.addTodoArgs"
      // @ts-ignore
      window.addTodoArgs = []
      const fn = ADD_TODO[0]
      ADD_TODO[0] = (...args: any) => {
        // @ts-ignore
        window.addTodoArgs.push(args)
        return fn(...args)
      }
    })

    const postTodo = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
    })
    // type the todo "a test" into the input element
    // confirm the "a test" todo appears on the page
    await page.locator('.new-todo').fill('a test')
    await page.locator('.new-todo').press('Enter')
    await postTodo
    await page.locator('li.todo', { hasText: 'a test' })

    // get the "addTodo" spy and confirm it was called
    // with expected argument object
    // Question: you know the title and the completed property
    // but how do you know the ID?
    // @ts-ignore
    await page.waitForFunction(() => window.addTodoArgs.length > 0)
    // @ts-ignore
    const args = await page.evaluate(() => window.addTodoArgs[0])
    expect(args, 'ADD_TODO argument').toEqual([
      {
        completed: false,
        title: 'a test',
        id: expect.any(String),
      },
    ])
  })
})
