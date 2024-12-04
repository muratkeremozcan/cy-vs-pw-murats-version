// @ts-check

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

/**
 * Simplified helper for making API requests and returning the status and JSON body.
 * This helper automatically performs the request based on the provided method, URL, and body.
 * It checks the response status and returns the parsed JSON body along with the status code.
 *
 * @param {Object} params - The parameters for the request.
 * @param {import('@playwright/test').APIRequestContext} params.request - The Playwright request object, used to make the HTTP request.
 * @param {string} params.method - The HTTP method to use (POST, GET, PUT, DELETE).
 * @param {string} params.url - The URL to send the request to.
 * @param {Object} [params.body=null] - The body to send with the request (for POST and PUT requests).
 * @returns {Promise<{ status: number, body: any }>} - An object containing the status code and the parsed response body.
 *    - `status`: The HTTP status code returned by the server.
 *    - `body`: The parsed JSON response body from the server.
 */
export async function apiRequest({ request, method, url, body = null }) {
  let response

  // Make the request based on the method
  switch (method.toUpperCase()) {
    case 'POST':
      response = await request.post(url, { data: body })
      break
    case 'GET':
      response = await request.get(url)
      break
    case 'PUT':
      response = await request.put(url, { data: body })
      break
    case 'DELETE':
      response = await request.delete(url)
      break
    default:
      throw new Error(`Unsupported HTTP method: ${method}`)
  }

  const bodyJson = await response.json()
  const status = response.status()

  return { status, body: bodyJson }
}
