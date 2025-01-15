import { test } from '../support/fixtures'

test.describe('App', () => {
  test('shows a loader', async ({ page }) => {
    // intercept the "/todos" call
    // and delay it by 2 seconds before
    // allowing it to continue to the server
    await page.route('./todos', (route) =>
      setTimeout(() => route.continue(), 2000),
    )

    // spy on the "/todos" network call
    const loading = page.waitForResponse('/todos')

    await page.goto('/')

    // confirm the loading element is visible
    await page.locator('.loading').waitFor({ state: 'visible' })
    // confirm the "/todos" call has happened
    await loading
    // confirm loading element becomes hidden
    await page.locator('.loading').waitFor({ state: 'hidden' })

    // confirm the app finishes loading
  })
})
