import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/set-password",
  "/reset-password",
  "/accept-invitation(.*)",
  "/invitation-invalid",
  "/welcome-invited",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (!isPublicRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
    // Redirect authenticated users away from auth pages
    if (
      isPublicRoute(request) &&
      (await convexAuth.isAuthenticated()) &&
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/signup")
    ) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } } // 30 days
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
