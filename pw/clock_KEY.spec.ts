import { test } from './support/fixtures'

test.describe('App', () => {
  test('fetches todos every 60 seconds', async ({
    page,
    interceptNetworkCall,
  }) => {
    // setup clock
    await page.clock.install()

    // Spy on the "/todos" network requests
    const loadTodos1 = interceptNetworkCall({ url: '/todos', method: 'GET' })
    const loadTodos2 = interceptNetworkCall({ url: '/todos', method: 'GET' })
    const loadTodos3 = interceptNetworkCall({ url: '/todos', method: 'GET' })
    // you can do the shorthand too, but it is not specific to the method
    // const loadTodos1 = page.waitForRequest('/todos')
    // const loadTodos2 = page.waitForRequest('/todos')
    // const loadTodos3 = page.waitForRequest('/todos')

    // Navigate to the application
    await page.goto('/')

    // Wait for the initial "/todos" request
    await page.clock.fastForward(1000)
    await loadTodos1

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    await page.clock.fastForward(61_000)
    await loadTodos2

    // advance the fake timers by 61 seconds
    // and confirm the application fetches the "/todos" endpoint again
    await page.clock.fastForward(61_000)
    await loadTodos3
  })
})
