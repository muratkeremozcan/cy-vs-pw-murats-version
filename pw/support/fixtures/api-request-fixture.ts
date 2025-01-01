import {test as base} from '@playwright/test'
import {apiRequest as apiRequestOriginal} from '../fixture-helpers/plain-functions'

export type ApiRequestParams = {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'
  url: string
  baseUrl?: string
  body?: Record<string, unknown> | null
  headers?: Record<string, string>
}

export type ApiRequestResponse<T = unknown> = {
  status: number
  body: T
}

// define the function signature as a type
type ApiRequestFn = <T = unknown>(
  params: ApiRequestParams,
) => Promise<ApiRequestResponse<T>>

// grouping them all together
type ApiRequestMethods = {
  apiRequest: ApiRequestFn
}

export const test = base.extend<ApiRequestMethods>({
  apiRequest: async ({request}, use) => {
    const apiRequestFn: ApiRequestFn = async <T = unknown>({
      method,
      url,
      baseUrl,
      body = null,
      headers,
    }: ApiRequestParams): Promise<ApiRequestResponse<T>> => {
      const response = await apiRequestOriginal({
        request,
        method,
        url,
        baseUrl,
        body,
        headers,
      })

      return {
        status: response.status,
        body: response.body as T,
      }
    }

    await use(apiRequestFn)
  },
})
