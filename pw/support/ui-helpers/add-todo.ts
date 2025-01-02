import type { Page } from '@playwright/test'

export const addTodo = async (page: Page, todo: string) => {
  await page.locator('input.new-todo').fill(todo)
  await page.locator('input.new-todo').press('Enter')
}
