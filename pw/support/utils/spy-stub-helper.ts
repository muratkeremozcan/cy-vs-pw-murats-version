/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Page} from '@playwright/test'

/**
 * Sets up a spy on a specified method within the page context.
 * Captures all calls to the method into an array for later assertions.
 *
 * @param {Page} page - The Playwright page object.
 * @param {string} objectName - The name of the object to spy on (e.g., 'console').
 * @param {string} method - The method to spy on (e.g., 'log').
 * @returns {Promise<unknown[]>} - A promise that resolves to an array containing the captured calls and their arguments.
 *
 * @example
 * // To spy on console.log:
 * const logMessages = await spyOn(page, 'console', 'log');
 *
 * // Perform actions that trigger console.log in the page context
 * await page.goto('/');
 *
 * // Now, logMessages contains all the arguments passed to console.log
 * console.log(logMessages);
 *
 * @remarks
 * This function works by:
 * 1. Exposing a function (`exposedFunctionName`) to the page context.
 * 2. Injecting a script into the page that overrides the specified method (`objectName[method]`).
 *    - The overridden method calls the original method to maintain normal functionality.
 *    - It then calls the exposed function to pass the arguments back to the Node.js context.
 */
export async function spyOn(
  page: Page,
  objectName: string,
  method: string,
): Promise<unknown[]> {
  const messages: unknown[] = []

  // Create a function in the application's "window" object which pushes its arguments
  const exposedFunctionName = `${objectName}_${method}_spy`
  await page.exposeFunction(exposedFunctionName, (...args: unknown[]) =>
    messages.push(args),
  )

  // Inject the initial script into the application, which overwrites the specified method
  await page.addInitScript(
    ({
      objectName,
      method,
      exposedFunctionName,
    }: {
      objectName: string
      method: string
      exposedFunctionName: string
    }) => {
      const object = (window as any)[objectName] as Record<
        string,
        (...args: any[]) => any
      >

      if (!object || typeof object[method] !== 'function') {
        throw new Error(`Method ${method} not found on object ${objectName}`)
      }

      const originalMethod = object[method].bind(object)

      object[method] = (...args: any[]) => {
        // Call the original method
        originalMethod(...args)
        // Pass the arguments to the exposed function
        ;(window as any)[exposedFunctionName](...args)
      }
    },
    {objectName, method, exposedFunctionName},
  )

  return messages
}

/**
 * Stubs a specified method within the page context.
 * Replaces the method with a stub that can have custom behavior.
 * Captures all calls to the method into an array for later assertions.
 *
 * @param {Page} page - The Playwright page object.
 * @param {string} objectName - The name of the object to stub (e.g., 'console').
 * @param {string} method - The method to stub (e.g., 'log').
 * @param {(args: any[]) => any} [implementation] - Optional custom implementation for the stubbed method.
 * @returns {Promise<Array<any>>} - A promise that resolves to an array containing the captured calls and their arguments.
 */
export async function stubMethod(
  page: Page,
  objectName: string,
  method: string,
  implementation?: (...args: any[]) => any,
): Promise<any[]> {
  const calls: any[] = []

  // Create a function in the Node.js context that will receive the method arguments from the page context
  const exposedFunctionName = `${objectName}_${method}_stub`
  await page.exposeFunction(exposedFunctionName, (...args: any[]) => {
    calls.push(args)
  })

  // Inject a script into the page that replaces the specified method with a stub
  await page.addInitScript(
    ({
      objectName,
      method,
      exposedFunctionName,
      hasCustomImpl,
    }: {
      objectName: string
      method: string
      exposedFunctionName: string
      hasCustomImpl: boolean
    }) => {
      const object = (window as any)[objectName] as Record<
        string,
        (...args: any[]) => any
      >

      if (!object) {
        throw new Error(`Object ${objectName} not found in window`)
      }

      object[method] = (...args: any[]) => {
        // Call the exposed function in the Node.js context to capture the arguments
        ;(window as any)[exposedFunctionName](...args)

        if (hasCustomImpl) {
          // If a custom implementation is provided, call it
          return (window as any)[`customImpl_${exposedFunctionName}`](...args)
        }
        // Default behavior: Do nothing or return undefined
      }
    },
    {
      objectName,
      method,
      exposedFunctionName,
      hasCustomImpl: !!implementation,
    },
  )

  // If a custom implementation is provided, expose it to the page context
  if (implementation) {
    const customImplName = `customImpl_${exposedFunctionName}`
    await page.exposeFunction(customImplName, implementation)
  }

  return calls
}
