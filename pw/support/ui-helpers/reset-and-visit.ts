import type { Page, APIRequestContext } from '@playwright/test'
import type { Todo } from '../../../@types/todo'

type ResetAndVisitParams = {
  page: Page
  request: APIRequestContext
  data: Todo[]
}

/**
 * Resets the database and navigates to the app's home page.
 *
 * @param params - The parameters for the function.
 * @param params.page - The Playwright page object.
 * @param params.request - The Playwright request object.
 * @param params.data - The data to reset the database with.
 */
export async function resetAndVisit({
  page,
  request,
  data,
}: ResetAndVisitParams): Promise<void> {
  await request.post('/reset', { data: { todos: data } })
  await page.goto('/')
  await page.locator('body.loaded').waitFor()
}
