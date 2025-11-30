/**
 * Convex HTTP Client for Server Actions
 *
 * This client is used in server actions to call Convex mutations/queries.
 * We use ConvexHttpClient instead of ConvexReactClient because server actions
 * run on the server side, not in React components.
 */

import { ConvexHttpClient } from 'convex/browser';

// Validate environment variable
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_CONVEX_URL environment variable. ' +
      'Please set it in .env.local'
  );
}

// Create and export the HTTP client for server-side usage
export const convex = new ConvexHttpClient(convexUrl);

// Type helper for better error handling
export type ConvexError = {
  message: string;
  code?: string;
};

// Helper to extract error message from Convex errors
export function getConvexErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
}
