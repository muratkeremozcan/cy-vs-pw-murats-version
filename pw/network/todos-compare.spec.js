// @ts-check
const { test, expect } = require('@playwright/test')
const items = require('../../fixtures/three.json')
const { interceptNetworkCall } = require('../support/utils/network')

test.describe('App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await page.locator('.loaded').waitFor()
  })

  test('assigns a different id to each new item', async ({ page }) => {
    // spy on the first call to "POST /todos"
    const routeMatcher = (req) =>
      req.method() === 'POST' && req.url().endsWith('/todos')
    const postTodo1 = page.waitForRequest(routeMatcher)

    // add new todo with text "first todo"
    await page.locator('input.new-todo').fill('first todo')
    await page.locator('input.new-todo').press('Enter')

    // get the request id sent by the application
    // from the network call "post-todo"
    // confirm it is a string
    const id1 = (await postTodo1).postDataJSON().id
    expect(id1).toEqual(expect.any(String))

    // spy on the second call to "POST /todos"
    const postTodo2 = page.waitForRequest(routeMatcher)
    // add new todo with text "second todo"
    await page.locator('input.new-todo').fill('second todo')
    await page.locator('input.new-todo').press('Enter')

    // get the request id from the second todo
    // sent by the application
    // confirm it is a string
    // and it is different from the first request
    const id2 = (await postTodo2).postDataJSON().id
    expect(id2).toEqual(expect.any(String))
    expect(id2).not.toEqual(id1)
  })

  test('network helpers version - assigns a different id to each new item', async ({
    page,
  }) => {
    // spy on the first call to "POST /todos"
    const postTodo1 = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
      page,
    })

    // add new todo with text "first todo"
    await page.locator('input.new-todo').fill('first todo')
    await page.locator('input.new-todo').press('Enter')

    // get the request id sent by the application
    // from the network call "post-todo"
    // confirm it is a string
    const {
      data: { id: id1 },
    } = await postTodo1
    expect(id1).toEqual(expect.any(String))

    // spy on the second call to "POST /todos"
    const postTodo2 = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
      page,
    })
    // add new todo with text "second todo"
    await page.locator('input.new-todo').fill('second todo')
    await page.locator('input.new-todo').press('Enter')

    // get the request id from the second todo
    // sent by the application
    // confirm it is a string
    // and it is different from the first request
    const {
      data: { id: id2 },
    } = await postTodo2
    expect(id2).toEqual(expect.any(String))
    expect(id2).not.toEqual(id1)
  })
})
