import { AuthError } from '../errors/AuthError.class'

/** Base URL of the project's back-end API. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL

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
 * Fetch wrapper for making requests to the project's back-end API.
 * Includes credentials and sets appropriate headers for Content-Type and CSRF protection.
 *
 * Note react-query error handling requires a rejected promise on fetch error (e.g. axios-like behavior).
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...(options ?? {}),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(!options?.method || options.method === 'GET' ? {} : { 'CSRF-Token': getCsrfCookieValue() }),
        // alternatively for authorization header, e.g.: 'Authorization': `Bearer ${token}`,
      },
      // required for cors + cookie authentication
      credentials: 'same-origin', // 'include'
    })

    if (response.status === 401) {
      // getApiEvents().emit(EVENT_AUTH_ERROR) // @future fire event on auth error

      // return rejected promise vs. throw to bypass catch (enables alternative ux flow in the auth failure case)
      // return Promise.reject(new Error('Invalid credentials'))

      // @see `pages/_app.tsx` for global onError callback and handling of AuthError case
      throw new AuthError('Invalid or expired credentials')
    }

    // parse responses that are not http-204 (no content) as json
    const json = response.status === 204 ? {} : await response.json()

    if (!json) {
      throw new Error(`Fetch error (${response.status}): missing expected response data from ${path}`)
    }

    if (!response.ok) {
      // the following block is less relevant with react-query's callbacks for error handling - pulling out for now
      // @todo elegant form submission error handling + user feedback
      //
      // // return rejected promise to bypass catch for 400+422 errors resulting from POST requests (form submission)
      // // and throw all other errors
      // if (options?.method === 'POST' && (response.status === 400 || response.status === 422)) {
      //   console.error(`Fetch error (${response.status}):`, JSON.stringify(json, null, 2))
      //   if (json?.message) {
      //     return Promise.reject(new Error(String(json.message)))
      //   }
      //   return Promise.reject(new Error('Form submission error'))
      // }

      console.error(`Fetch error (${response.status}):`, JSON.stringify(json, null, 2))
      throw new Error(json)
    }

    return json as T
  } catch (error: unknown) {
    // getApiEvents().emit(EVENT_NETWORK_ERROR)

    // return via a rejected promise to provide the error to the calling hook/component
    if (error instanceof Error) {
      return Promise.reject(error)
    }

    return Promise.reject(new Error(String(error)))
  }
}
