// @ts-check
const { test, expect } = require('@playwright/test')
const { interceptNetworkCall } = require('../support/utils/network')

test.describe('App', () => {
  test('responds with the same data on posting new item', async ({ page }) => {
    await page.goto('/')
    await page.locator('.loaded').waitFor()

    // spy on the "POST /todos" call
    const post = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/todos'),
    )
    // enter a new todo "Test"
    await page.locator('input.new-todo').fill('A task')
    await page.locator('input.new-todo').press('Enter')

    // wait for the POST call to happen
    // get the send data and the response data
    // and confirm they are the same
    const request = await post
    const response = await request.response()
    const requestJson = await request.postDataJSON()
    const responseJson = await response?.json()
    expect(requestJson).toEqual(responseJson)
  })

  test('network helpers version - responds with the same data on posting new item', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('.loaded').waitFor()

    // spy on the "POST /todos" call
    const post = interceptNetworkCall({
      method: 'POST',
      url: '/todos',
      page,
    })
    // enter a new todo "Test"
    await page.locator('input.new-todo').fill('A task')
    await page.locator('input.new-todo').press('Enter')

    // wait for the POST call to happen
    // get the send data and the response data
    // and confirm they are the same
    const { data: responseJson, requestJson } = await post
    expect(requestJson).toEqual(responseJson)
  })
})
