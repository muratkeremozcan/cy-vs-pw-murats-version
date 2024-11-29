/**
 * Intercepts a network request matching the given criteria.
 * - If `fulfillResponse` is provided, stubs the request and fulfills it with the given response.
 * - Otherwise, observes the request and returns its data.
 * @param {Object} options - Options for matching and handling the request.
 * @param {string} [options.method] - The HTTP method to match (e.g., 'GET', 'POST').
 * @param {string} [options.url] - The URL pattern to match (e.g., '/todos/:id').
 * @param {import('@playwright/test').Page} options.page - The Playwright page object.
 * @param {Object} [options.fulfillResponse] - Optional response to fulfill the request with.
 * @returns {Promise<{ request: import('playwright').Request | null, response: import('playwright').Response | null, data: any, status: number, requestJson: any }>}
 */
export async function interceptNetworkCall({
  method,
  url,
  page,
  fulfillResponse,
}) {
  if (fulfillResponse) {
    return fulfillNetworkCall(page, method, url, fulfillResponse)
  } else {
    return observeNetworkCall(page, method, url)
  }
}

/**
 * Stubs the network request matching the criteria and fulfills it with the specified response.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} [method] - The HTTP method to match.
 * @param {string} [url] - The URL pattern to match.
 * @param {Object} fulfillResponse - The response to fulfill the request with.
 * @returns {Promise<{ request: null, response: null, data: null, status: number, requestJson: null }>}
 */
async function fulfillNetworkCall(page, method, url, fulfillResponse) {
  await page.route('**/*', async (route, request) => {
    if (matchesRequest(request, method, url)) {
      await route.fulfill(fulfillResponse)
    } else {
      await route.continue()
    }
  })
  // Set status to the status code provided in fulfillResponse, defaulting to 200
  const status = fulfillResponse.status || 200
  return {
    request: null,
    response: null,
    data: null,
    status,
    requestJson: null,
  }
}

/**
 * Observes the network request matching the criteria and returns its data.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} [method] - The HTTP method to match.
 * @param {string} [url] - The URL pattern to match.
 * @returns {Promise<{ request: import('playwright').Request, response: import('playwright').Response, data: any, status: number, requestJson: any }>}
 */
async function observeNetworkCall(page, method, url) {
  const request = await page.waitForRequest((req) =>
    matchesRequest(req, method, url),
  )

  const response = await request.response()
  if (!response) throw new Error('No response received for the request')

  const status = response.status()

  let data = null
  try {
    data = await response.json()
  } catch {
    // Response is not JSON; ignore
  }

  let requestJson = null
  try {
    requestJson = await request.postDataJSON()
  } catch {
    // Request has no post data or is not JSON; ignore
  }

  return { request, response, data, status, requestJson }
}

/**
 * Matches a URL against a pattern with optional dynamic segments.
 * @param {string} url - The URL to test.
 * @param {string} pattern - The pattern to match against (e.g., '/todos/:id').
 * @returns {boolean} - Whether the URL matches the pattern.
 */
function matchUrl(url, pattern) {
  const urlSegments = url.split('/').filter(Boolean)
  const patternSegments = pattern.split('/').filter(Boolean)

  if (urlSegments.length !== patternSegments.length) return false

  return patternSegments.every(
    (segment, index) =>
      segment.startsWith(':') || segment === urlSegments[index],
  )
}

/**
 * Checks if a request matches the specified method and URL pattern.
 * @param {import('@playwright/test').Request} request - The request object.
 * @param {string} [method] - The HTTP method to match.
 * @param {string} [url] - The URL pattern to match.
 * @returns {boolean} - True if the request matches the method and URL pattern.
 */
function matchesRequest(request, method, url) {
  const methodMatches = method ? request.method() === method : true
  const requestUrl = new URL(request.url()).pathname
  const urlMatches = url ? matchUrl(requestUrl, url) : true
  return methodMatches && urlMatches
}
