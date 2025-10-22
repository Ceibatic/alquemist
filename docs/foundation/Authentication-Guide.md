# Alquemist Authentication Guide

**Last Updated:** 2025-10-10

---

## Overview

Alquemist uses **Clerk** for authentication with the following features:
- Email/Password authentication
- OAuth providers (Google, GitHub, etc.)
- Multi-tenant Organizations
- Session management
- Protected routes

---

## Common Issues & Solutions

### Issue 1: "Password has been found as part of a breach"

**What is this?**
- Clerk checks all passwords against the **HaveIBeenPwned** database
- This database contains 800M+ passwords from real data breaches
- It's a **security feature**, not a bug!

**Why it happens:**
Common test passwords like these are flagged:
- `password123`
- `test1234`
- `admin123`
- `12345678`
- Any password that appears in breached databases

**Solutions:**

#### Option A: Use a Strong Password (Recommended)
Create a unique password with:
- ✅ At least 8 characters
- ✅ Uppercase letters (A-Z)
- ✅ Lowercase letters (a-z)
- ✅ Numbers (0-9)
- ✅ Special characters (!@#$%^&*)

**Examples of acceptable passwords:**
- `MyAlquemist2025!`
- `Test@SecureApp99`
- `Dev!Password#2025`

#### Option B: Disable Breach Detection (Development Only)
You can disable this in the Clerk Dashboard:

1. Go to https://dashboard.clerk.com
2. Select your application: "fluent-gecko-72"
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Scroll to **Password settings**
5. Toggle OFF "**Check password against breach databases**"
6. Save changes

**⚠️ Warning:** Only do this in development. Always use breach detection in production!

#### Option C: Use OAuth Instead (No Password Needed)
Enable Google/GitHub sign-in in Clerk Dashboard:
1. Go to **User & Authentication** → **Social Connections**
2. Enable Google OAuth
3. Users can sign up with "Continue with Google"

---

### Issue 2: Deprecated Redirect URL Props

**Error Message:**
```
The prop "afterSignUpUrl" is deprecated and should be replaced
with "fallbackRedirectUrl" or "forceRedirectUrl"
```

**What changed:**
Clerk updated their redirect API in v6:
- ❌ Old: `afterSignUpUrl`, `afterSignInUrl`
- ✅ New: `fallbackRedirectUrl` or `forceRedirectUrl`

**Which one to use:**

| Prop | Behavior | Use When |
|------|----------|----------|
| `fallbackRedirectUrl` | Redirects here **only if** no return URL exists | Most cases (default landing page) |
| `forceRedirectUrl` | **Always** redirects here (ignores return URL) | Force specific flow (e.g., onboarding) |

**Fixed Implementation:**
```tsx
// ✅ Correct (Fallback - Recommended)
<SignUp fallbackRedirectUrl="/dashboard" />

// ✅ Correct (Force - Use sparingly)
<SignUp forceRedirectUrl="/onboarding" />

// ❌ Old (Deprecated)
<SignUp afterSignUpUrl="/dashboard" />
```

**Current Status:** ✅ Fixed in both [sign-in/page.tsx](../app/sign-in/[[...sign-in]]/page.tsx) and [sign-up/page.tsx](../app/sign-up/[[...sign-up]]/page.tsx)

---

### Issue 3: Preload Resource Warning

**Warning Message:**
```
The resource <URL> was preloaded using link preload but not used
within a few seconds from the window's load event.
```

**What is this?**
- Next.js preloads resources (fonts, scripts, CSS) for performance
- Sometimes a resource is preloaded but not immediately used
- This is usually a **performance hint**, not a critical error

**Why it happens:**
1. **Conditional rendering** - Resource preloaded but component doesn't render
2. **Lazy loading** - Component loads later than expected
3. **Development mode** - More verbose in dev, usually fine in production

**How to handle:**

#### For Development:
- ✅ **Ignore it** - These warnings are more aggressive in dev mode
- They usually disappear in production builds

#### For Production (if persistent):
Check in Next.js config which resources are being preloaded:

```typescript
// next.config.ts
const nextConfig = {
  // Customize preload behavior
  experimental: {
    optimizePackageImports: ['@clerk/nextjs'],
  },
}
```

**Common culprits:**
- Clerk's authentication scripts (loaded conditionally)
- Fonts that aren't used on first page
- Dynamic components

**How to verify:**
```bash
# Build for production and check
npm run build
npm run start

# Check browser Network tab
# Preload warnings should be reduced
```

---

## Authentication Flow

### Sign Up Flow

1. **User visits:** http://localhost:3000
2. **Clicks "Sign Up"** → Redirects to `/sign-up`
3. **Enters email & password**
   - Password must not be breached (HaveIBeenPwned check)
   - Must meet minimum requirements
4. **Email verification** (if enabled)
5. **Redirects to:** `/dashboard`

### Sign In Flow

1. **User visits:** `/sign-in`
2. **Enters credentials**
3. **Session created**
4. **Redirects to:** `/dashboard` (or intended destination)

### Protected Routes

The following routes require authentication:
- `/dashboard` - User dashboard
- `/api/v1/companies` - Company management
- `/api/v1/facilities` - Facility operations
- `/api/v1/batches` - Batch tracking
- `/api/v1/activities` - Activity logging
- `/api/v1/compliance` - Compliance reporting
- `/api/v1/inventory` - Inventory management

**Middleware Configuration:** [middleware.ts](../middleware.ts)

---

## Multi-Tenant Organizations

### Enabling Organizations in Clerk

1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to **Organizations**
4. Toggle ON "**Enable organizations**"
5. Configure settings:
   - ✅ Allow users to create organizations
   - ✅ Show organization switcher
   - ✅ Require organizations (optional)

### How Organizations Work

```typescript
// In your API or page
const { userId, orgId } = await auth()

if (!orgId) {
  // User not in an organization
  // Prompt to create/join one
}

// Use orgId for multi-tenant queries
const company = await getCompanyByOrgId(orgId)
```

### Alquemist's Two-Tier ID System

```
Clerk Organization ID (string)
    ↓ (lookup)
Convex Company ID (Id<"companies">)
    ↓ (filter)
All data for that company
```

**Example:**
```typescript
// 1. Get Clerk org ID
const { orgId } = await auth()

// 2. Find company in Convex
const company = await fetchQuery(api.companies.getByOrganizationId, {
  organizationId: orgId
})

// 3. Use company._id for all queries
const facilities = await fetchQuery(api.facilities.list, {
  companyId: company._id
})
```

---

## Testing Authentication

### Manual Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Test sign-up:**
   - Click "Sign Up"
   - Use a strong password (e.g., `TestUser2025!`)
   - Verify email if prompted
   - Should redirect to `/dashboard`

4. **Check organization:**
   - In Clerk dashboard, create an organization
   - Assign user to organization
   - Organization ID should appear in dashboard

5. **Test API with auth:**
   ```bash
   # Without auth (should return 401)
   curl http://localhost:3000/api/v1/companies

   # With auth (needs session token)
   # Get token from browser DevTools → Application → Cookies
   curl http://localhost:3000/api/v1/companies \
     -H "Authorization: Bearer <session_token>"
   ```

### Automated Testing Script

Run the auth test script:
```bash
./scripts/test-auth.sh
```

**What it tests:**
- ✅ Clerk configuration
- ✅ API health
- ✅ Authentication guards
- ✅ Seed data

---

## Environment Variables

Required in `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://....clerk.accounts.dev

# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Current Status:** ✅ All configured

---

## Clerk Dashboard Quick Links

- **Dashboard:** https://dashboard.clerk.com
- **Your App:** fluent-gecko-72.clerk.accounts.dev
- **Users:** Dashboard → Users
- **Organizations:** Dashboard → Organizations
- **Settings:** Dashboard → Settings
- **API Keys:** Dashboard → API Keys

---

## Best Practices

### For Development

1. **Use strong test passwords** even in dev (prevents breach warnings)
2. **Create test organizations** to verify multi-tenancy
3. **Test both sign-up and sign-in** flows
4. **Verify protected routes** return 401 when unauthenticated

### For Production

1. **Always enable breach detection** (HaveIBeenPwned)
2. **Require email verification**
3. **Enable MFA** for admin users
4. **Use production Clerk keys** (not test keys)
5. **Configure allowed redirect URLs**

---

## Troubleshooting

### "Authentication required" errors

**Symptom:** API returns 401 Unauthorized

**Causes:**
1. Not signed in
2. Session expired
3. Invalid session token
4. Organization not selected (for org-scoped endpoints)

**Solutions:**
1. Sign in at `/sign-in`
2. Check session in dashboard
3. Verify Clerk middleware is configured
4. Create/join an organization

### "Organization not found" errors

**Symptom:** Company data returns empty

**Causes:**
1. User not in an organization
2. Organization not synced to Convex
3. Company not created in database

**Solutions:**
1. Create organization in Clerk dashboard
2. Run POST `/api/v1/companies` to create company record
3. Verify `organization_id` matches in Clerk and Convex

### Session not persisting

**Symptom:** Keep getting logged out

**Causes:**
1. Cookie issues (third-party cookies blocked)
2. Domain mismatch
3. Clerk configuration issue

**Solutions:**
1. Check browser cookie settings
2. Verify `CLERK_FRONTEND_API_URL` is correct
3. Check Clerk dashboard for session settings

---

## Summary

**Authentication Status:** ✅ Fully Configured

**What's Working:**
- ✅ Sign-up with email/password
- ✅ Sign-in flow
- ✅ Protected routes
- ✅ Session management
- ✅ Multi-tenant organizations (ready)

**What to Do:**
1. Use strong passwords when testing (e.g., `Test@2025!Secure`)
2. Create test organizations in Clerk dashboard
3. Test the complete flow: Sign Up → Create Org → Create Company → Create Facility

**Next Steps:**
- Test end-to-end company creation flow
- Build Module 1 UI (Company & Facility Setup)
- Implement organization switcher

---

**Need Help?**
- Clerk Docs: https://clerk.com/docs
- Alquemist API Docs: [API-Integration.md](API-Integration.md)
- Implementation Status: [Implementation-Status.md](Implementation-Status.md)
