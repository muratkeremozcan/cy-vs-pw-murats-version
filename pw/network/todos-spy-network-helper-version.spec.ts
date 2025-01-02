import { test, expect } from '../support/fixtures'
import type { InterceptNetworkCall } from '../support/utils/network'
import type { Todo } from '../../@types/todo'

test.describe('network GET spy - network helpers version', () => {
  let load: InterceptNetworkCall
  test.beforeEach(async ({ page, interceptNetworkCall }) => {
    // spy on the network calls to "/todos" endpoint
    load = interceptNetworkCall({
      method: 'GET',
      url: '/todos',
    })
    await page.goto('/')
  })

  test('shows the same number of items as sent by the server', async ({
    page,
  }) => {
    // confirm the network call has happened and get the response as json
    // confirm the page shows the same number of todo items as sent by the server
    const { data: todos } = await load

    await expect(page.locator('.todo-list li')).toHaveCount(
      (todos as Todo[]).length,
    )
  })
})
