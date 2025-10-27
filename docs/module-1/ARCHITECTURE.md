# Module 1 & 2: System Architecture

**Complete visual guide to how the registration system works**

---

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION JOURNEY                        │
└─────────────────────────────────────────────────────────────────────────┘

                              START HERE
                                  ↓
                    ┌─────────────────────────┐
                    │  STEP 1: Registration   │
                    │  (Bubble Page: /signup  │
                    │   -step-1)              │
                    └─────────────────────────┘
                              ↓
                 User enters personal information
                 • Email, Password, Name, Phone
                              ↓
         ┌─────────────────────────────────────┐
         │  Backend creates Convex user        │
         │  Generates verification token       │
         │  Sends verification email (Resend)  │
         └─────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────┐
         │    SUCCESS: Navigate to Step 2      │
         └─────────────────────────────────────┘
                              ↓
              ┌───────────────────────────────┐
              │  STEP 2: Email Verification   │
              │  (Bubble Page: /signup-verify │
              │   -email)                     │
              └───────────────────────────────┘
                              ↓
           User enters verification token from email
                              ↓
        ┌──────────────────────────────────────┐
        │  Backend verifies token              │
        │  Sets email_verified flag to true    │
        └──────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────┐
        │    SUCCESS: Navigate to Step 3       │
        └──────────────────────────────────────┘
                              ↓
             ┌────────────────────────────────┐
             │  STEP 3: Company Creation      │
             │  (Bubble Page: /signup-step-2) │
             └────────────────────────────────┘
                              ↓
        User enters company information:
        • Company Name, Type, Location
        • Selects Department → Municipality
                              ↓
    ┌─────────────────────────────────────────┐
    │  Backend:                               │
    │  1. Creates company record              │
    │  2. Links user to company               │
    │  3. Assigns OWNER role                  │
    │  4. Creates Clerk user with password    │
    │  5. Generates Clerk session             │
    │  6. Sends welcome email (Resend)        │
    └─────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────┐
    │    ✅ AUTO-LOGIN: User Logged In        │
    │    (Clerk session established)          │
    │    Welcome email sent                   │
    └─────────────────────────────────────────┘
                              ↓
              ┌──────────────────────────────┐
              │   REDIRECT TO DASHBOARD      │
              │   User can now access app    │
              └──────────────────────────────┘
```

---

## System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          ALQUEMIST PLATFORM                               │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌──────────────────────┐
│   BUBBLE FRONTEND   │         │   CONVEX BACKEND     │
│                     │         │                      │
│ • 3 Pages          │◄────────►│ • API Endpoints     │
│ • 5 API Connectors │  HTTP    │ • Database          │
│ • 7 Workflows      │  Requests│ • Business Logic    │
│                     │         │ • CORS              │
└─────────────────────┘         └──────────────────────┘
                                         ↓
                    ┌────────────────────────────────┐
                    │   EXTERNAL INTEGRATIONS        │
                    │                                │
                    │  • Resend (Email Service)      │
                    │  • Clerk (Authentication)      │
                    │  • Convex Database             │
                    └────────────────────────────────┘
```

---

## Detailed Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     BUBBLE FRONTEND (3 Pages)                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Page 1: /signup-step-1          Page 2: /signup-verify-email       │
│  ├─ Text: Title                  ├─ Text: Title                     │
│  ├─ Input: email_input           ├─ Input: token_input              │
│  ├─ Input: password_input        ├─ Button: verify_button           │
│  ├─ Input: firstName_input       ├─ Link: resend_link               │
│  ├─ Input: lastName_input        ├─ Text: error_message             │
│  ├─ Input: phone_input           ├─ Text: success_message           │
│  ├─ Button: register_button      │                                  │
│  ├─ Text: error_message          └─ Custom States:                  │
│  └─ Text: success_message           • verification_code             │
│                                      • is_verifying                  │
│  Custom States:                      • verification_complete        │
│  • current_user_id                   • resend_cooldown_seconds      │
│  • current_email                                                    │
│  • registration_token            Page 3: /signup-step-2             │
│  • registration_password         ├─ Input: company_name_input       │
│  • registration_first_name       ├─ Dropdown: business_type         │
│  • registration_last_name        ├─ Dropdown: company_type          │
│                                  ├─ Dropdown: department_dropdown   │
└────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │  5 API CONNECTORS             │
                    ├───────────────────────────────┤
                    │ 1. RegisterUserStep1          │
                    │ 2. VerifyEmailToken           │
                    │ 3. RegisterCompanyStep2       │
                    │ 4. GetDepartments             │
                    │ 5. GetMunicipalities          │
                    └───────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────┐
│              CONVEX BACKEND (HTTP Actions)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  convex/http.ts (530 lines)                                         │
│  ├─ CORS Handler (OPTIONS /*)                                      │
│  │                                                                  │
│  ├─ Geographic Endpoints:                                          │
│  │  ├─ POST /geographic/departments                               │
│  │  └─ POST /geographic/municipalities                            │
│  │                                                                  │
│  ├─ Registration Endpoints:                                        │
│  │  ├─ POST /registration/check-email                             │
│  │  ├─ POST /registration/register-step-1                         │
│  │  ├─ POST /registration/verify-email                            │
│  │  ├─ POST /registration/register-step-2                         │
│  │  ├─ POST /registration/login                                   │
│  │  └─ POST /registration/auto-login                              │
│  │                                                                  │
│  └─ Utility Endpoints:                                             │
│     └─ GET /health                                                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────┐
│           CORE BUSINESS LOGIC FUNCTIONS                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  convex/registration.ts                                            │
│  ├─ registerUserStep1()           convex/email.ts                  │
│  │  • Hash password               ├─ sendVerificationEmail()       │
│  │  • Create user record          │  • HTML template (Spanish)    │
│  │  • Generate token              │  • Verification link          │
│  │  • Send verification email     │  • Plain token                │
│  │                                │  • 24-hour expiry             │
│  ├─ verifyEmailToken()            │                               │
│  │  • Validate token              └─ sendWelcomeEmail()           │
│  │  • Set email_verified = true       • Company confirmation      │
│  │  • Single-use enforcement          • Next steps                 │
│  │                                                                  │
│  ├─ registerCompanyStep2()        convex/clerk.ts                  │
│  │  • Create company record       ├─ createClerkUser()            │
│  │  • Link user to company        │  • Search existing users      │
│  │  • Assign OWNER role           │  • Create user in Clerk       │
│  │  • Validate geographic data    │  • Create session             │
│  │                                │                               │
│  └─ autoLoginWithClerk()          └─ Session Management           │
│     • Create Clerk user              • Bearer token auth          │
│     • Generate session               • Session expiry             │
│     • Link to Convex user                                         │
│     • Send welcome email                                          │
│                                                                     │
│  convex/emailVerification.ts      convex/geographic.ts             │
│  ├─ Token generation              ├─ getDepartments()             │
│  ├─ 32-character random           │  • Query by country code      │
│  ├─ 24-hour expiry                │  • Return 32 departments      │
│  ├─ Single-use tracking           │                               │
│  ├─ Rate limiting                 └─ getMunicipalities()          │
│  │  • 5 resends per 5 minutes        • Filter by department       │
│  └─ Resend support                   • Return municipalities      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────┐
│                    CONVEX DATABASE                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  users (Table)                                                      │
│  ├─ _id (unique)                                                    │
│  ├─ email (unique, lowercase)          companies (Table)           │
│  ├─ password_hash (bcrypt)             ├─ _id (unique)             │
│  ├─ email_verified (boolean)           ├─ organization_id          │
│  ├─ company_id (FK → companies)        ├─ name                     │
│  ├─ clerk_id (FK → Clerk)              ├─ businessEntityType       │
│  ├─ firstName, lastName                ├─ companyType              │
│  ├─ phone                              ├─ country                  │
│  ├─ role_id (FK → roles)               ├─ departmentCode           │
│  ├─ locale, timezone                   ├─ municipalityCode         │
│  ├─ status (active/inactive)           ├─ subscription_plan        │
│  └─ _creationTime                      ├─ status                   │
│                                        └─ _creationTime            │
│  emailVerificationTokens (Table)                                   │
│  ├─ _id                          geographicLocations (Table)       │
│  ├─ token (32-char unique)       ├─ _id                           │
│  ├─ userId (FK → users)          ├─ country_code                  │
│  ├─ expiresAt                    ├─ country_name                  │
│  ├─ used (boolean)               ├─ division_1_code               │
│  └─ _creationTime                ├─ division_1_name               │
│                                  ├─ division_2_code               │
│  roles (Table)                   ├─ division_2_name               │
│  ├─ _id                          ├─ parent_division_1_code        │
│  ├─ name (COMPANY_OWNER, etc)   ├─ timezone                      │
│  └─ permissions                  └─ _creationTime                 │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  RESEND (Email Service)          CLERK (Authentication)            │
│  ├─ POST /emails                 ├─ POST /v1/users                │
│  ├─ Send verification email      ├─ GET /v1/users/{id}            │
│  ├─ Send welcome email           ├─ POST /v1/users/{id}/sessions  │
│  ├─ HTML + text templates        ├─ DELETE /v1/users/{id}         │
│  └─ Graceful fallback (dev)      └─ Session management            │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow During Registration

### Step 1: User Registration

```
Bubble Frontend                   Convex Backend              Resend
┌──────────────────┐             ┌──────────────────┐      ┌───────────┐
│ User fills form  │             │                  │      │   Email   │
│ & clicks register│             │                  │      │  Service  │
└────────┬─────────┘             └──────────────────┘      └───────────┘
         │                                 ▲
         │ POST /registration/            │
         │    register-step-1             │
         ├─────────────────────────────────►
         │                                │
         │                                │ 1. Validate fields
         │                                │ 2. Hash password
         │                                │ 3. Create user
         │                                │ 4. Generate token
         │                                │ 5. Send email
         │                                │
         │                                ├──────────────────────►
         │                                │  POST /emails
         │                                │  • Subject: "Verificar Email"
         │                                │  • To: user@example.com
         │                                │  • Body: HTML template
         │                                │  • Includes token + link
         │                                │                      ┌────────┐
         │                                │                      │ Queued │
         │                                ◄──────────────────────┤  for   │
         │                                │ { status: "queued" }  │sending │
         │                                │                      └────────┘
         │                       ┌────────┤
         │                       │ Return │
         │ Success Response◄─────┤ result │
         │ { success: true,      │        │
         │   userId: "...",      └────────┘
         │   token: "...",
         │   email: "..." }
         │
     Set states:
     • current_user_id
     • current_email
     • registration_token
     • registration_password
     • registration_first_name
     • registration_last_name
     │
     └─► Navigate to /signup-verify-email
```

### Step 2: Email Verification

```
Bubble Frontend                   Convex Backend
┌──────────────────┐             ┌──────────────────┐
│ User enters      │             │                  │
│ verification code│             │                  │
│ & clicks verify  │             │                  │
└────────┬─────────┘             └──────────────────┘
         │                                 ▲
         │ POST /registration/            │
         │    verify-email                │
         ├─────────────────────────────────►
         │                                │
         │                                │ 1. Find token record
         │                                │ 2. Check expiry
         │                                │ 3. Check not used
         │                                │ 4. Update used=true
         │                                │ 5. Set email_verified=true
         │                                │
         │ Success Response◄─────────────┤
         │ { success: true,
         │   userId: "..." }
         │
     Set state:
     • verification_complete = true
     │
     └─► Navigate to /signup-step-2
```

### Step 3: Company Creation + Auto-Login

```
Bubble Frontend                   Convex Backend              Clerk
┌──────────────────┐             ┌──────────────────┐      ┌───────────┐
│ User fills       │             │                  │      │ Authz     │
│ company form &   │             │                  │      │ Service   │
│ clicks create    │             │                  │      └───────────┘
└────────┬─────────┘             └──────────────────┘
         │                                 ▲
         │ POST /registration/            │
         │    register-step-2             │
         ├─────────────────────────────────►
         │                                │
         │                                │ 1. Create company
         │                                │ 2. Link user to company
         │                                │ 3. Assign OWNER role
         │                                │ 4. Validate location
         │                                │
         │ Response◄─────────────────────┤
         │ { success: true,
         │   companyId: "...",
         │   organizationId: "..." }
         │
         │ POST /registration/           │
         │    auto-login                 │
         ├─────────────────────────────────►
         │                                │
         │                                │ 1. Validate password
         │                                │ 2. Create Clerk user
         │                                │   (via email/password)
         │                                │
         │                                ├────────────────────────►
         │                                │ POST /v1/users
         │                                │ • email_address
         │                                │ • password
         │                                │ • first_name
         │                                │ • last_name
         │                                │
         │                                │                  ┌──────────┐
         │                                │                  │ User     │
         │                                │                  │ created  │
         │                                ◄──────────────────┤ with ID  │
         │                                │ { id: "user_..." }└──────────┘
         │                                │
         │                                │ 3. Create session
         │                                │
         │                                ├────────────────────────►
         │                                │ POST /v1/users/.../
         │                                │     sessions
         │                                │
         │                                │                  ┌──────────┐
         │                                ◄──────────────────┤ Session  │
         │                                │ { id: "sess_..." }│ created  │
         │                                │                  └──────────┘
         │                                │
         │                                │ 4. Send welcome email
         │                                │ 5. Return session info
         │                                │
         │ Success Response◄─────────────┤
         │ { success: true,
         │   clerkUserId: "user_...",
         │   sessionId: "sess_...",
         │   redirectUrl: "/dashboard" }
         │
     User is now logged in!
     │
     └─► Navigate to /dashboard
         (User can access authenticated pages)
```

---

## Workflow Sequence Diagrams

### Complete Registration Flow (Sequence Diagram)

```
User          Bubble              Convex           Resend           Clerk
 │              │                   │                 │               │
 │──Register────►│                   │                 │               │
 │              │──POST register-step-1──►                            │
 │              │                   │                 │               │
 │              │                   ├─ Hash password  │               │
 │              │                   │                 │               │
 │              │                   ├─ Create user    │               │
 │              │                   │                 │               │
 │              │                   ├─ Generate token │               │
 │              │                   │                 │               │
 │              │                   ├─ Send email────────────────►    │
 │              │                   │                 │               │
 │              │  ◄─ Response ──────┤                 │       Queued  │
 │              │   {userId, token}  │                 │               │
 │              │                   │                 │               │
 │ ◄─ Redirect──┤                   │                 │               │
 │  to verify   │                   │                 │               │
 │              │                   │                 │               │
 │              │  ┌─────────────────────────────────────────────┐   │
 │              │  │ User receives email with token + link      │   │
 │              │  └─────────────────────────────────────────────┘   │
 │              │                   │                 │               │
 │─ Copy token─►│                   │                 │               │
 │ or click link │                   │                 │               │
 │              │                   │                 │               │
 │──Verify──────►│                   │                 │               │
 │              │──POST verify-email────►              │               │
 │              │                   │                 │               │
 │              │                   ├─ Validate token│               │
 │              │                   │                 │               │
 │              │                   ├─ Set verified  │               │
 │              │                   │                 │               │
 │              │  ◄─ Response ──────┤                 │               │
 │              │   {success: true}  │                 │               │
 │              │                   │                 │               │
 │ ◄─ Redirect──┤                   │                 │               │
 │  to company  │                   │                 │               │
 │  creation    │                   │                 │               │
 │              │                   │                 │               │
 │──Company─────►│                   │                 │               │
 │  Info        │──POST register-step-2──►            │               │
 │              │                   │                 │               │
 │              │                   ├─ Create company│               │
 │              │                   │                 │               │
 │              │                   ├─ Assign role   │               │
 │              │                   │                 │               │
 │              │  ◄─ Response ──────┤                 │               │
 │              │   {companyId}      │                 │               │
 │              │                   │                 │               │
 │              │──POST auto-login───►                 │               │
 │              │                   │                 │               │
 │              │                   ├─ Create Clerk user──────────┐   │
 │              │                   │                 │           │   │
 │              │                   │                 │       ┌───┴──►
 │              │                   │                 │       │
 │              │                   │                 │       ├─ Create session
 │              │                   │                 │       │
 │              │                   │  ◄──────────────────────┤
 │              │                   │    {userId, sessionId}  │
 │              │                   │                 │       │
 │              │                   ├─ Send welcome email───────────►
 │              │                   │                 │               │
 │              │  ◄─ Response ──────┤                 │       Queued  │
 │              │   {sessionId}      │                 │               │
 │              │                   │                 │               │
 │ ◄─ Logged in─┤                   │                 │               │
 │              │                   │                 │               │
 │  ┌──────────────────────────────────────────────────────────────┐ │
 │  │ User can now access authenticated pages & dashboard          │ │
 │  │ Session persists across page reloads                         │ │
 │  └──────────────────────────────────────────────────────────────┘ │
```

---

## Technology Stack

### Frontend (Bubble)
- **Platform**: Bubble.io (Visual Programming)
- **Components**: Pages, Inputs, Buttons, Dropdowns, Workflows
- **Data Binding**: Dynamic data, custom states, page data
- **API Integration**: API Connector plugin (native)

### Backend (Convex)
- **Platform**: Convex (Backend-as-a-Service)
- **Language**: TypeScript
- **Runtime**: Node.js environment
- **Database**: Convex internal database
- **API Type**: HTTP Actions (REST endpoints)

### Email Service
- **Provider**: Resend.com
- **Integration**: HTTP API (REST)
- **Templates**: HTML + Text (Spanish)
- **Features**: Verification links, token display, welcome emails

### Authentication Service
- **Provider**: Clerk.com
- **Integration**: HTTP API (REST)
- **Features**: User creation, session management, organization linking
- **Security**: Secure password hashing, Bearer token authentication

### Database
- **Type**: Convex (Cloud-based)
- **Schema**: Typed with TypeScript
- **Tables**: Users, Companies, Roles, EmailVerificationTokens, GeographicLocations
- **Indexing**: Optimized for common queries

---

## Security Considerations

### Password Security
```
User Password
    ↓
bcrypt hashing algorithm
    ↓
Stored as: password_hash (salted & hashed)
```
- Passwords are hashed with bcrypt (industry standard)
- Never stored in plain text
- Salt prevents rainbow table attacks
- Work factor prevents brute force

### Email Verification
```
User Registration
    ↓
Generate 32-character random token
    ↓
Store with 24-hour expiry
    ↓
Mark as "used" once verified
    ↓
Rate limit: 5 resends per 5 minutes
```
- Tokens are cryptographically random
- Single-use enforcement prevents replay attacks
- 24-hour expiry prevents indefinite validity
- Rate limiting prevents brute force attacks

### Clerk Integration
```
User Password + Email
    ↓
Transmitted to Clerk via HTTPS
    ↓
Clerk creates user and session
    ↓
Session token returned to Bubble
    ↓
Session persists across requests
```
- HTTPS ensures encryption in transit
- Clerk handles password storage securely
- Bearer token authentication for sessions
- Session expiry prevents unauthorized access

### CORS Security
```
HTTP Request from Bubble
    ↓
Check Origin header
    ↓
If origin matches BUBBLE_APP_URL → Allow
    ↓
Otherwise → Reject (403)
```
- Only allowed origins can make requests
- Prevents cross-site request forgery (CSRF)
- Environment-configurable for flexibility

---

## Performance Considerations

### Database Queries
- User email lookup: Indexed by email address
- Company queries: Foreign key constraints
- Geographic queries: Optimized for department filtering

### API Response Times
- Typical response: 100-500ms
- Geographic data: Pre-seeded and cached
- Email sending: Asynchronous (non-blocking)

### Scaling
- Convex handles auto-scaling
- Resend handles high email volume
- Clerk handles user load
- No single point of failure

---

## Error Handling Flow

```
User Action
    ↓
    ├─ Validation Error (Bubble client-side)
    │  ├─ Show error message
    │  └─ Don't make API call
    │
    ├─ API Error (Bubble → Convex)
    │  ├─ Network error
    │  │  ├─ Show: "Connection error"
    │  │  └─ Retry available
    │  │
    │  └─ Business Logic Error
    │     ├─ Email already exists
    │     ├─ Invalid token
    │     ├─ Location not found
    │     └─ Show specific error message
    │
    └─ Integration Error (Resend/Clerk)
       ├─ Email sending fails (graceful fallback)
       ├─ Clerk user creation fails (partial success)
       └─ Log error & allow continuation
```

---

## Deployment Architecture

```
PRODUCTION DEPLOYMENT

Bubble Frontend              Convex Backend              Convex Database
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│ yourapp.     │◄───HTTP───►│ Exciting     │◄─────────►│ Convex Cloud │
│ bubbleapps.io│            │ Shrimp 34    │            │ Database     │
└──────────────┘            └──────────────┘            └──────────────┘
                                    ▼
                          ┌──────────────────┐
                          │ External Services│
                          ├──────────────────┤
                          │ Resend (Email)   │
                          │ Clerk (Auth)     │
                          └──────────────────┘
```

### Convex Deployment
- Automatically scales
- Zero configuration needed
- HTTPS/TLS enabled by default
- Geo-redundant database

### Environment Variables
```
.env.local (Development)
├─ CONVEX_DEPLOYMENT=exciting-shrimp-34
├─ CLERK_SECRET_KEY=sk_test_...
├─ RESEND_API_KEY=re_test_...
└─ BUBBLE_APP_URL=http://localhost:8000

Production (via Convex env set)
├─ CONVEX_DEPLOYMENT=exciting-shrimp-34
├─ CLERK_SECRET_KEY=sk_live_...
├─ RESEND_API_KEY=re_live_...
└─ BUBBLE_APP_URL=https://production-app.bubbleapps.io
```

---

## Summary

This architecture provides:

✅ **Separation of Concerns**: Bubble (UI) ↔ Convex (Logic) ↔ Services (Email/Auth)
✅ **Security**: Encrypted passwords, secure tokens, CORS protection
✅ **Reliability**: External services handle edge cases, graceful fallbacks
✅ **Scalability**: Auto-scaling backend, unlimited API requests
✅ **Maintainability**: Clear API boundaries, typed backend code
✅ **Developer Experience**: Visual frontend development, serverless backend

The system is designed to be:
- **Simple** for Bubble developers to understand
- **Robust** against common failures
- **Secure** following industry best practices
- **Scalable** without architectural changes

---

**Ready to implement? Start with [BUBBLE-DEVELOPER-GUIDE.md](./BUBBLE-DEVELOPER-GUIDE.md)! 🚀**
