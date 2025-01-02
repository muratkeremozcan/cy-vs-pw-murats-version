/* eslint-disable @typescript-eslint/no-explicit-any */
import { test as base } from '@playwright/test'
import {
  spyOn as spyOnOriginal,
  stubMethod as stubMethodOriginal,
} from '../utils/spy-stub-helper'

type SpyOnFn = (objectName: string, method: string) => Promise<any[]>
type StubMethodFn = (
  objectName: string,
  method: string,
  implementation?: (...args: any[]) => any,
) => Promise<any[]>

// Extend the base test with our custom fixture
const test = base.extend<{
  spyOn: SpyOnFn
  stubMethod: StubMethodFn
}>({
  spyOn: async ({ page }, use) => {
    const spyOnFn: SpyOnFn = (objectName, method) =>
      spyOnOriginal(page, objectName, method)
    await use(spyOnFn)
  },

  stubMethod: async ({ page }, use) => {
    const stubMethod: StubMethodFn = (objectName, method, implementation) =>
      stubMethodOriginal(page, objectName, method, implementation)
    await use(stubMethod)
  },
})

export { test }

/*
We can have a base fixtures file and we can extend it

// fixtures.ts
import { mergeTests } from '@playwright/test';
import { test as baseTest } from './base-fixtures';
import { test as authTest } from './auth-fixtures';
import { test as apiTest } from './api-fixtures';

const test = mergeTests(baseTest, authTest, apiTest);

export { test };
*/
