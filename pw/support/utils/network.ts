// support/utils/network.ts
import type {Page, Request, Response, Route} from '@playwright/test'
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

type NetworkCallResult = {
  request: Request | null
  response: Response | null
  data: unknown
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
  const requestPromise = new Promise<Request>(resolve => {
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
    data: fulfillResponse?.body ?? null,
    status: fulfillResponse?.status ?? 200,
    requestJson,
  }
}

async function observeNetworkCall(
  page: Page,
  method?: string,
  url?: string,
): Promise<NetworkCallResult> {
  const request = await page.waitForRequest(req =>
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
    data,
    status: response.status(),
    requestJson,
  }
}

function createUrlMatcher(pattern?: string): (url: string) => boolean {
  if (!pattern) return () => true

  const globPattern = pattern.startsWith('**') ? pattern : `**${pattern}`
  const isMatch = picomatch(globPattern)
  return (url: string) => isMatch(url)
}

function matchesRequest(
  request: Request,
  method?: string,
  urlPattern?: string,
): boolean {
  const matchesMethod = !method || request.method() === method
  const matchesUrl = createUrlMatcher(urlPattern)(request.url())
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

  const {status = 200, headers = {}, body} = fulfillResponse
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
