# API Integration Guide

**Alquemist Backend Integration**

Complete reference for integrating Bubble or other frontends with the Alquemist backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Convex HTTP API](#convex-http-api) (Recommended)
4. [Next.js REST API](#nextjs-rest-api) (Optional)
5. [Error Handling](#error-handling)
6. [Bubble Integration](#bubble-integration)
7. [Code Examples](#code-examples)

---

## Overview

Alquemist provides **two integration options**:

### Option 1: Direct Connection (Recommended - START SIMPLE)

**Architecture:** Bubble → Clerk API + Convex HTTP API

```
┌─────────────────────────┐
│     Frontend App        │
│   (Bubble/Next.js)      │
└────────┬────────────────┘
         │
         ├─→ Clerk API (Authentication)
         │   https://[your-frontend-api].clerk.accounts.dev
         │   • Sign in/Sign up
         │   • JWT tokens
         │
         └─→ Convex HTTP API (Database)
             https://[your-deployment].convex.cloud/api
             • Queries: GET /api/query/[functionName]
             • Mutations: POST /api/mutation/[functionName]
             • JWT validation automatic
```

**Benefits:**
- ✅ Faster (1 less network hop)
- ✅ Cheaper (no Vercel costs)
- ✅ Simpler (less code to maintain)
- ✅ Real-time capable

**Use for:** Modules 1-10, simple CRUD operations

---

### Option 2: Via Next.js API (Optional - ADD WHEN NEEDED)

**Architecture:** Bubble → Next.js API → Convex

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

**Use when you need:**
- Complex business logic
- Multi-step operations
- Rate limiting
- Custom caching

---

### Base URLs

**Convex HTTP API:**
```
Development: https://[dev-deployment].convex.cloud/api
Production: https://[prod-deployment].convex.cloud/api
```

**Clerk API:**
```
https://[your-frontend-api].clerk.accounts.dev
```

**Next.js API (Optional):**
```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

### Response Format

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional additional details */ }
  },
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z"
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "meta": {
    "timestamp": "2025-01-09T10:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

---

## Authentication

### Clerk JWT Authentication (Direct)

Alquemist uses **Clerk** for authentication with JWT tokens.

#### Step 1: Sign In via Clerk API

⚠️ **Important:** No Clerk plugin exists for Bubble - implement manually.

**Endpoint:** `POST https://[your-frontend-api].clerk.accounts.dev/v1/client/sign_ins`

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "client": {
    "sessions": [{
      "id": "sess_xxx",
      "user": {
        "id": "user_xxx",
        "email_addresses": [...]
      },
      "last_active_token": {
        "jwt": "eyJhbGc..." // ← This is your JWT token
      }
    }]
  }
}
```

#### Step 2: Extract JWT Token

From the Clerk response, extract:
```javascript
const jwtToken = response.client.sessions[0].last_active_token.jwt
```

**Token contains:**
- User ID (`sub` claim)
- Organization ID (`org_id` claim)
- Expiration (`exp` claim)
- Signature (validated by Convex)

#### Step 3: Use JWT in API Requests

**For Convex HTTP API:**
```
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
```

**For Next.js API (if used):**
```
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
```

#### Step 4: Token Validation

**Convex validates automatically:**
- JWT signature verified
- Organization ID extracted
- User identity available in `ctx.auth.getUserIdentity()`
- Multi-tenant isolation enforced

**No separate token verification endpoint needed** - Convex handles it transparently.

---

### Clerk API Endpoints

**Sign In:**
```
POST https://[your-frontend-api].clerk.accounts.dev/v1/client/sign_ins
```

**Sign Up:**
```
POST https://[your-frontend-api].clerk.accounts.dev/v1/client/sign_ups
```

**Get Session:**
```
GET https://[your-frontend-api].clerk.accounts.dev/v1/client/sessions/[session_id]
```

**Create Organization:**
```
POST https://[your-frontend-api].clerk.accounts.dev/v1/organizations
```

For complete Clerk API reference, see: https://clerk.com/docs/reference/frontend-api

---

## Convex HTTP API

⚠️ **Recommended Method - START SIMPLE**

### Base URL

```
https://[your-deployment].convex.cloud/api
```

Find your deployment URL in `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
```

---

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

---

### Headers Required

```
Authorization: Bearer [clerk-jwt-token]
Content-Type: application/json
```

---

### Example: List Companies

**Endpoint:**
```
GET https://[deployment].convex.cloud/api/query/companies:list
```

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Finca Los Andes",
    "company_type": "agricultural",
    "status": "active",
    "created_at": 1704902400000
  }
]
```

---

### Example: Get Company

**Endpoint:**
```
GET https://[deployment].convex.cloud/api/query/companies:get?args={"id":"company123"}
```

**Query Parameters:**
- `args` - JSON object with function arguments

**Response:**
```json
{
  "id": "company123",
  "name": "Finca Los Andes",
  "status": "active"
}
```

---

### Example: Create Facility

**Endpoint:**
```
POST https://[deployment].convex.cloud/api/mutation/facilities:create
```

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Body:**
```json
{
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

**Companies:**
- `companies:list` (query) - List all companies for current org
- `companies:get` (query) - Get single company by ID
- `companies:create` (mutation) - Create new company
- `companies:update` (mutation) - Update company

**Facilities:**
- `facilities:list` (query) - List facilities
- `facilities:get` (query) - Get facility by ID
- `facilities:create` (mutation) - Create facility
- `facilities:update` (mutation) - Update facility
- `facilities:delete` (mutation) - Soft delete facility

**Batches:**
- `batches:list` (query) - List batches
- `batches:get` (query) - Get batch by ID
- `batches:create` (mutation) - Create batch
- `batches:update` (mutation) - Update batch

**Activities:**
- `activities:list` (query) - List activities
- `activities:create` (mutation) - Log new activity

**Compliance:**
- `compliance:list` (query) - List compliance events
- `compliance:create` (mutation) - Create compliance event

**Inventory:**
- `inventory:list` (query) - List inventory items
- `inventory:create` (mutation) - Create inventory item

---

### Error Responses

Convex returns errors in this format:

```json
{
  "error": {
    "message": "Not authenticated",
    "code": "Unauthenticated"
  }
}
```

**Common Error Codes:**
- `Unauthenticated` - Invalid or missing JWT token
- `NotFound` - Resource not found
- `InvalidArgument` - Invalid function arguments
- `PermissionDenied` - User lacks permissions

---

## Next.js REST API

⚠️ **Optional - Only use when complexity requires it**

### When to Use

Use Next.js API layer when you need:
- Complex business logic
- Multi-step operations
- Rate limiting
- Custom caching
- Data transformations

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

### API Endpoints

### Health Check

**GET /api/v1**

Check API status and available endpoints.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Alquemist API",
    "version": "1.0.0",
    "status": "operational",
    "endpoints": {
      "auth": "/api/v1/auth",
      "companies": "/api/v1/companies",
      "facilities": "/api/v1/facilities",
      "batches": "/api/v1/batches",
      "activities": "/api/v1/activities",
      "compliance": "/api/v1/compliance",
      "inventory": "/api/v1/inventory"
    }
  }
}
```

---

### Authentication

#### Get Current Session

**GET /api/v1/auth/session**

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_xxx",
    "sessionId": "sess_xxx",
    "organizationId": "org_xxx",
    "user": {
      "id": "user_xxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### Companies

#### Get Current Company

**GET /api/v1/companies**

**Response:**
```json
{
  "success": true,
  "data": {
    "organizationId": "org_xxx",
    "userId": "user_xxx"
  }
}
```

#### Create Company

**POST /api/v1/companies**

**Request Body:**
```json
{
  "name": "Finca Los Andes",
  "legal_name": "Finca Los Andes S.A.S",
  "tax_id": "900123456-7",
  "company_type": "agricultural",
  "business_entity_type": "S.A.S",
  "country": "CO",
  "default_locale": "es",
  "default_currency": "COP",
  "default_timezone": "America/Bogota"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "org_xxx",
    "name": "Finca Los Andes",
    "created_at": "2025-01-09T10:30:00Z"
  }
}
```

---

### Facilities

#### List Facilities

**GET /api/v1/facilities**

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

#### Create Facility

**POST /api/v1/facilities**

**Request Body:**
```json
{
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

**Response:** `201 Created`

#### Get Facility

**GET /api/v1/facilities/:id**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fac_xxx",
    "name": "Cultivo Principal",
    "status": "active"
  }
}
```

#### Update Facility

**PATCH /api/v1/facilities/:id**

**Request Body:** (partial update)
```json
{
  "status": "inactive"
}
```

#### Delete Facility

**DELETE /api/v1/facilities/:id**

**Response:** `204 No Content`

---

### Batches

#### List Batches

**GET /api/v1/batches**

**Query Parameters:**
- `facility_id` (optional): Filter by facility
- `area_id` (optional): Filter by area
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Create Batch

**POST /api/v1/batches**

**Request Body:**
```json
{
  "facility_id": "fac_xxx",
  "area_id": "area_xxx",
  "crop_type_id": "crop_cannabis",
  "cultivar_id": "cult_xxx",
  "batch_type": "growth",
  "tracking_level": "batch",
  "planned_quantity": 500,
  "current_quantity": 500,
  "initial_quantity": 500,
  "unit_of_measure": "plants",
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "bat_xxx",
    "qr_code": "BAT-1704794400000",
    "planned_quantity": 500,
    "created_date": "2025-01-09T10:30:00Z"
  }
}
```

---

### Activities

#### List Activities

**GET /api/v1/activities**

**Query Parameters:**
- `entity_type` (optional): batch/plant/area
- `entity_id` (optional): Filter by entity
- `activity_type` (optional): Filter by type
- `page`, `limit` (optional)

#### Log Activity

**POST /api/v1/activities**

**Request Body:**
```json
{
  "entity_type": "batch",
  "entity_id": "bat_xxx",
  "activity_type": "watering",
  "duration_minutes": 30,
  "notes": "Watered all plants in greenhouse",
  "materials_consumed": [
    {
      "product_id": "prod_water",
      "quantity": 500,
      "unit": "L"
    }
  ],
  "environmental_data": {
    "temperature": 24.5,
    "humidity": 65,
    "ph": 6.2
  }
}
```

**Response:** `201 Created`

---

### Compliance

#### List Compliance Events

**GET /api/v1/compliance**

**Query Parameters:**
- `event_category` (optional): ica/invima/municipal/fnc
- `status` (optional): open/in_progress/resolved/closed
- `facility_id` (optional)
- `page`, `limit` (optional)

#### Create Compliance Event

**POST /api/v1/compliance**

**Request Body:**
```json
{
  "event_type": "inspection",
  "event_category": "invima",
  "entity_type": "facility",
  "entity_id": "fac_xxx",
  "facility_id": "fac_xxx",
  "title": "INVIMA Routine Inspection",
  "description": "Quarterly compliance inspection",
  "severity": "medium",
  "status": "open",
  "due_date": "2025-02-01T00:00:00Z"
}
```

**Response:** `201 Created`

---

### Inventory

#### List Inventory Items

**GET /api/v1/inventory**

**Query Parameters:**
- `area_id` (optional)
- `product_id` (optional)
- `lot_status` (optional): available/reserved/expired/quarantine
- `page`, `limit` (optional)

#### Create Inventory Item

**POST /api/v1/inventory**

**Request Body:**
```json
{
  "product_id": "prod_xxx",
  "area_id": "area_xxx",
  "quantity_available": 100,
  "quantity_unit": "kg",
  "batch_number": "BATCH-2025-001",
  "lot_status": "available"
}
```

**Response:** `201 Created`

---

## Error Handling

### HTTP Status Codes

- `200` OK - Successful request
- `201` Created - Resource created successfully
- `204` No Content - Successful deletion
- `400` Bad Request - Invalid request format
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Resource conflict
- `422` Validation Error - Input validation failed
- `500` Internal Server Error - Server error

### Error Codes

- `BAD_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate)
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected error

### Validation Errors

When validation fails, the response includes field-specific errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
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

⚠️ **Important:** No Clerk or Convex plugins exist for Bubble - all integration is manual via API Connector.

### Setup Steps

#### 1. Configure Clerk API Connector

In Bubble, go to **Plugins → API Connector** and add:

**Name:** Clerk Auth API
**Authentication:** None (we'll add JWT per call)

**Add Call - Sign In:**
- Name: `clerk_sign_in`
- Use as: **Action**
- Method: **POST**
- URL: `https://[your-frontend-api].clerk.accounts.dev/v1/client/sign_ins`
- Body type: **JSON**
- Body:
```json
{
  "identifier": "<email>",
  "password": "<password>"
}
```
- Parameters: `email` (text), `password` (text, private)

**Extract JWT Token:**
After successful sign in, extract JWT from:
```
Result of Step 1's client's sessions:first item's last_active_token's jwt
```

Store in Custom State: `session_jwt` (type: text)

---

#### 2. Configure Convex API Connector

**Name:** Convex Database API
**Authentication:** Private key in header

**Shared Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Add Call - List Companies (Query Example):**
- Name: `convex_list_companies`
- Use as: **Data**
- Method: **GET**
- URL: `https://[deployment].convex.cloud/api/query/companies:list`
- Headers: Authorization: Bearer `<jwt_token>` (make parameter)
- Parameter: `jwt_token` (text, private)

**Add Call - Create Facility (Mutation Example):**
- Name: `convex_create_facility`
- Use as: **Action**
- Method: **POST**
- URL: `https://[deployment].convex.cloud/api/mutation/facilities:create`
- Headers: Authorization: Bearer `<jwt_token>` (parameter)
- Body type: **JSON**
- Body:
```json
{
  "name": "<name>",
  "facility_type": "<facility_type>",
  "license_number": "<license_number>",
  "address": "<address>",
  "city": "<city>",
  "administrative_division_1": "<state>",
  "total_area_m2": <total_area>,
  "status": "active"
}
```
- Parameters: `jwt_token`, `name`, `facility_type`, etc.

---

#### 3. Authentication Workflow

**Page Load Workflow:**
```
Step 1: Get jwt_token from Custom State: session_jwt
Step 2 (Only when jwt_token is empty):
  - Navigate to login page

Step 3 (Only when jwt_token is not empty):
  - Set page to ready
```

**Login Button Workflow:**
```
Step 1: Show loading spinner
Step 2: Clerk API - clerk_sign_in
  - email: Input Email's value
  - password: Input Password's value
Step 3: Set state session_jwt = Result's client's sessions:first item's last_active_token's jwt
Step 4: Navigate to dashboard
Step 5 (Only when Step 2 failed):
  - Show alert: "Login failed"
  - Hide spinner
```

---

#### 4. Data Fetching Example

**Repeating Group - List Facilities:**
- Type of content: Facility
- Data source: Get data from external API
  - API: Convex Database API - convex_list_facilities
  - jwt_token: Custom State session_jwt

**Text Element - Company Name:**
- Data source: Get data from external API
  - API: Convex Database API - convex_get_company
  - jwt_token: Custom State session_jwt
- Text: Result of Step 1's name

---

#### 5. Create/Update Example

**Create Facility Button Workflow:**
```
Step 1: Show loading spinner
Step 2: Convex API - convex_create_facility
  - jwt_token: session_jwt
  - name: Input Facility Name's value
  - facility_type: Dropdown Type's value
  - license_number: Input License's value
  - address: Input Address's value
  - city: Input City's value
  - state: Dropdown State's value
  - total_area: Input Area's value:rounded to 0
Step 3: Hide spinner
Step 4: Show alert: "Facility created!"
Step 5: Navigate to facilities page
Step 6 (Only when Step 2 failed):
  - Show alert: "Error creating facility"
```

---

### Error Handling

**Handle Convex Errors:**
```
Step X: API Call
Step X+1 (Only when Step X failed):
  - Show alert: Result of Step X's error's message
  - Log to console: Result of Step X
```

**Handle 401 Unauthorized:**
```
Step X: API Call
Step X+1 (Only when Step X's status code = 401):
  - Clear state: session_jwt
  - Navigate to: login page
  - Show alert: "Session expired, please login again"
```

---

### Best Practices

1. **Store JWT in Custom State:**
   - Create page-level custom state: `session_jwt` (text)
   - Set on login, clear on logout
   - Check on every protected page load

2. **Reusable Workflows:**
   - Create custom event: `handle_api_error`
   - Pass error message as parameter
   - Use consistently across all API calls

3. **Loading States:**
   - Show spinner before API calls
   - Hide spinner after completion (success or error)
   - Disable buttons during API calls

4. **Security:**
   - Mark JWT token parameter as "Private" in API Connector
   - Never log JWT tokens to console
   - Clear JWT on logout

5. **Token Refresh:**
   - Clerk JWTs expire after 1 hour
   - Implement token refresh workflow
   - Or re-authenticate user when 401 received

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Get API token
async function getApiToken(clerkToken: string) {
  const response = await fetch('https://your-domain.com/api/v1/auth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`,
      'Content-Type': 'application/json',
    },
  })

  const result = await response.json()
  return result.data.token
}

// List facilities
async function getFacilities(apiToken: string, page = 1) {
  const response = await fetch(
    `https://your-domain.com/api/v1/facilities?page=${page}&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const result = await response.json()
  return result.data
}

// Create batch
async function createBatch(apiToken: string, batchData: any) {
  const response = await fetch('https://your-domain.com/api/v1/batches', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batchData),
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error.message)
  }

  return result.data
}
```

### Python

```python
import requests

class AlquemistAPI:
    def __init__(self, base_url, api_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json',
        }

    def get_facilities(self, page=1, limit=50):
        response = requests.get(
            f'{self.base_url}/facilities',
            headers=self.headers,
            params={'page': page, 'limit': limit}
        )
        result = response.json()

        if not result['success']:
            raise Exception(result['error']['message'])

        return result['data']

    def create_batch(self, batch_data):
        response = requests.post(
            f'{self.base_url}/batches',
            headers=self.headers,
            json=batch_data
        )
        result = response.json()

        if not result['success']:
            raise Exception(result['error']['message'])

        return result['data']

# Usage
api = AlquemistAPI('https://your-domain.com/api/v1', 'your-api-token')
facilities = api.get_facilities(page=1)
```

---

## Data Models

### Business Entity Types (Colombia)

- `S.A.S` - Sociedad por Acciones Simplificada
- `S.A.` - Sociedad Anónima
- `Ltda` - Limitada
- `E.U.` - Empresa Unipersonal
- `Persona Natural`
- `Other`

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
- `other`

---

## Rate Limits

**Current:** No rate limits enforced
**Future:** 1000 requests/hour per organization

---

## Support

For API support or questions:
- Documentation: See [Technical-Specification.md](Technical-Specification.md)
- Issues: Report at project repository

---

**Last Updated:** 2025-01-09
**API Version:** 1.0.0
