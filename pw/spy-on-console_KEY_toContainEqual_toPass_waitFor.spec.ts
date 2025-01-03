import { test, expect } from './support/fixtures'

test.describe('App', () => {
  test('spyOn helper version - prints the load start message', async ({
    page,
    spyOn,
  }) => {
    // Initialize the console log spy
    const log = await spyOn('console', 'log')

    // Visit the application page
    await page.goto('/')

    // Wait for any asynchronous operations if necessary
    await page.locator('.loaded').waitFor()

    // Assert that the log array includes the expected arguments
    await expect(() =>
      expect(log).toContainEqual(['loadTodos start, delay is %d', 0]),
    ).toPass()
  })

  test('prints the load start message', async ({ page }) => {
    const log: string[] = []
    // create a function in the application's "window" object
    // called "logCall" which simply pushes its argument
    // into the "log" array
    // Read "Verifying API calls"
    // https://playwright.dev/docs/mock-browser-apis
    await page.exposeFunction('logCall', (arg: string) => log.push(arg))

    // inject the initial script into the application
    // that overwrites the "console.log" method
    // the overwrite should:
    // - call the real "console.log" method
    // - call the "logCall" function to pass the arguments
    await page.addInitScript(() => {
      const realLog = console.log.bind(console)
      console.log = (...args) => {
        realLog(...args)
        // @ts-ignore
        window.logCall(args)
      }
    })

    // visit the application page
    await page.goto('/')

    // confirm the "log" array includes the following arguments
    // ['loadTodos start, delay is %d', 0]
    await expect(() =>
      expect(log).toContainEqual(['loadTodos start, delay is %d', 0]),
    ).toPass()
  })
})
