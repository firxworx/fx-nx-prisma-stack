import { authQueryEndpointRoutes } from '../auth'
import { ApiError } from '../errors/ApiError.class'
import { AuthError } from '../errors/AuthError.class'
import { FormError } from '../errors/FormError.class'

/** Base URL of the project's back-end API. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL

const LABELS = {
  ERROR_INVALID_OR_EXPIRED_CREDENTIALS: 'Invalid or expired credentials',
  ERROR_AUTH_REFRESH_TOKEN_FAILED: 'Authorization refresh token failed',
  ERROR_API_SERVER: 'Server error',
}

/**
 * Return the value of the cookie with the given `name`.
 * Returns `undefined` if the cookie does not exist, is not readable by client js (http-only), or has a falsey value.
 */
export function getCookie(name: string): string | undefined {
  if (typeof document?.cookie !== 'string') {
    return undefined
  }

  const cookies = document.cookie.split(';')
  const cookie = cookies.find((c) => c.trim().substring(0, name.length + 1) === `${name}=`)

  if (cookie) {
    return decodeURIComponent(cookie.substring(name.length + 1))
  }

  return undefined
}

/**
 * Return the value of the CSRF token sent by the server via cookie.
 *
 * This function reads the public `NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME` environment variable and will
 * throw an Error if the cookie name is not set or if the cookie value cannot be determined.
 */
function getCsrfCookieValue(): string {
  if (!process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME) {
    throw new Error('Client CSRF protection configuration error')
  }

  const csrfToken = getCookie(process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME)

  if (!csrfToken) {
    throw new Error('Server CSRF protection configuration error')
  }

  return csrfToken
}

/**
 * Thin wrapper for browser `fetch()` that passes required project headers and is configured to
 * send credentials to same-origin URL's.
 */
export async function projectFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(!options?.method || options.method === 'GET' || process.env.NEXT_PUBLIC_CSRF_OPT_FLAG === 'OFF'
        ? {}
        : { 'CSRF-Token': getCsrfCookieValue() }),
      // alternatively for authorization header, e.g.: 'Authorization': `Bearer ${token}`,
    },
    // spread options to support overriding headers
    ...(options ?? {}),
    // set credentials as required for cors + cookie authentication
    credentials: 'same-origin', // vs. 'include'
  })
}

/**
 * Generic API "fetcher" implemented with the browser `fetch()` API that will automatically retry requests
 * met with a 401 response after.
 *
 * Note: the implementation returns rejected promises w/ Errors to bypass the top-level catch in cases of HTTP
 * errors; the top-level catch is specifically intended for network errors thrown by the `fetch()` function.
 *
 * @see CustomApp `pages/_app.tsx` for global query error handling + error boundary
 */
export async function apiFetch<T>(path: string, options?: RequestInit, isRetryAttempt?: boolean): Promise<T>
export async function apiFetch(path: string, options?: RequestInit, isRetryAttempt?: boolean): Promise<unknown> {
  try {
    const response = await projectFetch(path, options)

    if (response.status === 401) {
      switch (!!isRetryAttempt) {
        case true: {
          console.warn('(401) - apiFetch refresh token retry attempt failed...')
          return Promise.reject(new AuthError(LABELS.ERROR_INVALID_OR_EXPIRED_CREDENTIALS))
        }
        case false: {
          console.warn(`(401) - apiFetch request failed (${path})... attempting refresh request...`)

          const RETRY_TIMEOUT = 5000
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), RETRY_TIMEOUT)

          try {
            const refreshResponse = await projectFetch(authQueryEndpointRoutes.refresh, { signal: controller.signal })

            if (refreshResponse.status === 401) {
              console.warn(`(401) - apiFetch refresh request failed (${path}) `)
              console.warn(LABELS.ERROR_AUTH_REFRESH_TOKEN_FAILED)
              return Promise.reject(new AuthError(LABELS.ERROR_INVALID_OR_EXPIRED_CREDENTIALS))
            }

            if (!refreshResponse.ok) {
              console.warn(`(${refreshResponse.status}) - apiFetch refresh failed - not ok (${path}) `)
              console.warn(LABELS.ERROR_API_SERVER)
              return Promise.reject(
                new ApiError(`${LABELS.ERROR_API_SERVER} (${refreshResponse.status})`, response.status),
              )
            }

            return apiFetch(path, options, true)
          } catch (error: unknown) {
            if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
              console.warn(`API timeout (${RETRY_TIMEOUT}ms): failed to authenticate using refresh token...`)
              return Promise.reject(new AuthError(LABELS.ERROR_AUTH_REFRESH_TOKEN_FAILED))
            }

            throw error
          } finally {
            clearTimeout(timeout)
          }
        }
      }
    }

    if (!response.ok) {
      if (options?.method === 'POST' && (response.status === 400 || response.status === 422)) {
        try {
          const errorJson = await response.json()
          return Promise.reject(new FormError('Form Error', response.status, errorJson))
        } catch (error: unknown) {
          const errorRaw = await response.text()
          return Promise.reject(new FormError(errorRaw || `API error (${response.status})`, response.status))
        }
      }

      return Promise.reject(new ApiError(`API error (${response.status})`, response.status))
    }

    try {
      // parse responses that are not http-204 (no content) as json (return {} in 204 case for truthy result)
      const json = response.status === 204 ? ({} as Record<string, never>) : await response.json()
      return json
    } catch (error: unknown) {
      return Promise.reject(
        new ApiError('Unexpected malformed response received from API (invalid JSON)', response.status),
      )
    }
  } catch (error: unknown) {
    // fetch api will throw on network errors but not http errors (i.e. response statuses 4xx+5xx)
    if (error instanceof Error) {
      throw error
    }

    throw new Error(String(error))
  }
}
