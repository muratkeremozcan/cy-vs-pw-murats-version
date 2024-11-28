/**
 * Matches a URL against a pattern with optional dynamic segments.
 * @param {string} url - The URL to test.
 * @param {string} pattern - The pattern to match against, e.g., '/todos/:id'.
 * @returns {boolean} - Whether the URL matches the pattern.
 */
const matchUrl = (url, pattern) => {
  const urlSegments = url.split('/').filter(Boolean)
  const patternSegments = pattern.split('/').filter(Boolean)

  if (urlSegments.length !== patternSegments.length) return false

  return patternSegments.every(
    (segment, index) =>
      segment.startsWith(':') || segment === urlSegments[index],
  )
}

/**
 * Intercepts a network request matching the given criteria and returns relevant data.
 * @param {Object} options - The options for matching the request.
 * @param {string} options.method - The HTTP method to match.
 * @param {string} options.url - The URL pattern to match, e.g., '/todos/:id'.
 * @param {import('@playwright/test').Page} options.page - The Playwright page object.
 * @returns {Promise<{ request: import('playwright').Request, response: import('playwright').Response, data: any, status: number }>}
 */
export async function interceptNetworkCall({ method, url, page }) {
  const request = await page.waitForRequest((request) => {
    const methodMatches = method ? request.method() === method : true
    const requestUrl = new URL(request.url()).pathname
    const urlMatches = url ? matchUrl(requestUrl, url) : true
    return methodMatches && urlMatches
  })

  const response = await request.response()
  if (!response) throw new Error('No response received for the request')

  const status = response.status()

  let data = null
  try {
    data = await response.json()
  } catch (error) {
    // Response is not JSON, ignore
  }

  return { request, response, data, status }
}
