/**
 * API Error Classes and Handlers
 * Standardized error handling for REST API endpoints
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(400, message, 'BAD_REQUEST', details)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(401, message, 'UNAUTHORIZED', details)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(403, message, 'FORBIDDEN', details)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(404, message, 'NOT_FOUND', details)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(409, message, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(422, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details)
    this.name = 'InternalServerError'
  }
}

/**
 * Check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Convert any error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message)
  }

  return new InternalServerError('An unexpected error occurred')
}
