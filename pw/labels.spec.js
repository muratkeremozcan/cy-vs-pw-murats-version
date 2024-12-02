// @ts-check
const { test, expect } = require('./support/fixtures')
const items = require('../fixtures/three.json')

test.describe('App', () => {
  test.beforeEach(async ({ resetAndVisit }) => {
    await resetAndVisit(items)
  })

  test('shows the right labels', async ({ page }) => {
    // common locators
    const todos = page.locator('.todo-list li')
    // the application starts with 3 items
    await expect(todos).toHaveCount(3)

    // get the label from each item
    // and confirm the todos elements have the right text
    const labels = items.map((item) => item.title)

    // confirm the todo elements have the labels
    // from the fixture file
    await expect(todos).toHaveText(labels)
  })
})
