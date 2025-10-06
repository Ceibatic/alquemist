/**
 * Auth Fetch Wrapper
 * Handles API calls with session cookies and error handling
 */

interface FetchOptions extends RequestInit {
  body?: any
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function authFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, ...restOptions } = options

  const config: RequestInit = {
    ...restOptions,
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...restOptions.headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(endpoint, config)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new AuthError(
          response.status,
          'Error del servidor. Inténtalo de nuevo.'
        )
      }
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.error || data.message || 'Error desconocido'
      throw new AuthError(response.status, errorMessage)
    }

    return data.data || data
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }

    // Network or other errors
    throw new AuthError(
      0,
      'Error de conexión. Verifica tu conexión a internet.'
    )
  }
}

// Helper for handling auth errors in components
export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido. Inténtalo de nuevo.'
}
