// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // wait for the page to load the todos
    await page.locator('.loaded').waitFor()
  })

  test('deletes a todo', async ({ page }) => {
    const title = 'Advance ' + Math.round(Math.random() * 1e6)

    // spy on the "POST /todos" network call
    const postTodo = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/todos'),
    )

    // enter the new todo with a random title
    await page.locator('input.new-todo').fill(title)
    await page.locator('input.new-todo').press('Enter')

    // wait for the post call and get the todo item id
    const postRequest = await postTodo
    const postResponse = await postRequest.response()
    const postResponseJson = await postResponse?.json()
    const id = postResponseJson.id

    // spy on the "DELETE /todos/:id" network call
    const deleteTodo = page.waitForRequest(
      (req) => req.method() === 'DELETE' && req.url().endsWith(`/todos/${id}`),
    )

    // find the newly entered todo item
    // and click on the delete button
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
})