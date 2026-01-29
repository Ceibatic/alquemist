/**
 * Convex HTTP Client for Server Actions
 *
 * This client is used in server actions to call Convex mutations/queries.
 * We use ConvexHttpClient instead of ConvexReactClient because server actions
 * run on the server side, not in React components.
 */

import { ConvexHttpClient } from 'convex/browser';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    'NEXT_PUBLIC_CONVEX_URL is not defined. Please set it in your environment variables.'
  );
}

console.log('[Convex Server] Using URL:', convexUrl);

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
