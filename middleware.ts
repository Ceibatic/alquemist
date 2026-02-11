import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
