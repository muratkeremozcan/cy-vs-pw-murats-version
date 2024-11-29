// @ts-check
/// <reference types="cypress" />

const { test, expect } = require('@playwright/test')

test.describe('App', () => {
  test('stubs the load data network call three different ways', async ({
    page,
  }) => {
    const todos = page.locator('.todo-list li')

    // stub the "GET /todos" network call
    // on the first call return the data from the "fixtures/one.json" file
    // on the second call return the data from the "fixtures/two.json" file
    // on the third call return the data from the "fixtures/three.json" file
    let k = 0
    await page.route('/todos', (route) => {
      k += 1
      switch (k) {
        case 1:
          return route.fulfill({ path: './fixtures/one.json' })
        case 2:
          return route.fulfill({ path: './fixtures/two.json' })
        default:
          return route.fulfill({ path: './fixtures/three.json' })
      }
    })
    // load the page
    // and confirm only 1 todo is shown
    await page.goto('/')
    await expect(todos).toHaveCount(1)
    // reload the page
    // confirm there are 2 todos
    await page.reload()
    await expect(todos).toHaveCount(2)
    // reload the page
    // confirm there are 3 todos
    await page.reload()
    await expect(todos).toHaveCount(3)
    // reload the page one more time
    // and confirm the 3 todos are still there
    await page.reload()
    await expect(todos).toHaveCount(3)
  })
})
