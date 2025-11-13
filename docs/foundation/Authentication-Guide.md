# Alquemist Authentication Guide

**Last Updated:** November 12, 2025
**Status:** Active
**Version:** 2.0

---

## Overview

Alquemist uses **custom authentication** with session tokens. This system is designed specifically for Bubble.io frontend integration with Convex backend.

### Key Features

- ✅ Email/Password authentication
- ✅ 30-day session tokens
- ✅ Two-step registration (User → Company)
- ✅ Email verification required
- ✅ Multi-tenancy (company-based data isolation)
- ✅ Role-based access control (RBAC)

### Architecture

```
┌─────────────────┐
│  Bubble.io      │  Frontend (No-code platform)
│  Frontend       │  - User interface
└────────┬────────┘  - Form handling
         │            - Session management
         │ HTTPS/API
         ▼
┌─────────────────┐
│  Convex Backend │  Database & API
│  (Custom Auth)  │  - User authentication
└────────┬────────┘  - Token validation
         │            - Data storage
         │
         ▼
┌─────────────────┐
│  PostgreSQL-like│  Convex Database
│  Database       │  - users, sessions, companies
└─────────────────┘  - Multi-tenant data
```

---

## Authentication Flow

### Registration Flow (2 Steps)

#### Step 1: Create User Account

```
User fills form (email, password, name, phone)
         ↓
POST /api/v1/auth/register-step1
         ↓
Backend:
  - Validates email format
  - Checks password strength (8+ chars, letters + numbers)
  - Hashes password (SHA-256)
  - Creates user record
  - Generates 30-day session token
  - Sends verification email
         ↓
Returns: { success, userId, token, email, verificationSent }
         ↓
Bubble saves: userId and token to custom state
         ↓
User sees: "Check your email for verification link"
```

#### Step 2: Verify Email

```
User clicks link in email
         ↓
GET /verify-email?token=abc123
         ↓
POST /api/v1/auth/verify-email
         ↓
Backend:
  - Validates token (24-hour expiry)
  - Marks email_verified = true
  - Marks token as used
         ↓
Returns: { success, message }
         ↓
User sees: "Email verified! Continue to company setup"
```

#### Step 3: Create Company

```
User fills company form
  - Company name
  - Business type (S.A.S, S.A., Ltda, etc.)
  - Company type (cannabis, coffee, cocoa, flowers)
  - Location (department, municipality)
         ↓
POST /api/v1/auth/register-step2
         ↓
Backend:
  - Validates user email is verified
  - Validates geographic location
  - Creates company record
  - Links user to company
  - Assigns COMPANY_OWNER role
         ↓
Returns: { success, userId, companyId }
         ↓
Bubble:
  - Creates/updates User record
  - Saves session_token field
  - "Log the user in" action
  - Navigate to Dashboard
```

---

### Login Flow

```
User enters email + password
         ↓
POST /api/v1/auth/login
         ↓
Backend validates:
  ✓ Email exists
  ✓ Password correct (hash comparison)
  ✓ Email verified
  ✓ Company exists
  ✓ Company status = active
         ↓
Backend generates NEW 30-day token
         ↓
Returns: {
  success: true,
  token: "a2g3YnI1M2RuazR5bWplNms...",
  userId: "j57abc...",
  companyId: "k98xyz...",
  user: { email, firstName, lastName, locale, preferredLanguage },
  company: { name, subscriptionPlan }
}
         ↓
Bubble:
  - Saves token to User.session_token field
  - Updates user info fields
  - "Log the user in" action (12-month Bubble session)
  - Navigate to Dashboard
```

---

### Protected Page Access

```
User navigates to /dashboard (or any protected page)
         ↓
Page Load Workflow runs
         ↓
GET /api/v1/auth/validate-token
Header: Authorization: Bearer {Current User's session_token}
         ↓
Backend validates:
  ✓ Token exists in database
  ✓ Token is_active = true
  ✓ Token not expired (<30 days old)
  ✓ User status = active
         ↓
If VALID:
  - Update last_used_at timestamp
  - Return user and company info
  - Page continues loading
         ↓
If INVALID:
  - Return { valid: false, error: "..." }
  - Bubble logs user out
  - Redirect to /login
```

---

### Logout Flow

```
User clicks "Logout" button
         ↓
POST /api/v1/auth/logout
Body: { token: "..." }
         ↓
Backend:
  - Find session by token
  - Set is_active = false
  - Set revoked_at = now
         ↓
Returns: { success: true }
         ↓
Bubble:
  - Clear User.session_token field
  - "Log the user out" action
  - Navigate to /login
```

---

## Session Token System

### Token Characteristics

- **Format:** URL-safe base64 string
- **Length:** ~43 characters
- **Generation:** Cryptographically secure random (32 bytes)
- **Validity:** 30 days from creation
- **Storage:** `sessions` table in Convex

### Token Lifecycle

```
1. CREATED
   - On registration (Step 1)
   - On login
   - Stored in sessions table

2. ACTIVE
   - is_active = true
   - expires_at > now
   - Used for API authentication

3. VALIDATED
   - On every API call
   - Updates last_used_at timestamp

4. EXPIRED/REVOKED
   - Auto-expired after 30 days
   - Manually revoked on logout
   - is_active = false
```

### Token Usage in API Calls

All protected endpoints require token in Authorization header:

```http
GET /api/v1/facilities
Authorization: Bearer a2g3YnI1M2RuazR5bWplNms...
```

**Bubble API Connector Setup:**
```
Headers:
  Authorization: Bearer <token>

Parameters:
  token = Current User's session_token (In header)
```

---

## Database Schema

### users Table

```typescript
{
  _id: Id<"users">
  company_id: Id<"companies"> | undefined  // Set in Step 2
  email: string                             // Unique, lowercase
  password_hash: string                     // SHA-256 hash
  email_verified: boolean                   // Required for login

  first_name: string
  last_name: string
  phone: string

  role_id: Id<"roles">                      // COMPANY_OWNER, etc.

  locale: string                            // "es"
  timezone: string                          // "America/Bogota"
  preferred_language: string                // "es" | "en"

  last_login: number                        // Timestamp
  failed_login_attempts: number             // Security

  status: "active" | "inactive" | "suspended"
  created_at: number
  updated_at: number
}
```

### sessions Table

```typescript
{
  _id: Id<"sessions">
  user_id: Id<"users">
  token: string                             // Unique, 43 chars
  expires_at: number                        // +30 days
  last_used_at: number                      // Updated on use

  is_active: boolean                        // true/false
  revoked_at: number                        // Logout timestamp

  created_at: number
}
```

### emailVerificationTokens Table

```typescript
{
  _id: Id<"emailVerificationTokens">
  user_id: Id<"users">
  email: string
  token: string                             // Random token
  expires_at: number                        // +24 hours
  verified_at: number                       // When verified
  used: boolean                             // Prevent reuse

  created_at: number
}
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register-step1` | Create user account |
| POST | `/api/v1/auth/verify-email` | Verify email address |
| POST | `/api/v1/auth/register-step2` | Create company |
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/auth/validate-token` | Validate session token |
| POST | `/api/v1/auth/logout` | Invalidate token |

See [BUBBLE_AUTH_ALQUEMIST.md](BUBBLE_AUTH_ALQUEMIST.md) for complete API documentation.

---

## Security Features

### Password Security

✅ **Implemented:**
- SHA-256 hashing with salt
- Minimum 8 characters
- Must contain letters + numbers
- Never stored in plain text
- Never returned in API responses

### Token Security

✅ **Implemented:**
- Cryptographically secure random generation
- 30-day automatic expiration
- One-time use verification tokens (24-hour expiry)
- Stored hashed in database
- Transmitted via HTTPS only
- Sent in Authorization header (not URL)

### Multi-Tenancy Security

✅ **Implemented:**
- Company-based data isolation
- Token validation includes company_id
- All queries filtered by validated company_id
- No cross-company data access

### Failed Login Protection

✅ **Implemented:**
- Track failed login attempts
- Increment counter on failed login
- Reset counter on successful login

🔄 **Planned:**
- Lock account after 5 failed attempts
- Unlock via email verification

---

## Common Issues & Solutions

### Issue 1: "Invalid or expired session"

**Symptoms:**
- User gets logged out immediately
- API calls fail with 401 error

**Solutions:**

1. **Check token is saved:**
   ```
   Bubble Workflow: Make changes to Current User
   → session_token = [API Response's token]
   ```

2. **Check token is sent in API calls:**
   ```
   API Call Headers:
   Authorization: Bearer <token>

   Parameter:
   token = Current User's session_token (In header)
   ```

3. **Check token expiration:**
   - Tokens expire after 30 days
   - User must login again for new token

4. **Check if revoked:**
   - Logout invalidates token
   - User must login again

---

### Issue 2: "Email not verified"

**Symptoms:**
- Cannot login after registration
- Error: "Debes verificar tu email antes de iniciar sesión"

**Solutions:**

1. Check email inbox (including spam)
2. Verification link expires after 24 hours
3. Request new verification email
4. Ensure email service is configured

---

### Issue 3: "Completa el paso 2 de registro"

**Symptoms:**
- Can login but get error about Step 2
- User has no company_id

**Solutions:**

1. Complete company setup (Step 2)
2. Navigate to `/company-setup` page
3. Fill company information form
4. Submit to complete registration

---

### Issue 4: Cannot access Dashboard

**Symptoms:**
- Redirected to login page immediately
- Token validation fails

**Solutions:**

1. **Check Page Load workflow:**
   ```
   Step 1: Auth_ValidateToken
     token = Current User's session_token

   Step 2: Only when Step 1's valid is "no"
     Log the user out
     Navigate to Login Page
   ```

2. **Check User data type:**
   - Ensure `session_token` field exists
   - Ensure it's populated after login

3. **Check API call is configured:**
   - URL: `/api/v1/auth/validate-token`
   - Method: GET
   - Header: Authorization: Bearer <token>

---

### Issue 5: Data leaking between companies

**Symptoms:**
- User A sees User B's data
- Wrong company data displayed

**Solutions:**

1. **Always validate token first:**
   ```typescript
   const validation = await ctx.runQuery(api.registration.validateToken, {
     token: args.token,
   });

   if (!validation.valid) {
     throw new Error("Invalid session");
   }
   ```

2. **Use validated company_id:**
   ```typescript
   const facilities = await ctx.db
     .query("facilities")
     .withIndex("by_company", (q) =>
       q.eq("company_id", validation.companyId)
     )
     .collect();
   ```

3. **Never trust company_id from frontend:**
   - Always get company_id from token validation
   - Never accept company_id as direct parameter

---

## Testing Guide

### Manual Testing Checklist

- [ ] **Registration Flow**
  - [ ] Can create account with valid email/password
  - [ ] Receive verification email
  - [ ] Can verify email with link
  - [ ] Can complete company setup
  - [ ] Redirected to dashboard after completion

- [ ] **Login Flow**
  - [ ] Can login with correct credentials
  - [ ] Cannot login with wrong password
  - [ ] Cannot login before email verification
  - [ ] Token saved to User data type
  - [ ] Redirected to dashboard

- [ ] **Protected Pages**
  - [ ] Dashboard accessible when logged in
  - [ ] Redirected to login when not logged in
  - [ ] Token validated on page load

- [ ] **Logout**
  - [ ] Can logout successfully
  - [ ] Token cleared from User data type
  - [ ] Cannot access dashboard after logout
  - [ ] Can login again after logout

- [ ] **Multi-Tenancy**
  - [ ] User A cannot see User B's data
  - [ ] Data filtered by company_id
  - [ ] API calls include token validation

### Automated Testing

```bash
# Test authentication endpoints
./scripts/test-auth.sh

# Test API with authentication
./scripts/test-api.sh
```

---

## Environment Variables

Required environment variables:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Email Service (for verification emails)
RESEND_API_KEY=re_...

# Optional: Custom configuration
SESSION_TOKEN_DAYS=30
VERIFICATION_TOKEN_HOURS=24
```

---

## Migration from Clerk (Historical)

**Note:** This project previously used Clerk authentication. It was replaced with custom authentication on November 12, 2025.

**Why we changed:**
- Simpler architecture for Bubble.io integration
- Full control over session management
- Reduced external dependencies
- No Clerk subscription required

**What was removed:**
- Clerk SDK and dependencies
- `convex/clerk.ts` integration file
- `convex/auth.config.ts` configuration
- Clerk organization sync
- OAuth providers

**What was added:**
- Custom password hashing (SHA-256)
- Session token system (30-day validity)
- Email verification system
- Token validation query
- Logout mutation

---

## Best Practices

### For Development

1. **Use realistic test data:**
   - Email: `test@example.com`
   - Password: `Test123!` (8+ chars, letters + numbers)
   - First Name: `Test`
   - Last Name: `User`

2. **Test complete flows:**
   - Registration → Verification → Company Setup → Login → Dashboard
   - Login → Protected Page Access → Logout

3. **Check token handling:**
   - Verify token is saved to User data type
   - Verify token is sent in API calls
   - Verify token validation works

4. **Test multi-tenancy:**
   - Create multiple companies
   - Verify data isolation

### For Production

1. **Password Security:**
   - Enforce strong passwords
   - Consider adding password strength meter
   - Implement rate limiting on login attempts

2. **Token Security:**
   - Always use HTTPS
   - Never log tokens
   - Implement token rotation (optional)
   - Monitor for suspicious activity

3. **Email Verification:**
   - Use reputable email service (Resend, SendGrid)
   - Configure SPF/DKIM records
   - Monitor email delivery rates

4. **Monitoring:**
   - Track failed login attempts
   - Monitor token expiration rates
   - Alert on suspicious patterns

---

## Related Documentation

- **[BUBBLE_AUTH_ALQUEMIST.md](BUBBLE_AUTH_ALQUEMIST.md)** - Complete Bubble.io setup guide
- **[API-Integration.md](../core/API-Integration.md)** - API integration guide
- **[PHASE-1-ENDPOINTS.md](../api/PHASE-1-ENDPOINTS.md)** - API endpoint reference
- **[SCHEMA.md](../database/SCHEMA.md)** - Database schema documentation

---

**Document Owner:** Tech Lead
**Last Review:** November 12, 2025
**Next Review:** When implementing MFA or OAuth
