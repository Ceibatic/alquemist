# API Integration Guide

**Alquemist Backend Integration**

Complete reference for integrating Bubble or other frontends with the Alquemist backend using custom authentication.

**Last Updated:** November 12, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Convex HTTP API](#convex-http-api)
4. [Error Handling](#error-handling)
5. [Bubble Integration](#bubble-integration)
6. [Code Examples](#code-examples)
7. [Data Models](#data-models)

---

## Overview

Alquemist provides direct integration with the Convex backend using **custom session token authentication**.

### Architecture

**Simple Direct Connection:** Bubble → Convex HTTP API (with custom auth)

```
┌─────────────────────────┐
│     Frontend App        │
│   (Bubble.io)           │
└────────┬────────────────┘
         │
         │ HTTPS/API Calls
         │ Authorization: Bearer {session_token}
         │
         ▼
┌─────────────────────────┐
│   Convex HTTP API       │
│   (Custom Auth)         │
│   - Register/Login      │
│   - Token Validation    │
│   - Business Logic      │
│   - Database Access     │
└─────────────────────────┘
```

**Benefits:**
- ✅ Simple architecture
- ✅ Fast (direct connection)
- ✅ Secure (token-based auth)
- ✅ Multi-tenant (company isolation)
- ✅ No external auth dependencies

---

### Base URLs

**Convex HTTP API:**
```
Production: https://handsome-jay-388.convex.site
```

Find your deployment URL in `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://handsome-jay-388.convex.site
```

---

### Response Format

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-11-12T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Authentication

Alquemist uses **custom session tokens** for authentication. Each token is valid for **30 days** and provides secure access to the API.

### Authentication Flow

```
1. REGISTER (Step 1)
   POST /api/v1/auth/register-step1
   → Returns: { token, userId }

2. VERIFY EMAIL
   POST /api/v1/auth/verify-email
   → Email must be verified before Step 2

3. REGISTER (Step 2)
   POST /api/v1/auth/register-step2
   → Creates company, links to user

4. LOGIN
   POST /api/v1/auth/login
   → Returns: { token, userId, companyId }

5. USE TOKEN
   All subsequent API calls use token in header:
   Authorization: Bearer {token}
```

---

### Token Characteristics

- **Format:** URL-safe base64 string (~43 characters)
- **Validity:** 30 days from creation
- **Storage:** Database (sessions table)
- **Security:** Cryptographically secure random generation
- **Transmission:** Authorization header only (not in URL)

---

### Authentication Endpoints

#### 1. Register User (Step 1)

**POST** `/api/v1/auth/register-step1`

Creates user account and sends verification email.

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

**Bubble Usage:**
- Save `token` to User data type field: `session_token`
- Save `userId` to custom state for Step 2
- Show "Check your email" message

---

#### 2. Verify Email

**POST** `/api/v1/auth/verify-email`

Verifies email address using token from email link.

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

---

#### 3. Register Company (Step 2)

**POST** `/api/v1/auth/register-step2`

Creates company and links to user.

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

---

#### 4. Login

**POST** `/api/v1/auth/login`

Authenticates user and returns new session token.

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

**Bubble Usage:**
- Save `token` to User data type: `session_token`
- Save user info to User data type
- "Log the user in" action
- Navigate to Dashboard

---

#### 5. Validate Token

**GET** `/api/v1/auth/validate-token`

Validates session token and returns user context.

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

**Invalid Token Response:**
```json
{
  "valid": false,
  "error": "Token expirado"
}
```

**Bubble Usage:**
- Call on every protected page load
- If `valid: false` → Log user out, redirect to login

---

#### 6. Logout

**POST** `/api/v1/auth/logout`

Invalidates session token.

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

**Bubble Usage:**
- Clear User data type: `session_token` field
- "Log the user out" action
- Navigate to Login page

---

## Convex HTTP API

All business logic endpoints (facilities, batches, activities, etc.) use the Convex HTTP API.

### Base URL

```
https://handsome-jay-388.convex.site/api
```

### Endpoint Pattern

**Queries (GET data):**
```
GET /api/query/[module]:[functionName]?args={"param":"value"}
```

**Mutations (POST/PATCH/DELETE data):**
```
POST /api/mutation/[module]:[functionName]
Body: {"param": "value"}
```

### Headers Required

**All protected endpoints require:**
```
Authorization: Bearer [session-token]
Content-Type: application/json
```

---

### Example: List Facilities

**Endpoint:**
```
GET https://handsome-jay-388.convex.site/api/query/facilities:list
```

**Headers:**
```
Authorization: Bearer a2g3YnI1M2RuazR5bWplNms...
Content-Type: application/json
```

**Query Parameters:**
```javascript
?args={"token": "a2g3YnI1M2RuazR5bWplNms..."}
```

**Response:**
```json
[
  {
    "_id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "company_id": "k98xyz...",
    "name": "Cultivo Principal",
    "license_number": "LIC-2024-001",
    "facility_type": "greenhouse",
    "status": "active",
    "created_at": 1704902400000
  }
]
```

---

### Example: Create Facility

**Endpoint:**
```
POST https://handsome-jay-388.convex.site/api/mutation/facilities:create
```

**Headers:**
```
Authorization: Bearer a2g3YnI1M2RuazR5bWplNms...
Content-Type: application/json
```

**Body:**
```json
{
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "name": "Cultivo Principal",
  "license_number": "LIC-2024-001",
  "license_type": "INVIMA",
  "facility_type": "greenhouse",
  "address": "Km 5 Vía Medellín",
  "city": "Rionegro",
  "administrative_division_1": "Antioquia",
  "latitude": 6.1477,
  "longitude": -75.3736,
  "altitude_meters": 2125,
  "total_area_m2": 5000,
  "status": "active"
}
```

**Response:**
```json
"jn7cx3afzv7zs555nrkp0pq9rx7s7c6d"
```
(Returns the new facility ID)

---

### Available Convex Functions

See `convex/` directory for all available functions:

**Authentication:**
- `registration:registerUserStep1` (mutation)
- `registration:verifyEmail` (mutation)
- `registration:registerCompanyStep2` (mutation)
- `registration:login` (mutation)
- `registration:validateToken` (query)
- `registration:logout` (mutation)

**Companies:**
- `companies:list` (query)
- `companies:get` (query)
- `companies:create` (mutation)
- `companies:update` (mutation)

**Facilities:**
- `facilities:list` (query)
- `facilities:get` (query)
- `facilities:create` (mutation)
- `facilities:update` (mutation)
- `facilities:delete` (mutation)

**Batches:**
- `batches:list` (query)
- `batches:get` (query)
- `batches:create` (mutation)
- `batches:update` (mutation)

**Activities:**
- `activities:list` (query)
- `activities:create` (mutation)

**Compliance:**
- `compliance:list` (query)
- `compliance:create` (mutation)

**Inventory:**
- `inventory:list` (query)
- `inventory:create` (mutation)

---

### Token Validation in Backend

Every protected Convex function should validate the token:

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

    // 2. Use validated company context
    const companyId = validation.companyId;

    // 3. Query data with multi-tenant isolation
    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    return facilities;
  },
});
```

---

## Error Handling

### HTTP Status Codes

- `200` OK - Successful request
- `201` Created - Resource created successfully
- `400` Bad Request - Invalid request format
- `401` Unauthorized - Authentication required or token invalid
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `422` Validation Error - Input validation failed
- `500` Internal Server Error - Server error

### Error Codes

- `UNAUTHORIZED` - Not authenticated or token invalid/expired
- `VALIDATION_FAILED` - Input validation failed
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_STOCK` - Not enough inventory
- `BATCH_NOT_FOUND` - Batch does not exist
- `FACILITY_NOT_FOUND` - Facility does not exist
- `COMPANY_INACTIVE` - Company account inactive

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "name": ["Company name is required"],
      "tax_id": ["Invalid format"]
    }
  }
}
```

---

## Bubble Integration

### Setup Steps

#### 1. Configure API Connector

In Bubble, go to **Plugins → API Connector** and configure:

**Name:** Alquemist API
**Authentication:** None (token sent per call)
**Base URL:** `https://handsome-jay-388.convex.site`

---

#### 2. Add Auth API Calls

**Call: Register Step 1**
- Name: `Auth_RegisterStep1`
- Use as: Action
- Method: POST
- URL: `/api/v1/auth/register-step1`
- Body type: JSON
- Body:
```json
{
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>"
}
```
- Parameters:
  - `email` (text, private)
  - `password` (text, private)
  - `firstName` (text, private)
  - `lastName` (text, private)
  - `phone` (text, private, optional)

**Return values:**
- `success` - boolean
- `userId` - text
- `token` - text
- `email` - text
- `message` - text

---

**Call: Login**
- Name: `Auth_Login`
- Use as: Action
- Method: POST
- URL: `/api/v1/auth/login`
- Body:
```json
{
  "email": "<email>",
  "password": "<password>"
}
```
- Parameters:
  - `email` (text, private)
  - `password` (text, private)

**Return values:**
- `success` - boolean
- `token` - text
- `userId` - text
- `companyId` - text
- `user` - object
- `company` - object

---

**Call: Validate Token**
- Name: `Auth_ValidateToken`
- Use as: Data
- Method: GET
- URL: `/api/v1/auth/validate-token`
- Headers:
  - `Authorization`: `Bearer <token>`
- Parameters:
  - `token` (text, private, in header)

---

**Call: Logout**
- Name: `Auth_Logout`
- Use as: Action
- Method: POST
- URL: `/api/v1/auth/logout`
- Body:
```json
{
  "token": "<token>"
}
```

---

#### 3. Add Business Logic API Calls

**Call: List Facilities**
- Name: `Facilities_List`
- Use as: Data
- Method: GET
- URL: `/api/query/facilities:list?args={"token":"<token>"}`
- Parameters:
  - `token` (text, private)

**Call: Create Facility**
- Name: `Facilities_Create`
- Use as: Action
- Method: POST
- URL: `/api/mutation/facilities:create`
- Body:
```json
{
  "token": "<token>",
  "name": "<name>",
  "license_number": "<license_number>",
  "facility_type": "<facility_type>",
  "address": "<address>",
  "city": "<city>",
  "administrative_division_1": "<state>",
  "total_area_m2": <total_area>,
  "status": "active"
}
```

---

#### 4. User Data Type Setup

Create these fields in User data type:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `session_token` | text | **CRITICAL** - stores API auth token |
| `convex_user_id` | text | User ID from backend |
| `convex_company_id` | text | Company ID from backend |
| `first_name` | text | |
| `last_name` | text | |
| `company_name` | text | For display |
| `preferred_language` | text | "es" or "en" |

---

#### 5. Authentication Workflows

**Login Button Workflow:**
```
Step 1: Auth_Login
  email = Input Email's value
  password = Input Password's value

Step 2: Only when Step 1's success is "yes"
  Make changes to Current User:
    session_token = Step 1's token
    convex_user_id = Step 1's userId
    convex_company_id = Step 1's companyId
    first_name = Step 1's user's firstName
    last_name = Step 1's user's lastName
    company_name = Step 1's company's name
    preferred_language = Step 1's user's preferredLanguage

Step 3: Log the user in
  email = Input Email's value

Step 4: Navigate to Dashboard

Step 5: Only when Step 1's success is "no"
  Show alert: "Invalid email or password"
```

**Protected Page Load Workflow:**
```
Step 1: Auth_ValidateToken
  token = Current User's session_token

Step 2: Only when Step 1's valid is "no"
  Log the user out
  Navigate to Login Page

Step 3: Only when Step 1's valid is "yes"
  (Continue loading page)
```

**Logout Button Workflow:**
```
Step 1: Auth_Logout
  token = Current User's session_token

Step 2: Make changes to Current User
  session_token = (empty)

Step 3: Log the user out

Step 4: Navigate to Login Page
```

---

#### 6. Data Fetching Example

**Repeating Group - List Facilities:**
- Type of content: External (Facilities_List)
- Data source: Get data from external API
  - API: Alquemist API - Facilities_List
  - token: Current User's session_token

**Text Element - Facility Name:**
- Text: Current cell's Facility's name

---

#### 7. Create/Update Example

**Create Facility Button Workflow:**
```
Step 1: Show loading spinner

Step 2: Facilities_Create
  token = Current User's session_token
  name = Input Facility Name's value
  license_number = Input License's value
  facility_type = Dropdown Type's value
  address = Input Address's value
  city = Input City's value
  state = Dropdown State's value
  total_area = Input Area's value:rounded to 0

Step 3: Hide spinner

Step 4: Show alert: "Facility created!"

Step 5: Navigate to facilities page

Step 6: Only when Step 2 failed
  Show alert: "Error creating facility"
```

---

### Error Handling in Bubble

**Handle 401 Unauthorized (Token Expired):**
```
Step X: API Call
Step X+1: Only when Step X's status code = 401
  Clear Current User's session_token
  Log the user out
  Navigate to login page
  Show alert: "Session expired, please login again"
```

**Handle Validation Errors:**
```
Step X: API Call
Step X+1: Only when Step X failed
  Show alert: Step X's error's message
```

---

### Best Practices for Bubble

1. **Store Token Securely:**
   - Save `session_token` to User data type
   - Mark as private in privacy rules
   - Never display token to user

2. **Validate on Every Page:**
   - Call `Auth_ValidateToken` on page load
   - Redirect to login if invalid

3. **Handle Token Expiration:**
   - Tokens expire after 30 days
   - Check for 401 errors
   - Force re-login when needed

4. **Loading States:**
   - Show spinner before API calls
   - Hide spinner after completion
   - Disable buttons during calls

5. **Error Messages:**
   - Display user-friendly error messages
   - Log technical details to console
   - Provide clear next steps

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Login and get token
async function login(email: string, password: string) {
  const response = await fetch('https://handsome-jay-388.convex.site/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error.message)
  }

  // Store token for future requests
  localStorage.setItem('session_token', result.token)

  return result
}

// List facilities with authentication
async function getFacilities() {
  const token = localStorage.getItem('session_token')

  const response = await fetch(
    `https://handsome-jay-388.convex.site/api/query/facilities:list?args=${encodeURIComponent(JSON.stringify({ token }))}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const facilities = await response.json()
  return facilities
}

// Create facility
async function createFacility(facilityData: any) {
  const token = localStorage.getItem('session_token')

  const response = await fetch(
    'https://handsome-jay-388.convex.site/api/mutation/facilities:create',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        ...facilityData,
      }),
    }
  )

  const result = await response.json()
  return result
}

// Logout
async function logout() {
  const token = localStorage.getItem('session_token')

  await fetch('https://handsome-jay-388.convex.site/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  localStorage.removeItem('session_token')
}
```

### Python

```python
import requests

class AlquemistAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session_token = None

    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/api/v1/auth/login',
            json={'email': email, 'password': password}
        )
        result = response.json()

        if not result['success']:
            raise Exception(result['error']['message'])

        self.session_token = result['token']
        return result

    def get_facilities(self):
        if not self.session_token:
            raise Exception('Not authenticated')

        response = requests.get(
            f'{self.base_url}/api/query/facilities:list',
            headers={'Authorization': f'Bearer {self.session_token}'},
            params={'args': json.dumps({'token': self.session_token})}
        )

        return response.json()

    def create_facility(self, facility_data):
        if not self.session_token:
            raise Exception('Not authenticated')

        response = requests.post(
            f'{self.base_url}/api/mutation/facilities:create',
            headers={'Authorization': f'Bearer {self.session_token}'},
            json={'token': self.session_token, **facility_data}
        )

        return response.json()

    def logout(self):
        if self.session_token:
            requests.post(
                f'{self.base_url}/api/v1/auth/logout',
                json={'token': self.session_token}
            )
            self.session_token = None

# Usage
api = AlquemistAPI('https://handsome-jay-388.convex.site')
api.login('user@example.com', 'password123')
facilities = api.get_facilities()
api.logout()
```

---

## Data Models

### Business Entity Types (Colombia)

- `S.A.S` - Sociedad por Acciones Simplificada
- `S.A.` - Sociedad Anónima
- `Ltda` - Limitada
- `E.U.` - Empresa Unipersonal
- `Persona Natural`

### Company Types

- `cannabis`
- `coffee`
- `cocoa`
- `flowers`
- `mixed`

### Facility Types

- `indoor`
- `outdoor`
- `greenhouse`
- `mixed`

### Batch Types

- `propagation`
- `growth`
- `harvest`

### Activity Types

- `watering`
- `feeding`
- `pruning`
- `transplanting`
- `harvest`
- `inspection`
- `pest_treatment`
- `quality_check`
- `other`

### Compliance Event Categories

- `ica` - Agricultural authority (Colombia)
- `invima` - Health authority for cannabis (Colombia)
- `municipal` - Local government
- `fnc` - Coffee federation (Colombia)

---

## Rate Limits

**Current:** No rate limits enforced
**Future:** 1000 requests/hour per company

---

## Related Documentation

- **[BUBBLE_AUTH_ALQUEMIST.md](../foundation/BUBBLE_AUTH_ALQUEMIST.md)** - Complete Bubble authentication setup
- **[Authentication-Guide.md](../foundation/Authentication-Guide.md)** - Authentication system overview
- **[PHASE-1-ENDPOINTS.md](../api/PHASE-1-ENDPOINTS.md)** - API endpoint reference
- **[SCHEMA.md](../database/SCHEMA.md)** - Database schema documentation

---

**Last Updated:** November 12, 2025
**API Version:** 1.0.0
