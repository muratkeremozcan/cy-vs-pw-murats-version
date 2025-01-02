import type { TodoPostResponse } from '../../@types/todo'
import { test, expect } from '../support/fixtures'

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('.loaded').waitFor()
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  })

  test('deletes a todo', async ({ page, addTodo }) => {
    const title = 'Advance ' + Math.round(Math.random() * 1e6)

    // spy on the "POST /todos" network call
    const postTodo = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/todos'),
    )

    // enter the new todo with a random title
    addTodo(title)

    // wait for the post call and get the todo item id
    const postRequest = await postTodo
    const postResponse = await postRequest.response()
    const postResponseJson = await postResponse?.json()
    const id = postResponseJson.id

    // spy on the "DELETE /todos/:id" network call
    const deleteTodo = page.waitForRequest(
      (req) => req.method() === 'DELETE' && req.url().endsWith(`/todos/${id}`),
    )

    // find the newly entered todo item and click on the delete button
    const todoElement = await page.locator('li.todo', { hasText: title })
    await todoElement.hover()
    await todoElement.locator('.destroy').click()

    // confirm the delete network call happens
    // and the server responded with the status code 200
    const deleteRequest = await deleteTodo
    const deleteResponse = await deleteRequest.response()
    const deleteResponseStatus = await deleteResponse?.status()
    expect(deleteResponseStatus).toBe(200)

    // confirm the new todo is no longer on the page
    await expect(todoElement).not.toBeAttached()
  })

  test('network helpers version - deletes a todo', async ({
    page,
    interceptNetworkCall,
    addTodo,
  }) => {
    const title = 'Advance ' + Math.round(Math.random() * 1e6)

    // spy on the "POST /todos" network call
    const postTodo = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
    })

    // enter the new todo with a random title
    addTodo(title)

    // wait for the post call and get the todo item id
    const {
      data: { id },
    } = (await postTodo) as TodoPostResponse

    // spy on the "DELETE /todos/:id" network call
    const deleteTodo = interceptNetworkCall({
      method: 'DELETE',
      url: `/todos/${id}`,
    })

    // find the newly entered todo item, and click on the delete button
    const todoElement = await page.locator('li.todo', { hasText: title })
    await todoElement.hover()
    await todoElement.locator('.destroy').click()

    // confirm the delete network call happens
    // and the server responded with the status code 200
    const { status } = await deleteTodo
    expect(status).toBe(200)

    // confirm the new todo is no longer on the page
    await expect(todoElement).not.toBeAttached()
  })
})
