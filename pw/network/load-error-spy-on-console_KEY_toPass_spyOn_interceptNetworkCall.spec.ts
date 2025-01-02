import { test, expect } from '../support/fixtures'

test.describe('App', () => {
  test('logs a server error', async ({ page }) => {
    // stub the "GET /todos" route and return
    // an object with status code 500
    // and the body "server error"
    // spy on the "GET /todos" resource
    await page.route('/todos', (route) =>
      route.fulfill({
        status: 500,
        body: 'server error',
      }),
    )
    const load = page.waitForResponse('/todos')

    // set up an array to collect all text the app
    // prints using "console.error()" method
    // https://playwright.dev/docs/api/class-consolemessage
    const errorMessages: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text())
      }
    })

    // visit the page
    await page.goto('/')
    // and wait for the "GET /todos" call
    await load

    // retry checking the error messages array
    // to find the message "server error"
    // that the application should print when it receives
    // an error response from the backend
    await expect(() => expect(errorMessages).toContain('server error')).toPass()
  })

  test('network console-spy helpers version - logs a server error', async ({
    page,
    spyOn,
    interceptNetworkCall,
  }) => {
    // Stub the "GET /todos" route and return an object with status code 500
    const load = interceptNetworkCall({
      method: 'GET',
      url: '/todos',
      fulfillResponse: {
        status: 500,
        body: 'server error',
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    })

    // Set up a spy on console.error using the helper
    const errorMessages = await spyOn('console', 'error')

    // Visit the page
    await page.goto('/')
    await load

    // retry checking the error messages array
    // to find the message "server error"
    // that the application should print when it receives
    // an error response from the backend
    // with spyOn utility, errorMessages comes in as an array of arrays, we need to flatten it
    await expect(() =>
      expect(errorMessages.flat()).toContain('server error'),
    ).toPass()
  })
})
