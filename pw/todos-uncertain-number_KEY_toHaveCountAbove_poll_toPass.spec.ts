// @ts-check
// There is Playwright built-in assertion toHaveCount(n),
// but we don't have the precise number, we just want to confirm the number of items is larger than 2.

import type { Todo } from '../@types/todo'
import type { Locator } from '@playwright/test'
import { test } from './support/fixtures'
const items: Todo[] = require('../fixtures/three.json')
const baseExpect = require('@playwright/test').expect

test.describe('App ', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/reset', { data: { todos: items } })
    await page.goto('/')
    await page.locator('.loaded').waitFor()
  })

  test('shows more than 2 items at the start - easy version', async ({
    page,
  }) => {
    // common locators
    const todos = page.locator('.todo-list li')

    expect(await todos.count()).toBeGreaterThan(2)
  })

  // WHY TRY SO HARD?
  test('shows more than 2 items at the start', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')

    // assume that we don't know the exact number but we expect more than 2 items

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

const expect = baseExpect.extend({
  async toHaveCountAbove(locator: Locator, n: number) {
    const assertionName = 'toHaveCountAbove'
    let matcherResult

    const count = await locator.count()
    const pass = count > n

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
