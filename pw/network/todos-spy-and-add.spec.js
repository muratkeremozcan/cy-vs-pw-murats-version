// @ts-check
const { test, expect } = require('@playwright/test')
const { interceptNetworkCall } = require('../support/utils/network')

test.describe('App', () => {
  // let loadSpy // is it really needed?
  test.beforeEach(async ({ page }) => {
    // intercept the route "/todos"
    // - "GET /todos" respond with an empty list
    // - otherwise let the request continue
    page.route('/todos', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([]),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/')
    await page.locator('.loaded').waitFor()
    await expect(page.locator('.todo-list li')).toHaveCount(0)
  })

  test('shows the items with css class', async ({ page }) => {
    // spy on the "POST /todos" call
    const postTodo = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/todos'),
    )

    // add an item
    await page.locator('.new-todo').fill('Learn testing')
    await page.locator('.new-todo').press('Enter')

    // confirm the new todo was sent over the network
    const request = await postTodo
    const response = await request.response()
    // get the request data and confirm the known properties "title" and "completed"
    // confirm the request body includes the property "id", as string
    expect(request.postDataJSON()).toEqual({
      title: 'Learn testing',
      completed: false,
      id: expect.any(String),
    })
    // confirm the server responds with status code 201
    expect(response?.status()).toBe(201)
  })

  test('network helpers version -shows the items with css class', async ({
    page,
  }) => {
    const postTodo = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
      page,
    })

    // add an item
    await page.locator('.new-todo').fill('Learn testing')
    await page.locator('.new-todo').press('Enter')

    // confirm the new todo was sent over the network
    const { request, response } = await postTodo
    // get the request data and confirm the known properties "title" and "completed"
    // confirm the request body includes the property "id", as string
    expect(request?.postDataJSON()).toEqual({
      title: 'Learn testing',
      completed: false,
      id: expect.any(String),
    })

    // confirm the server responds with status code 201
    expect(response?.status()).toBe(201)
  })
})
