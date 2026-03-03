import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/verify-email(.*)",
  "/forgot-password(.*)",
  "/set-password(.*)",
  "/reset-password(.*)",
  "/accept-invitation(.*)",
  "/invitation-invalid",
  "/welcome-invited",
  "/terms",
  "/privacy",
]);

// Auth pages where authenticated users should be redirected away
const isAuthPage = createRouteMatcher([
  "/login",
  "/signup",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users away from login/signup pages
  if (userId && isAuthPage(req)) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
