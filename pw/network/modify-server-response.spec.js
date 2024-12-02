// @ts-check

const { test, expect } = require('@playwright/test')
const { interceptNetworkCall } = require('../support/utils/network')

test.describe('App', () => {
  test('inserts the first todo', async ({ page }) => {
    const todos = page.locator('.todo-list li')
    const title = 'The first one!'

    // spy on the "GET /todos" network call
    // once the response arrives
    // confirm it is an array
    // and insert a new object at the first position
    // title, completed=false, id="1234"
    // https://playwright.dev/docs/mock
    await page.route('/todos', async (route) => {
      const response = await route.fetch()
      const json = await response.json()
      json.unshift({ title, completed: false, id: '1234' })
      // Fulfill using the original response, while patching the response body
      // with the given JSON object.
      await route.fulfill({ response, json })
    })

    await page.goto('/')
    // confirm there is at least one todo
    // and the first todo element
    // has the title text
    // and has the class "todo"
    // and does not have class "completed"
    await expect(async () => {
      const n = await todos.count()
      expect(n).toBeGreaterThan(0)
      const first = await todos.first()
      expect(first).toHaveText(title)
      expect(first).toHaveClass(/todo/)
      expect(first).not.toHaveClass(/completed/)
    }).toPass()
  })

  test('network helper version - inserts the first todo', async ({ page }) => {
    const todos = page.locator('.todo-list li')
    const title = 'The first one!'

    // Use the helper to intercept and modify the "GET /todos" network call
    await interceptNetworkCall({
      method: 'GET',
      url: '/todos',
      page,
      handler: async (route) => {
        const response = await route.fetch()
        const json = await response.json()
        json.unshift({ title, completed: false, id: '1234' })
        // Fulfill using the original response, while patching the response body
        await route.fulfill({ response, json })
      },
    })

    await page.goto('/')
    // Confirm there is at least one todo
    // and the first todo element
    // has the title text
    // and has the class "todo"
    // and does not have class "completed"
    await expect(async () => {
      const n = await todos.count()
      expect(n).toBeGreaterThan(0)
      const first = todos.first()
      await expect(first).toHaveText(title)
      await expect(first).toHaveClass(/todo/)
      await expect(first).not.toHaveClass(/completed/)
    }).toPass()
  })
})
