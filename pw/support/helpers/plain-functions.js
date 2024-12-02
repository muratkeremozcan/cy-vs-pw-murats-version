/**
 * Resets the database and navigates to the app's home page.
 * @param {Object} params - The parameters for the function.
 * @param {import('@playwright/test').Page} params.page - The Playwright page object.
 * @param {import('@playwright/test').APIRequestContext} params.request - The Playwright request object.
 * @param {Object} params.data - The data to reset the database with.
 */
export async function resetAndVisit({ page, request, data }) {
  await request.post('/reset', { data: { todos: data } })
  await page.goto('/')
  await page.locator('body.loaded').waitFor()
}
