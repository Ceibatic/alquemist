/**
 * Shared validation utilities
 * Extracted from auth.legacy.ts — non-auth validators
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateColombianPhone(phone: string): boolean {
  const phoneRegex = /^\+?57\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export function formatColombianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+57${digits}`;
  }
  return phone;
}

export function validateColombianNIT(nit: string): boolean {
  const nitRegex = /^\d{9}-\d$/;
  return nitRegex.test(nit);
}
