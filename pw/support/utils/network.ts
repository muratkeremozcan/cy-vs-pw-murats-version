import type { Page, Request, Response, Route } from '@playwright/test'
import picomatch from 'picomatch'

export type InterceptNetworkCall = ReturnType<typeof interceptNetworkCall>

type FulfillResponse = {
  status?: number
  headers?: Record<string, string>
  body?: unknown // Can be string, Buffer, or object
}

type PreparedResponse = {
  status?: number
  headers?: Record<string, string>
  body?: string | Buffer
}

export type InterceptOptions = {
  method?: string
  url?: string
  page: Page
  fulfillResponse?: FulfillResponse
  handler?: (route: Route, request: Request) => Promise<void> | void
}

export type NetworkCallResult = {
  request: Request | null
  response: Response | null
  responseJson: unknown
  status: number
  requestJson: unknown
}

/**
 * Intercepts a network request matching the given criteria.
 * - If `fulfillResponse` is provided, stubs the request and fulfills it with the given response.
 * - If `handler` is provided, uses it to handle the route.
 * - Otherwise, observes the request and returns its data.
 * @param {InterceptOptions} options - Options for matching and handling the request.
 * @returns {Promise<NetworkCallResult>}
 */
export async function interceptNetworkCall({
  method,
  url,
  page,
  fulfillResponse,
  handler,
}: InterceptOptions): Promise<NetworkCallResult> {
  if (!page) {
    throw new Error('The `page` argument is required for network interception')
  }

  if (fulfillResponse || handler) {
    return fulfillNetworkCall(page, method, url, fulfillResponse, handler)
  } else {
    return observeNetworkCall(page, method, url)
  }
}

async function fulfillNetworkCall(
  page: Page,
  method?: string,
  url?: string,
  fulfillResponse?: FulfillResponse,
  handler?: (route: Route, request: Request) => Promise<void> | void,
): Promise<NetworkCallResult> {
  const routePattern = url?.startsWith('**') ? url : `**${url || '*'}`
  const preparedResponse = prepareResponse(fulfillResponse)

  // Create a promise that will resolve with the request data
  let resolveRequest: (request: Request) => void
  const requestPromise = new Promise<Request>((resolve) => {
    resolveRequest = resolve
  })

  await page.route(routePattern, async (route, request) => {
    if (matchesRequest(request, method, url)) {
      // Capture the request before handling it
      resolveRequest(request)

      if (handler) {
        await handler(route, request)
      } else if (preparedResponse) {
        await route.fulfill(preparedResponse)
      }
    } else {
      await route.continue()
    }
  })

  // Wait for the request to be captured
  const request = await requestPromise
  let requestJson = null
  try {
    requestJson = await request.postDataJSON()
  } catch {
    // Request has no post data or is not JSON
  }

  return {
    request,
    response: null,
    responseJson: fulfillResponse?.body ?? null,
    status: fulfillResponse?.status ?? 200,
    requestJson,
  }
}

async function observeNetworkCall(
  page: Page,
  method?: string,
  url?: string,
): Promise<NetworkCallResult> {
  const request = await page.waitForRequest((req) =>
    matchesRequest(req, method, url),
  )

  const response = await request.response()
  if (!response) {
    throw new Error('No response received for the request')
  }

  let data = null
  try {
    const contentType = response.headers()['content-type']
    if (contentType?.includes('application/json')) {
      data = await response.json()
    }
  } catch {
    // Response is not JSON
  }

  let requestJson = null
  try {
    requestJson = await request.postDataJSON()
  } catch {
    // Request has no post data or is not JSON
  }

  return {
    request,
    response,
    responseJson: data,
    status: response.status(),
    requestJson,
  }
}

/** Creates a URL matcher function based on the provided glob pattern.
 *
 * @param {string} [pattern] - Glob pattern to match URLs against.
 * @returns {(url: string) => boolean} - A function that takes a URL and returns whether it matches the pattern.
 */
function createUrlMatcher(pattern?: string) {
  if (!pattern) return () => true

  const globPattern = pattern.startsWith('**') ? pattern : `**${pattern}`
  const isMatch = picomatch(globPattern)

  return isMatch
}

/**
 * Determines whether a network request matches the specified method and URL pattern.
 *
 * @param {Request} request - The network request to evaluate.
 * @param {string} [method] - HTTP method to match.
 * @param {string} [urlPattern] - URL pattern to match.
 * @returns {boolean} - `true` if the request matches both the method and URL pattern; otherwise, `false`.
 */
function matchesRequest(
  request: Request,
  method?: string,
  urlPattern?: string,
): boolean {
  const matchesMethod = !method || request.method() === method

  const matcher = createUrlMatcher(urlPattern) // Step 1: Create the matcher function
  const matchesUrl = matcher(request.url()) // Step 2: Use the matcher with the URL

  return matchesMethod && matchesUrl
}

/**
 * Prepares the response by stringifying the body if it's an object and setting appropriate headers.
 * @param {FulfillResponse} fulfillResponse - The response details.
 * @returns {PreparedResponse | undefined} - The prepared response.
 */
function prepareResponse(
  fulfillResponse?: FulfillResponse,
): PreparedResponse | undefined {
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
