import type { Page } from '@playwright/test'
import { test, expect } from '../support/fixtures'
import type { TodoPostResponse } from '../../@types/todo'
const items = require('../../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await page.locator('.loaded').waitFor()
  })

  const addTodo = async (page: Page, todo: string) => {
    await page.locator('input.new-todo').fill(todo)
    await page.locator('input.new-todo').press('Enter')
  }

  test('assigns a different id to each new item', async ({ page }) => {
    // spy on the first call to "POST /todos"
    const routeMatcher = (req: { method: () => string; url: () => string }) =>
      req.method() === 'POST' && req.url().endsWith('/todos')
    const postTodo1 = page.waitForRequest(routeMatcher)

    // add new todo with text "first todo"
    await addTodo(page, 'first todo')

    // get the request id sent by the application
    // from the network call "post-todo", confirm it is a string
    const id1 = (await postTodo1).postDataJSON().id
    expect(id1).toEqual(expect.any(String))

    // spy on the second call to "POST /todos"
    const postTodo2 = page.waitForRequest(routeMatcher)
    // add new todo with text "second todo"
    await addTodo(page, 'second todo')

    // get the request id from the second todo sent by the application
    // confirm it is a string and it is different from the first request
    const id2 = (await postTodo2).postDataJSON().id
    expect(id2).toEqual(expect.any(String))
    expect(id2).not.toEqual(id1)
  })

  test('network helpers version - assigns a different id to each new item', async ({
    page,
    interceptNetworkCall,
  }) => {
    // spy on the first call to "POST /todos"
    const postTodo1 = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
    })

    // add new todo with text "first todo"
    await addTodo(page, 'first todo')

    // get the request id sent by the application
    // from the network call "post-todo", confirm it is a string
    const {
      responseJson: { id: id1 },
    } = (await postTodo1) as TodoPostResponse
    expect(id1).toEqual(expect.any(String))

    // spy on the second call to "POST /todos"
    const postTodo2 = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
    })
    // add new todo with text "second todo"
    await addTodo(page, 'second todo')

    // get the request id from the second todo sent by the application
    // confirm it is a string and it is different from the first request
    const {
      responseJson: { id: id2 },
    } = (await postTodo2) as TodoPostResponse
    expect(id2).not.toEqual(id1)
  })
})
