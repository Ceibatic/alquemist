/**
 * Authentication Utilities
 * Password hashing, validation, and session token generation
 */

/**
 * Password hashing using SHA-256
 * Uses crypto.subtle for secure password hashing
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "alquemist_salt_2025");

  // Use crypto.subtle (Convex runtime supports it)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  // Fallback for testing
  return `hashed_${password}`;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

/**
 * Validate password strength
 * Returns null if valid, error message if invalid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  // At least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return "La contraseña debe contener al menos una letra";
  }

  // At least one number
  if (!/\d/.test(password)) {
    return "La contraseña debe contener al menos un número";
  }

  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Colombian phone number
 * Format: +57 followed by 10 digits, or just 10 digits
 */
export function validateColombianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-()]/g, "");

  // Colombian format: +573001234567 or 3001234567 (10 digits)
  const phoneRegex = /^(\+57)?[1-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Format Colombian phone number
 * Converts to +57XXXXXXXXXX format
 */
export function formatColombianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-()]/g, "");

  if (cleanPhone.startsWith("+57")) {
    return cleanPhone;
  }

  if (cleanPhone.length === 10) {
    return `+57${cleanPhone}`;
  }

  return phone;
}

/**
 * Validate Colombian NIT (Tax ID)
 * Format: XXXXXXXXX-X (9 digits, dash, 1 check digit)
 */
export function validateColombianNIT(nit: string): boolean {
  const cleanNIT = nit.replace(/[\s\-]/g, "");

  // Should be 9 or 10 digits
  if (!/^\d{9,10}$/.test(cleanNIT)) {
    return false;
  }

  return true;
}

/**
 * Generate a random session token
 * Returns a URL-safe base64 string (32 bytes = ~43 chars)
 */
export function generateSessionToken(): string {
  // Generate 32 random bytes
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  // Convert to base64 and make URL-safe
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Calculate session expiration timestamp
 * Default: 30 days from now
 */
export function getSessionExpiration(daysFromNow: number = 30): number {
  return Date.now() + daysFromNow * 24 * 60 * 60 * 1000;
}
