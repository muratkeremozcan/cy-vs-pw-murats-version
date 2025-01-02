import { test, expect } from '../support/fixtures'

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
    const load = page.waitForResponse(
      (response) =>
        response.url().includes('/todos') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    await page.goto('/')
    await page.locator('.loaded').waitFor()
    await expect(page.locator('.todo-list li')).toHaveCount(0)
    await load
  })

  test('shows the items with css class', async ({
    page,
    addTodo,
    apiRequest,
  }) => {
    // spy on the "POST /todos" call
    const postTodo = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/todos'),
    )

    // add an item
    addTodo('Learn testing')
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

    // clean up
    const id = request.postDataJSON().id
    await apiRequest({
      method: 'DELETE',
      url: `/todos/${id}`,
    })
  })
})
