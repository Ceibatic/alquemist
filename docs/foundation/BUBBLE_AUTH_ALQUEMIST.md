# Bubble Authentication Setup - Alquemist

**Last Updated:** November 12, 2025
**Status:** Active
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Setup (Convex)](#backend-setup-convex)
4. [Bubble.io Setup](#bubbleio-setup)
5. [Authentication Workflows](#authentication-workflows)
6. [API Integration](#api-integration)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

---

## Overview

Alquemist uses **custom authentication** with session tokens for Bubble.io integration. This guide provides complete setup instructions for implementing the authentication system.

### Key Features

- ✅ Custom email/password authentication
- ✅ 30-day session tokens for API calls
- ✅ Two-step registration (Email → Company)
- ✅ Email verification required
- ✅ Multi-tenancy (company-based isolation)
- ✅ Role-based access control (RBAC)

### What We Don't Use

- ❌ Clerk authentication (removed)
- ❌ OAuth providers (not needed for Phase 1)
- ❌ Magic links (email/password only)

---

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Register User (registerUserStep1)             │
│  - Create user in database                              │
│  - Hash password (SHA-256)                              │
│  - Generate 30-day session token                        │
│  - Send verification email                              │
│  Returns: { token, userId, email }                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Email Verification (verifyEmail)                       │
│  - User clicks link in email                            │
│  - Token validated (24-hour expiry)                     │
│  - Mark email_verified = true                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Create Company (registerCompanyStep2)         │
│  - Create company record                                │
│  - Link user to company                                 │
│  - Assign COMPANY_OWNER role                            │
│  Returns: { companyId }                                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              LOGIN TO DASHBOARD                          │
│  User is now fully registered and can access app        │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                      USER LOGIN                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Login (login mutation)                                 │
│  - Verify email/password                                │
│  - Check email verified                                 │
│  - Check company exists                                 │
│  - Generate new 30-day session token                    │
│  - Update last_login timestamp                          │
│  Returns: { token, userId, companyId, user, company }   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Bubble Session Creation                                │
│  - Save token to User data type field                   │
│  - "Log the user in" (Bubble action)                    │
│  - Navigate to Dashboard                                │
└─────────────────────────────────────────────────────────┘
```

### Session Token Flow

```
┌──────────────────┐
│  Bubble Frontend │
└────────┬─────────┘
         │ 1. API Call with token in header
         │    Authorization: Bearer {token}
         ▼
┌──────────────────┐
│  Convex Backend  │
│  validateToken   │──────┐
└────────┬─────────┘      │ 2. Validate token
         │                │    - Check exists
         │                │    - Check is_active
         │                │    - Check not expired
         │                │    - Update last_used_at
         │◄───────────────┘
         │ 3. Return user/company info
         ▼
┌──────────────────┐
│  Business Logic  │
│  (API Endpoint)  │
└────────┬─────────┘
         │ 4. Process request with user context
         ▼
┌──────────────────┐
│  Response        │
└──────────────────┘
```

---

## Backend Setup (Convex)

### Database Schema

The following tables support authentication:

#### 1. **users** Table

```typescript
users: defineTable({
  // Company & Authentication
  company_id: v.optional(v.id("companies")),
  email: v.string(),
  password_hash: v.string(),
  email_verified: v.boolean(),
  email_verified_at: v.optional(v.number()),

  // Personal Information
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  phone: v.optional(v.string()),

  // Roles & Access
  role_id: v.id("roles"),

  // Preferences
  locale: v.string(), // Default: "es"
  preferred_language: v.optional(v.string()), // "es" | "en"

  // Security
  last_login: v.optional(v.number()),
  failed_login_attempts: v.number(),
  account_locked_until: v.optional(v.number()),

  // Status
  status: v.string(), // active/inactive/suspended
  created_at: v.number(),
  updated_at: v.number(),
})
.index("by_email", ["email"])
.index("by_company", ["company_id"])
```

#### 2. **sessions** Table

```typescript
sessions: defineTable({
  user_id: v.id("users"),
  token: v.string(), // Random session token (30-day validity)
  expires_at: v.number(), // 30 days from creation
  last_used_at: v.optional(v.number()),

  // Device/Client Information
  user_agent: v.optional(v.string()),
  ip_address: v.optional(v.string()),

  // Status
  is_active: v.boolean(),
  revoked_at: v.optional(v.number()),

  created_at: v.number(),
})
.index("by_token", ["token"])
.index("by_user", ["user_id"])
.index("by_expires", ["expires_at"])
.index("by_is_active", ["is_active"])
```

#### 3. **emailVerificationTokens** Table

```typescript
emailVerificationTokens: defineTable({
  user_id: v.id("users"),
  email: v.string(),
  token: v.string(), // Random token sent in email link
  expires_at: v.number(), // 24 hours from creation
  verified_at: v.optional(v.number()),
  used: v.boolean(),
  created_at: v.number(),
})
.index("by_token", ["token"])
.index("by_email", ["email"])
```

### API Endpoints

#### **POST /api/v1/auth/register-step1**

Register user (step 1 of 2)

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+573001234567"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "j57abc...",
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "email": "juan@example.com",
  "message": "Cuenta creada. Por favor verifica tu correo electrónico.",
  "verificationSent": true
}
```

**Convex Function:** `registration.registerUserStep1`

---

#### **POST /api/v1/auth/verify-email**

Verify email address

**Request:**
```json
{
  "token": "abc123verificationtoken"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

**Convex Function:** `emailVerification.verifyEmail`

---

#### **POST /api/v1/auth/register-step2**

Create company (step 2 of 2)

**Request:**
```json
{
  "userId": "j57abc...",
  "companyName": "Cultivos El Sol",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "j57abc...",
  "companyId": "k98xyz...",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente."
}
```

**Convex Function:** `registration.registerCompanyStep2`

---

#### **POST /api/v1/auth/login**

User login

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "userId": "j57abc...",
  "companyId": "k98xyz...",
  "user": {
    "email": "juan@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "locale": "es",
    "preferredLanguage": "es"
  },
  "company": {
    "name": "Cultivos El Sol",
    "subscriptionPlan": "trial"
  }
}
```

**Convex Function:** `registration.login`

---

#### **GET /api/v1/auth/validate-token**

Validate session token

**Headers:**
```
Authorization: Bearer a2g3YnI1M2RuazR5bWplNms...
```

**Response:**
```json
{
  "valid": true,
  "userId": "j57abc...",
  "companyId": "k98xyz...",
  "user": {
    "email": "juan@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "locale": "es",
    "preferredLanguage": "es",
    "roleId": "r12role..."
  },
  "company": {
    "id": "k98xyz...",
    "name": "Cultivos El Sol",
    "status": "active",
    "subscriptionPlan": "trial"
  }
}
```

**Convex Function:** `registration.validateToken`

---

#### **POST /api/v1/auth/logout**

Logout (invalidate token)

**Request:**
```json
{
  "token": "a2g3YnI1M2RuazR5bWplNms..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Convex Function:** `registration.logout`

---

## Bubble.io Setup

### 1. Data Types Setup

#### **User Data Type**

Create/modify the User data type with these fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `email` | email | Primary identifier |
| `first_name` | text | |
| `last_name` | text | |
| `phone` | text | Optional |
| `session_token` | text | **CRITICAL** - stores API auth token |
| `convex_user_id` | text | User ID from Convex |
| `convex_company_id` | text | Company ID from Convex |
| `company_name` | text | For display |
| `role` | text | User role (COMPANY_OWNER, etc.) |
| `preferred_language` | text | "es" or "en" |
| `locale` | text | "es" or "en-US" |
| `subscription_plan` | text | trial/basic/premium |

#### **Company Data Type** (Optional - for caching)

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `convex_company_id` | text | Company ID from Convex |
| `name` | text | Company name |
| `status` | text | active/suspended |
| `subscription_plan` | text | trial/basic/premium |

### 2. API Connector Setup

**Base URL:** `https://handsome-jay-388.convex.site`

#### API Call: **Register Step 1**

- **Name:** `Auth_RegisterStep1`
- **Use as:** Action
- **Data type:** JSON
- **Method:** POST
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/register-step1`

**Body (JSON):**
```json
{
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>"
}
```

**Headers:**
```
Content-Type: application/json
```

**Parameters:**
- `email` (text) - Private
- `password` (text) - Private
- `firstName` (text) - Private
- `lastName` (text) - Private
- `phone` (text) - Private, Optional

**Initialize:**
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+573001234567"
}
```

**Return values (manual configuration):**
- `success` - boolean
- `userId` - text
- `token` - text
- `email` - text
- `message` - text
- `verificationSent` - boolean

---

#### API Call: **Verify Email**

- **Name:** `Auth_VerifyEmail`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/verify-email`

**Body:**
```json
{
  "token": "<verificationToken>"
}
```

**Parameters:**
- `verificationToken` (text) - Private

---

#### API Call: **Register Step 2**

- **Name:** `Auth_RegisterStep2`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/register-step2`

**Body:**
```json
{
  "userId": "<userId>",
  "companyName": "<companyName>",
  "businessEntityType": "<businessEntityType>",
  "companyType": "<companyType>",
  "country": "<country>",
  "departmentCode": "<departmentCode>",
  "municipalityCode": "<municipalityCode>"
}
```

**Parameters:**
- `userId` (text) - Private
- `companyName` (text) - Private
- `businessEntityType` (text) - Private
- `companyType` (text) - Private
- `country` (text) - Private
- `departmentCode` (text) - Private
- `municipalityCode` (text) - Private

**Return values:**
- `success` - boolean
- `userId` - text
- `companyId` - text
- `message` - text

---

#### API Call: **Login**

- **Name:** `Auth_Login`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/login`

**Body:**
```json
{
  "email": "<email>",
  "password": "<password>"
}
```

**Parameters:**
- `email` (text) - Private
- `password` (text) - Private

**Return values:**
- `success` - boolean
- `token` - text
- `userId` - text
- `companyId` - text
- `user` - (nested object)
  - `email` - text
  - `firstName` - text
  - `lastName` - text
  - `locale` - text
  - `preferredLanguage` - text
- `company` - (nested object)
  - `name` - text
  - `subscriptionPlan` - text

---

#### API Call: **Validate Token**

- **Name:** `Auth_ValidateToken`
- **Use as:** Data (GET)
- **Method:** GET
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/validate-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `token` (text) - Private, In header

**Return values:**
- `valid` - boolean
- `userId` - text
- `companyId` - text
- `user` - (nested object)
- `company` - (nested object)

---

#### API Call: **Logout**

- **Name:** `Auth_Logout`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://handsome-jay-388.convex.site/api/v1/auth/logout`

**Body:**
```json
{
  "token": "<token>"
}
```

**Parameters:**
- `token` (text) - Private

---

### 3. Page Setup

#### **Signup Page**

**Elements:**
- Input: Email
- Input: Password
- Input: First Name
- Input: Last Name
- Input: Phone (optional)
- Button: Create Account
- Text: Error messages
- Text: Success messages

**Custom States:**
- `userId` (text) - Stores user ID from step 1
- `sessionToken` (text) - Stores session token
- `currentStep` (number) - 1 or 2

**Workflow: When Create Account Button is Clicked**

```
Step 1: Auth_RegisterStep1
  email = Input Email's value
  password = Input Password's value
  firstName = Input First Name's value
  lastName = Input Last Name's value
  phone = Input Phone's value

Step 2: Only when: Step 1's success is "yes"
  Set state userId = Step 1's userId
  Set state sessionToken = Step 1's token
  Set state currentStep = 1
  Show element "Verification Sent Message"
  Display: "Check your email for verification link"

Step 3: Only when: Step 1's success is "no"
  Show element "Error Message"
  Display: Step 1's message
```

---

#### **Email Verification Page**

**Page URL:** `/verify-email?token=<token>`

**Elements:**
- Text: Verification status
- Button: Continue to Company Setup

**Workflow: When Page is Loaded**

```
Step 1: Auth_VerifyEmail
  verificationToken = Get token from page URL

Step 2: Only when: Step 1's success is "yes"
  Show element "Success Message"
  Display: "Email verified! Continue to company setup"

Step 3: Only when: Step 1's success is "no"
  Show element "Error Message"
  Display: "Invalid or expired verification link"
```

---

#### **Company Setup Page** (Step 2)

**Elements:**
- Input: Company Name
- Dropdown: Business Entity Type
- Dropdown: Company Type
- Dropdown: Department
- Dropdown: Municipality
- Button: Complete Registration

**Workflow: When Complete Registration is Clicked**

```
Step 1: Auth_RegisterStep2
  userId = Current User's convex_user_id (or custom state)
  companyName = Input Company Name's value
  businessEntityType = Dropdown Business Entity's value
  companyType = Dropdown Company Type's value
  country = "CO"
  departmentCode = Dropdown Department's value
  municipalityCode = Dropdown Municipality's value

Step 2: Only when: Step 1's success is "yes"
  Create/Update User
    email = Current User's email
    convex_company_id = Step 1's companyId
    company_name = Input Company Name's value

Step 3: Navigate to Dashboard
```

---

#### **Login Page**

**Elements:**
- Input: Email
- Input: Password
- Button: Sign In
- Link: Forgot Password
- Link: Create Account

**Workflow: When Sign In Button is Clicked**

```
Step 1: Auth_Login
  email = Input Email's value
  password = Input Password's value

Step 2: Only when: Step 1's success is "yes"
  Sign the user up  (if new user)
    email = Step 1's user's email
    password = Input Password's value  (any value, won't be used)

  OR

  Log the user in  (if existing user)
    email = Step 1's user's email

Step 3: Make changes to Current User
  session_token = Step 1's token
  convex_user_id = Step 1's userId
  convex_company_id = Step 1's companyId
  first_name = Step 1's user's firstName
  last_name = Step 1's user's lastName
  company_name = Step 1's company's name
  subscription_plan = Step 1's company's subscriptionPlan
  preferred_language = Step 1's user's preferredLanguage
  locale = Step 1's user's locale

Step 4: Navigate to Dashboard

Step 5: Only when: Step 1's success is "no"
  Show element "Error Message"
  Display: "Invalid email or password"
```

**CRITICAL:** The `session_token` field MUST be saved to the User data type. This token is used for ALL subsequent API calls.

---

#### **Dashboard Page** (Protected)

**Page Load Workflow: Validate Session**

```
Step 1: Auth_ValidateToken
  token = Current User's session_token

Step 2: Only when: Step 1's valid is "no"
  Log the user out
  Navigate to Login Page

Step 3: Only when: Step 1's valid is "yes"
  (Continue loading dashboard)
```

---

### 4. Reusable Elements

#### **Header** (with Logout)

**Elements:**
- Text: Current User's first_name
- Button: Logout

**Workflow: When Logout Button is Clicked**

```
Step 1: Auth_Logout
  token = Current User's session_token

Step 2: Make changes to Current User
  session_token = (empty)
  convex_user_id = (empty)
  convex_company_id = (empty)

Step 3: Log the user out

Step 4: Navigate to Login Page
```

---

## Authentication Workflows

### Full Registration Flow

1. **User fills signup form**
   - Email, password, first name, last name, phone

2. **Bubble calls `Auth_RegisterStep1`**
   - Convex creates user
   - Generates session token (30 days)
   - Sends verification email
   - Returns: `{ token, userId }`

3. **Bubble saves token and userId to custom state**
   - Shows "Check your email" message

4. **User clicks verification link in email**
   - Opens `/verify-email?token=abc123`

5. **Bubble calls `Auth_VerifyEmail`**
   - Convex marks email as verified
   - Shows "Email verified!" message

6. **User proceeds to company setup**
   - Fills company form (name, type, location)

7. **Bubble calls `Auth_RegisterStep2`**
   - Convex creates company
   - Links user to company
   - Returns: `{ companyId }`

8. **Bubble creates/updates User record**
   - Saves `session_token` (from step 2)
   - Saves `convex_user_id`, `convex_company_id`

9. **Bubble logs user in**
   - "Log the user in" action
   - Navigate to Dashboard

### Login Flow

1. **User fills login form**
   - Email, password

2. **Bubble calls `Auth_Login`**
   - Convex validates credentials
   - Generates NEW session token (30 days)
   - Returns: `{ token, userId, companyId, user, company }`

3. **Bubble saves token to User data type**
   - Update `session_token` field
   - Update other user fields

4. **Bubble logs user in**
   - "Log the user in" action (12-month Bubble session)
   - Navigate to Dashboard

### Protected Page Flow

1. **User navigates to protected page**

2. **Page load workflow validates token**
   - Call `Auth_ValidateToken` with `Current User's session_token`

3. **If valid:**
   - Continue loading page

4. **If invalid (token expired, revoked, or missing):**
   - Log user out
   - Navigate to Login Page

---

## API Integration

### Using Session Tokens in API Calls

For ALL authenticated API calls, include the session token in the Authorization header:

**Example API Call Setup:**

```
API Call: Get_Facilities
Method: GET
URL: /api/v1/facilities

Headers:
  Authorization: Bearer <token>

Parameters:
  token = Current User's session_token (In header)
```

**Backend (Convex) Validation:**

Every protected endpoint should first validate the token:

```typescript
export const getFacilities = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate token
    const validation = await ctx.runQuery(api.registration.validateToken, {
      token: args.token,
    });

    if (!validation.valid) {
      throw new Error("Invalid or expired session");
    }

    // 2. Use validated user/company context
    const companyId = validation.companyId;

    // 3. Query data with proper isolation
    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    return facilities;
  },
});
```

---

## Testing Guide

### 1. Test Registration (Step 1)

**Test Case:** Register new user

**Steps:**
1. Go to Signup page
2. Enter email: `test@example.com`
3. Enter password: `Test123!`
4. Enter first name: `Test`
5. Enter last name: `User`
6. Click "Create Account"

**Expected:**
- ✅ Success message shown
- ✅ "Check your email" message displayed
- ✅ Email sent to inbox
- ✅ Custom state `userId` is populated
- ✅ Custom state `sessionToken` is populated

**Debug:**
- Open Bubble debugger
- Check API call `Auth_RegisterStep1`
- Verify response contains `token` and `userId`

---

### 2. Test Email Verification

**Test Case:** Verify email address

**Steps:**
1. Check email inbox
2. Click verification link
3. Should open `/verify-email?token=...`

**Expected:**
- ✅ "Email verified!" message shown
- ✅ Button to continue to company setup

**Debug:**
- Check API call `Auth_VerifyEmail`
- Verify `success: true` in response

---

### 3. Test Company Creation (Step 2)

**Test Case:** Complete registration with company

**Steps:**
1. Enter company name: `Test Company`
2. Select business type: `S.A.S`
3. Select company type: `cannabis`
4. Select department: `Antioquia`
5. Select municipality: `Medellín`
6. Click "Complete Registration"

**Expected:**
- ✅ Company created
- ✅ User logged in
- ✅ Redirected to Dashboard
- ✅ User's `company_name` field populated

**Debug:**
- Check API call `Auth_RegisterStep2`
- Verify `companyId` in response
- Check that User data type has `session_token` saved

---

### 4. Test Login

**Test Case:** Login with existing credentials

**Steps:**
1. Go to Login page
2. Enter email: `test@example.com`
3. Enter password: `Test123!`
4. Click "Sign In"

**Expected:**
- ✅ User logged in
- ✅ Redirected to Dashboard
- ✅ Header shows user's first name
- ✅ User's `session_token` updated

**Debug:**
- Check API call `Auth_Login`
- Verify `token` in response is different from previous token (new token generated)
- Verify `Current User's session_token` is updated

---

### 5. Test Token Validation

**Test Case:** Validate session token

**Steps:**
1. Login as user
2. Navigate to Dashboard
3. Check Bubble debugger for `Auth_ValidateToken` call

**Expected:**
- ✅ Token validated successfully
- ✅ `valid: true` in response
- ✅ User info returned

**Debug:**
- Check API call `Auth_ValidateToken`
- Verify `valid: true`
- Verify `userId` and `companyId` match Current User

---

### 6. Test Logout

**Test Case:** Logout user

**Steps:**
1. Login as user
2. Click "Logout" button

**Expected:**
- ✅ Session token invalidated
- ✅ User logged out
- ✅ Redirected to Login page
- ✅ Cannot access Dashboard (redirects back to Login)

**Debug:**
- Check API call `Auth_Logout`
- Verify `success: true`
- Verify `Current User's session_token` is empty

---

### 7. Test Token Expiration

**Test Case:** Use expired token

**Steps:**
1. Manually expire token in Convex (set `expires_at` to past timestamp)
2. Try to access protected page

**Expected:**
- ✅ Token validation fails
- ✅ User logged out
- ✅ Redirected to Login page

---

## Troubleshooting

### Issue: "Invalid or expired session" error

**Symptoms:**
- User gets logged out immediately after login
- API calls fail with "Invalid or expired session"

**Solutions:**
1. Check that `session_token` is being saved to User data type
   - Workflow: Make changes to Current User → session_token = [API response token]

2. Check that token is being sent in API calls
   - All protected API calls should have: `Authorization: Bearer <token>`
   - Parameter: `token = Current User's session_token`

3. Check token expiration
   - Tokens expire after 30 days
   - User must login again to get new token

4. Check if token was revoked
   - If user logged out, token is invalidated
   - User must login again

---

### Issue: "Email not verified" on login

**Symptoms:**
- User created account but cannot login
- Error: "Debes verificar tu email antes de iniciar sesión"

**Solutions:**
1. Check email inbox (including spam folder)
2. Resend verification email
3. Verify token in email has not expired (24 hours)

---

### Issue: User created but no company

**Symptoms:**
- User can login but sees "Complete step 2" error
- `company_id` is null

**Solutions:**
1. User must complete Step 2 (Company Setup)
2. Navigate user to `/company-setup` page
3. Complete company form

---

### Issue: API calls returning wrong company data

**Symptoms:**
- User A sees User B's data
- Data leaking between companies

**Solutions:**
1. **CRITICAL:** Always validate token and use `companyId` from validation
2. Never trust company ID from frontend
3. Always filter queries by validated `companyId`:
   ```typescript
   const facilities = await ctx.db
     .query("facilities")
     .withIndex("by_company", (q) => q.eq("company_id", validation.companyId))
     .collect();
   ```

---

### Issue: Session expires too quickly

**Symptoms:**
- User gets logged out after a few hours
- Bubble session expires but token is still valid

**Solutions:**
1. Check Bubble session settings:
   - Settings → General → Session timeout
   - Increase to 12 months for web apps

2. Token validity is 30 days (configured in backend)
   - User must login again after 30 days

---

### Issue: Cannot create API call in Bubble

**Symptoms:**
- API Connector shows "Invalid JSON"
- Cannot initialize call

**Solutions:**
1. Ensure JSON body is valid
2. Use double quotes `"` not single quotes `'`
3. Parameters in `<angle brackets>` not `{curly braces}`
4. Initialize with real test data first, then convert to parameters

---

## Security Considerations

### 1. Password Security

✅ **What we do:**
- Hash passwords with SHA-256
- Salt passwords with app-specific salt
- Never store plain text passwords
- Validate password strength (8+ chars, letters + numbers)

❌ **What we don't do:**
- Store passwords in plain text
- Log passwords
- Send passwords in API responses

---

### 2. Token Security

✅ **What we do:**
- Generate cryptographically secure random tokens (32 bytes)
- Store tokens in database with expiration
- Validate token on every API call
- Invalidate token on logout
- Update `last_used_at` timestamp

❌ **What we don't do:**
- Use predictable tokens
- Send token in URL query parameters (use headers)
- Reuse tokens after logout

---

### 3. Multi-Tenancy Security

✅ **What we do:**
- Validate user's company_id on every query
- Filter all queries by validated company_id
- Never trust company_id from frontend
- Use database indexes for efficient filtering

❌ **What we don't do:**
- Allow cross-company data access
- Trust company_id from API parameters without validation

---

### 4. Email Verification Security

✅ **What we do:**
- Require email verification before company creation
- Expire verification tokens after 24 hours
- Mark tokens as "used" to prevent reuse
- Validate email format

❌ **What we don't do:**
- Allow unverified users to access app
- Reuse verification tokens
- Send verification links via SMS (email only)

---

### 5. Failed Login Protection

✅ **What we do:**
- Track failed login attempts
- Lock account after threshold (planned)
- Reset counter on successful login

🔄 **To implement:**
- Lock account after 5 failed attempts
- Require password reset to unlock

---

## Related Documentation

- [Database Schema](../database/SCHEMA.md) - Complete database structure
- [API Phase 1 Endpoints](../api/PHASE-1-ENDPOINTS.md) - All API endpoints
- [i18n Strategy](../i18n/STRATEGY.md) - Internationalization approach

---

**Document Owner:** Tech Lead
**Last Review:** November 12, 2025
**Next Review:** When adding OAuth or MFA
