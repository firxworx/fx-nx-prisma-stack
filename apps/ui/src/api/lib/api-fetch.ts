export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...(options ?? {}),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',

        // alternatively for authorization header, e.g.
        // 'Authorization': `Bearer ${token}`,
      },
      // required for cors + cookie authentication
      credentials: 'include',
    })

    if (response.status === 401) {
      // getApiEvents().emit(EVENT_AUTH_ERROR)

      // return rejected promise vs. throw to bypass catch (enables alternative ux flow in the auth failure case)
      return Promise.reject(new Error('Invalid credentials'))
    }

    // parse responses that are not http-204 (no content) as json
    const json = response.status === 204 ? {} : await response.json()

    if (!json) {
      throw new Error(`Fetch error (${response.status}): missing expected response data from ${path}`)
    }

    // return rejected promise to bypass catch in 400 errors resulting from POST (forms) and throw all other errors
    if (!response.ok) {
      if (options?.method === 'POST' && response.status === 400) {
        if (json?.message) {
          return Promise.reject(new Error(String(json.message)))
        }
        return Promise.reject(new Error('Form submission error'))
      }

      console.error('Fetch error:', JSON.stringify(json))
      throw new Error(`Fetch error (${response.status}): ${JSON.stringify(json)}`)
    }

    return json as T
  } catch (error: unknown) {
    // getApiEvents().emit(EVENT_NETWORK_ERROR)

    // return via a rejected promise to provide the error to the calling hook or component
    return Promise.reject(error)
  }
}
