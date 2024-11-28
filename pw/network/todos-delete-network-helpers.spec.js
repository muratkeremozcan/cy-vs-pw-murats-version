// @ts-check
const { test, expect } = require('@playwright/test')
const { interceptNetworkCall } = require('../utils/network')

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load the todos
    await page.locator('.loaded').waitFor()
  })

  test('deletes a todo', async ({ page }) => {
    const title = 'Advance ' + Math.round(Math.random() * 1e6)

    // spy on the "POST /todos" network call
    const postTodo = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
      page,
    })

    // enter the new todo with a random title
    await page.locator('input.new-todo').fill(title)
    await page.locator('input.new-todo').press('Enter')

    // wait for the post call and get the todo item id
    const {
      data: { id },
    } = await postTodo

    // spy on the "DELETE /todos/:id" network call
    const deleteTodo = interceptNetworkCall({
      method: 'DELETE',
      url: `/todos/${id}`,
      page,
    })

    // find the newly entered todo item
    // and click on the delete button
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
