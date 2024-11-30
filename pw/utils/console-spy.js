/**
 * Sets up a spy on a specified console method within the page context.
 * Captures all messages into an array for later assertions.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {'log' | 'error' | 'warn' | 'info' | 'debug'} method - The console method to spy on.
 * @returns {Promise<Array<any>>} - An array to store captured messages.
 */
export async function spyOnConsole(page, method = 'log') {
  const messages = []

  // Expose a function to the page that pushes console arguments into the messages array
  await page.exposeFunction(`${method}Call`, (...args) => {
    messages.push(args)
  })

  // Inject a script to override the specified console method and call the exposed function
  await page.addInitScript((method) => {
    const originalMethod = console[method].bind(console)
    console[method] = (...args) => {
      originalMethod(...args)
      window[`${method}Call`](...args)
    }
  }, method)

  return messages
}
