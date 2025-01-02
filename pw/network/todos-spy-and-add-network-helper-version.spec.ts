import type { TodoPostRequest } from '../../@types/todo'
import { test, expect } from '../support/fixtures'

test.describe('App', () => {
  // let loadSpy // is it really needed?
  test.beforeEach(async ({ page, interceptNetworkCall }) => {
    const load = interceptNetworkCall({
      method: 'GET',
      url: '/todos',
      fulfillResponse: {
        status: 200,
        body: [],
      },
    })

    await page.goto('/')
    await page.locator('.loaded').waitFor()
    await expect(page.locator('.todo-list li')).toHaveCount(0)
    await load
  })

  test('shows the items with css class', async ({
    addTodo,
    apiRequest,
    interceptNetworkCall,
  }) => {
    // spy on the "POST /todos" call
    const postTodo = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
    })

    // add an item
    addTodo('Learn testing')
    // confirm the new todo was sent over the network
    const { requestJson, response } = await postTodo

    // get the request data and confirm the known properties "title" and "completed"
    // confirm the request body includes the property "id", as string
    expect(requestJson).toEqual({
      title: 'Learn testing',
      completed: false,
      id: expect.any(String),
    })
    // confirm the server responds with status code 201
    expect(response?.status()).toBe(201)

    // clean up
    const id = (requestJson as TodoPostRequest).id
    await apiRequest({
      method: 'DELETE',
      url: `/todos/${id}`,
    })
  })
})
