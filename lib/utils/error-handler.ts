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
 * Field name mappings from backend field names to frontend form field names
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  first_name: 'first_name',
  last_name: 'last_name',
  phone: 'phone',
  identification_type: 'identification_type',
  identification_number: 'identification_number',
  locale: 'locale',
  timezone: 'timezone',
  date_format: 'date_format',
  time_format: 'time_format',
  theme: 'theme',
  email_notifications: 'email_notifications',
  sms_notifications: 'sms_notifications',
  current_password: 'current_password',
  new_password: 'new_password',
  confirm_new_password: 'confirm_new_password',
  default_facility_id: 'default_facility_id',
  quiet_hours_start: 'quiet_hours_start',
  quiet_hours_end: 'quiet_hours_end',
};

/**
 * Attempts to extract field name from error message
 */
function extractFieldFromMessage(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  // Common field name patterns in error messages
  const fieldPatterns: Array<{ pattern: RegExp; field: string }> = [
    { pattern: /\bnombre\b/i, field: 'first_name' },
    { pattern: /\bapellido\b/i, field: 'last_name' },
    { pattern: /\bteléfono\b|\btelefono\b|\bphone\b/i, field: 'phone' },
    { pattern: /\btema\b|\btheme\b/i, field: 'theme' },
    { pattern: /\bformato de fecha\b|date.?format/i, field: 'date_format' },
    { pattern: /\bformato de hora\b|time.?format/i, field: 'time_format' },
    { pattern: /\bidioma\b|locale/i, field: 'locale' },
    { pattern: /\bzona horaria\b|timezone/i, field: 'timezone' },
    { pattern: /\bcontraseña actual\b|current.?password/i, field: 'current_password' },
    { pattern: /\bnueva contraseña\b|new.?password/i, field: 'new_password' },
    { pattern: /\bconfirmar.*contraseña\b|confirm.*password/i, field: 'confirm_new_password' },
    { pattern: /\bidentificación tipo\b|identification.?type/i, field: 'identification_type' },
    { pattern: /\bidentificación número\b|identification.?number/i, field: 'identification_number' },
    { pattern: /\bhora de inicio\b|start.?time/i, field: 'quiet_hours_start' },
    { pattern: /\bhora de fin\b|end.?time/i, field: 'quiet_hours_end' },
  ];

  for (const { pattern, field } of fieldPatterns) {
    if (pattern.test(message)) {
      return field;
    }
  }

  return undefined;
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

    // Map backend field name to frontend field name
    const mappedField = field ? FIELD_NAME_MAPPINGS[field] || field : undefined;

    // If explicitly typed as validation
    if (type === 'validation') {
      return {
        type: 'validation',
        message: message || 'Error de validación. Verifica los datos ingresados.',
        field: mappedField,
      };
    }

    // If error has a field, it's likely a validation error
    if (mappedField) {
      return {
        type: 'validation',
        message: message || 'Error de validación. Verifica los datos ingresados.',
        field: mappedField,
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
    const message = error.message;
    const lowerMessage = message.toLowerCase();

    // Try to extract field name from error message
    const extractedField = extractFieldFromMessage(message);

    // Validation error patterns
    if (
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('required') ||
      lowerMessage.includes('must be') ||
      lowerMessage.includes('debe tener') ||
      lowerMessage.includes('debe ser') ||
      lowerMessage.includes('validation')
    ) {
      return {
        type: 'validation',
        message: error.message,
        field: extractedField,
      };
    }

    // Server error patterns
    if (
      lowerMessage.includes('internal server') ||
      lowerMessage.includes('server error') ||
      lowerMessage.includes('database')
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
      field: extractedField,
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
