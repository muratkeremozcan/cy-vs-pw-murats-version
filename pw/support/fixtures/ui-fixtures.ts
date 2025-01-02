import { test as base } from '@playwright/test'
import { resetAndVisit as resetAndVisitOriginal } from '../ui-helpers/reset-and-visit'
import { addTodo as addTodoOriginal } from '../ui-helpers/add-todo'
import type { Todo } from '../../../@types/todo'

type AddTodoFn = (todo: string) => ReturnType<typeof addTodoOriginal>
type ResetAndVisitFn = (
  data: Todo[],
) => ReturnType<typeof resetAndVisitOriginal>

type Methods = {
  addTodo: AddTodoFn
  resetAndVisit: ResetAndVisitFn
}

// Extend the base test with our custom fixture
export const test = base.extend<Methods>({
  // Define the resetAndVisit fixture
  resetAndVisit: async ({ page, request }, use) => {
    // Define the function without needing to pass page and request
    const resetAndVisitFn: ResetAndVisitFn = (data) =>
      resetAndVisitOriginal({ page, request, data })
    // Make the function available in the test
    await use(resetAndVisitFn)
  },

  addTodo: async ({ page }, use) => {
    const addTodoFn = (todo: string) => addTodoOriginal(page, todo)

    await use(addTodoFn)
  },
})

/*
We can have a base fixtures file and we can extend it

// fixtures.js
const { mergeTests } = require('@playwright/test');
const { test: baseTest } = require('./base-fixtures');
const { test: authTest } = require('./auth-fixtures');
const { test: apiTest } = require('./api-fixtures');

const test = mergeTests(baseTest, authTest, apiTest);

module.exports = { test };
*/
