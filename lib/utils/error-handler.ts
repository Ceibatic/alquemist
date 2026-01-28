/**
 * Error types that can be detected from Convex errors
 */
export type ErrorType = 'network' | 'validation' | 'server' | 'unknown';

/**
 * Parsed error result
 */
export interface ParsedError {
  type: ErrorType;
  message: string;
  field?: string;
}

/**
 * Parses Convex errors to extract type, message, and field information
 *
 * @param error - The error object caught from a Convex mutation/query
 * @returns ParsedError object with type, message, and optional field
 */
export function parseConvexError(error: any): ParsedError {
  // Network errors
  if (
    error instanceof TypeError &&
    (error.message.includes('fetch') || error.message.includes('NetworkError'))
  ) {
    return {
      type: 'network',
      message: 'Sin conexión a internet. Verifica tu conexión.',
    };
  }

  // Check if error is a network error (no response from server)
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network request failed')) {
    return {
      type: 'network',
      message: 'Sin conexión a internet. Verifica tu conexión.',
    };
  }

  // ConvexError with structured data
  if (error?.data) {
    const { type, message, field } = error.data;

    // If explicitly typed as validation
    if (type === 'validation') {
      return {
        type: 'validation',
        message: message || 'Error de validación. Verifica los datos ingresados.',
        field,
      };
    }

    // If error has a field, it's likely a validation error
    if (field) {
      return {
        type: 'validation',
        message: message || 'Error de validación. Verifica los datos ingresados.',
        field,
      };
    }

    // Server error with message
    if (message) {
      return {
        type: 'server',
        message,
      };
    }
  }

  // Check error message for validation patterns
  if (error?.message) {
    const message = error.message.toLowerCase();

    // Validation error patterns
    if (
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('must be') ||
      message.includes('validation')
    ) {
      return {
        type: 'validation',
        message: error.message,
      };
    }

    // Server error patterns
    if (
      message.includes('internal server') ||
      message.includes('server error') ||
      message.includes('database')
    ) {
      return {
        type: 'server',
        message: 'Error del servidor. Intenta de nuevo más tarde.',
      };
    }

    // Return the actual error message for other server errors
    return {
      type: 'server',
      message: error.message,
    };
  }

  // Fallback for unknown errors
  return {
    type: 'unknown',
    message: 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.',
  };
}

/**
 * Gets a user-friendly error message based on error type
 *
 * @param type - The error type
 * @param defaultMessage - Optional default message to use
 * @returns User-friendly error message
 */
export function getErrorMessage(type: ErrorType, defaultMessage?: string): string {
  const messages: Record<ErrorType, string> = {
    network: 'Sin conexión a internet. Verifica tu conexión.',
    validation: defaultMessage || 'Error de validación. Verifica los datos ingresados.',
    server: defaultMessage || 'Error del servidor. Intenta de nuevo más tarde.',
    unknown: defaultMessage || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.',
  };

  return messages[type];
}
