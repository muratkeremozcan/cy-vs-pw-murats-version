// @ts-check
// There is Playwright built-in assertion toHaveCount(n),
// but we don't have the precise number, we just want to confirm the number of items is larger than 2.

const { test } = require('@playwright/test')
const items = require('../fixtures/three.json')
const baseExpect = require('@playwright/test').expect

const expect = baseExpect.extend({
  async toHaveCountAbove(locator, n, options = {}) {
    const assertionName = 'toHaveCountAbove'
    let pass
    let matcherResult

    const count = await locator.count()
    pass = count > n

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: ${this.isNot ? 'not' : ''}${this.utils.printExpected(
            n,
          )}\n` +
          (matcherResult
            ? // @ts-ignore
              `Received: ${this.utils.printReceived(matcherResult.actual)}`
            : '')
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: ${this.utils.printExpected(n)}\n` +
          (matcherResult
            ? // @ts-ignore
              `Received: ${this.utils.printReceived(matcherResult.actual)}`
            : '')

    return {
      message,
      pass,
      name: assertionName,
      n,
      actual: count,
    }
  },
})

test.describe('App ', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
  })

  test('shows more than 2 items at the start', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')

    // the application starts several items
    // assume that we don't know the exact number
    // but we expect more than 2 items

    // solution 1: using custom matcher
    await expect(todos).toHaveCountAbove(2)

    // solution 2: using expect.poll to get the count of items
    await expect
      .poll(async () => (await todos.count()) > 2, {
        message: 'More than 2 items',
        timeout: 4_000,
      })
      .toBeTruthy()

    // solution 3: using expect.toPass and an inner assertion
    await expect(async () => {
      const count = await todos.count()
      expect(count).toBeGreaterThan(2)
    }).toPass()
  })
})
