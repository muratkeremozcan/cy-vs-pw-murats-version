// support/utils/network.js

/**
 * @typedef {import('@playwright/test').Page} Page
 * @typedef {import('@playwright/test').Request} Request
 * @typedef {import('@playwright/test').Response} Response
 * @typedef {import('@playwright/test').Route} Route
 */
import picomatch from 'picomatch'

/**
 * @typedef {Object} FulfillResponse
 * @property {number} [status] - HTTP status code.
 * @property {Record<string, string>} [headers] - HTTP headers.
 * @property {unknown} [body] - Can be string, Buffer, or object.
 */

/**
 * @typedef {Object} PreparedResponse
 * @property {number} [status] - HTTP status code.
 * @property {Record<string, string>} [headers] - HTTP headers.
 * @property {string|Buffer} [body] - Response body as string or Buffer.
 */

/**
 * @typedef {Object} InterceptOptions
 * @property {string} [method] - HTTP method to intercept (e.g., 'GET', 'POST').
 * @property {string} [url] - URL pattern to intercept.
 * @property {Page} page - Playwright Page instance.
 * @property {FulfillResponse} [fulfillResponse] - Response details to fulfill the request.
 * @property {(route: Route, request: Request) => Promise<void> | void} [handler] - Custom handler for the route.
 */

/**
 * @typedef {Object} NetworkCallResult
 * @property {Request|null} request - The intercepted request.
 * @property {Response|null} response - The intercepted response.
 * @property {unknown} data - Parsed response data.
 * @property {number} status - HTTP status code of the response.
 * @property {unknown} requestJson - Parsed JSON data from the request body.
 */

/**
 * @typedef {Promise<NetworkCallResult>} InterceptNetworkCall
 */

/**
 * Intercepts a network request matching the given criteria.
 * - If `fulfillResponse` is provided, stubs the request and fulfills it with the given response.
 * - If `handler` is provided, uses it to handle the route.
 * - Otherwise, observes the request and returns its data.
 *
 * @param {InterceptOptions} options - Options for matching and handling the request.
 * @returns {Promise<NetworkCallResult>}
 */
export async function interceptNetworkCall({
  method,
  url,
  page,
  fulfillResponse,
  handler,
}) {
  if (!page) {
    throw new Error('Page is required')
  }

  const preparedResponse = prepareResponse(fulfillResponse)

  // Set up route handler if needed
  if (handler || fulfillResponse) {
    const routePattern = url?.startsWith('**') ? url : `**${url}`
    await page.route(routePattern || '**', async (route, request) => {
      if (!matchesRequest(request, method, url)) {
        return route.continue()
      }

      if (handler) {
        await handler(route, request)
      } else if (preparedResponse) {
        await route.fulfill(preparedResponse)
      } else {
        await route.continue()
      }
    })
  }

  // Wait for response
  const response = await page.waitForResponse((res) =>
    matchesRequest(res.request(), method, url),
  )

  const request = response.request()
  let data = null
  let requestJson = null

  if (fulfillResponse?.body) {
    // If we have a fulfillResponse, use that directly
    data =
      typeof fulfillResponse.body === 'string'
        ? JSON.parse(fulfillResponse.body)
        : fulfillResponse.body
  } else {
    try {
      const contentType = response.headers()['content-type']
      if (contentType?.includes('application/json')) {
        data = await response.json()
      }
    } catch {
      // Response is not JSON
    }
  }

  try {
    requestJson = await request.postDataJSON()
  } catch {
    // Request has no post data or is not JSON
  }

  return {
    request,
    response,
    data,
    status: response.status(),
    requestJson,
  }
}

/**
 * Creates a URL matcher function based on the given pattern.
 *
 * @param {string} [pattern] - The pattern to match URLs against.
 * @returns {(url: string) => boolean} - A function that returns true if the URL matches the pattern.
 */
function createUrlMatcher(pattern) {
  if (!pattern) return () => true

  // Split pattern into path and query if it contains a question mark
  const [pathPattern, queryPattern] = pattern.split('?')

  // Convert URL pattern to glob pattern if needed
  const globPattern = pathPattern?.startsWith('**')
    ? pathPattern
    : `**${pathPattern}`
  const isMatch = picomatch(globPattern)

  return (url) => {
    // Split URL into path and query
    const [urlPath, urlQuery] = url.split('?')

    // Check if path matches
    const pathMatches = isMatch(urlPath)

    // If there's no query pattern, just check the path
    if (!queryPattern) return pathMatches

    // If there's a query pattern but no query in URL, no match
    if (!urlQuery) return false

    // For query parameters, just check if it starts with the pattern
    // This allows matching '/movies?' to match '/movies?name=something'
    return pathMatches && urlQuery.startsWith(queryPattern)
  }
}

/**
 * Checks if a request matches the given method and URL pattern.
 *
 * @param {Request} request - The request to check.
 * @param {string} [method] - The HTTP method to match.
 * @param {string} [urlPattern] - The URL pattern to match.
 * @returns {boolean} - True if the request matches, false otherwise.
 */
function matchesRequest(request, method, urlPattern) {
  const matchesMethod = !method || request.method() === method
  const matchesUrl = createUrlMatcher(urlPattern)(request.url())
  return matchesMethod && matchesUrl
}

/**
 * Prepares the response by stringifying the body if it's an object and setting appropriate headers.
 *
 * @param {FulfillResponse} [fulfillResponse] - The response details.
 * @returns {PreparedResponse | undefined} - The prepared response.
 */
function prepareResponse(fulfillResponse) {
  if (!fulfillResponse) return undefined

  const { status = 200, headers = {}, body } = fulfillResponse
  const contentType = headers['Content-Type'] || 'application/json'

  return {
    status,
    headers: {
      'Content-Type': contentType,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }
}
