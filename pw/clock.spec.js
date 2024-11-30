// @ts-check
/// <reference types="cypress" />

const { test, expect } = require('@playwright/test')

test.describe('App', () => {
  test('fetches todos every 60 seconds', async ({ page, context }) => {
    // setup clock
    const clock = context.clock
    await clock.install()

    // Spy on the "/todos" network requests
    const loadTodos1 = page.waitForRequest('/todos')
    const loadTodos2 = page.waitForRequest('/todos')
    const loadTodos3 = page.waitForRequest('/todos')

    // Navigate to the application
    await page.goto('/')

    // Wait for the initial "/todos" request
    await clock.fastForward(1000)
    await loadTodos1

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    await clock.fastForward(61_000)
    await loadTodos2

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    await clock.fastForward(61_000)
    await loadTodos3
  })

  // use Sinonjs to fake timers in the application's window
  // see https://github.com/microsoft/playwright/issues/6347
  // and https://sinonjs.org/releases/latest/fake-timers/
  test('old version - fetches todos every 60 seconds', async ({ page }) => {
    // inject Sinonjs library from node_modules "sinon"
    // before any of the application's scripts run
    await page.addInitScript({
      path: 'node_modules/sinon/pkg/sinon.js',
    })

    // wrap all "window" timers in fake timers
    // and attach the Sinon timers object to the "window" object
    await page.addInitScript(() => {
      // @ts-ignore
      window.__clock = sinon.useFakeTimers()
    })

    // a little utility function used to advance the fake timers
    // in the application's "window" objects using Sinonjs "tick(ms)"
    const tick = (ms) =>
      page.evaluate((ms) => {
        // @ts-ignore
        window.__clock.tick(ms)
      }, ms)

    // spy on the "/todos" network requests
    const loadTodos1 = page.waitForRequest('/todos')
    const loadTodos2 = page.waitForRequest('/todos')
    const loadTodos3 = page.waitForRequest('/todos')

    await page.goto('/')

    // confirm the application fetches the "/todos" endpoint
    tick(1000)
    await loadTodos1

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    tick(61_000)
    await loadTodos2

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    tick(61_000)
    await loadTodos3
  })
})
