'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Shared hook for auth pages to redirect already-authenticated users.
 *
 * Handles the three-state onboardingStatus:
 *  - undefined → loading (wait)
 *  - null      → user in Clerk but not in Convex yet → /company-setup
 *  - object    → redirect based on onboarding progress
 *
 * Returns `isRedirecting: true` when the page should show a spinner
 * instead of its normal content.
 */
export function useAuthRedirect() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const onboardingStatus = useQuery(
    api.users.getOnboardingStatus,
    authLoaded && isSignedIn ? {} : "skip"
  );

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) return;

    if (onboardingStatus === undefined) return; // Loading

    // User authenticated in Clerk but not yet in Convex DB — send to onboarding
    if (onboardingStatus === null) {
      router.replace('/company-setup');
      return;
    }

    // Redirect based on onboarding status
    if (onboardingStatus.onboardingCompleted) {
      router.replace('/dashboard');
    } else if (!onboardingStatus.hasCompany) {
      router.replace('/company-setup');
    } else {
      router.replace('/facility-basic');
    }
  }, [authLoaded, isSignedIn, onboardingStatus, router]);

  // True when authenticated — page should show spinner instead of its content
  return { isRedirecting: !!isSignedIn };
}
