# API Integration Guide

**Alquemist REST API v1**

Complete reference for integrating Bubble or other frontends with the Alquemist backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Bubble Integration](#bubble-integration)
6. [Code Examples](#code-examples)

---

## Overview

### Base URL

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

### Step 1: Authenticate User

Users authenticate through Clerk (handled by Next.js frontend or Bubble via Clerk widget).

### Step 2: Get API Token

Once authenticated, obtain an API token:

**Endpoint:** `POST /api/v1/auth/token`

**Headers:**
```
Authorization: Bearer <clerk-session-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "userId": "user_xxx",
    "organizationId": "org_xxx",
    "sessionId": "sess_xxx",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### Step 3: Use Token in Requests

Include the token in all subsequent API requests:

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Token Verification

**Endpoint:** `GET /api/v1/auth/token`

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "user_xxx",
    "organizationId": "org_xxx"
  }
}
```

---

## API Endpoints

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

### Setup Steps

#### 1. Install Clerk Plugin in Bubble

Add the Clerk plugin to your Bubble app for authentication.

#### 2. Configure API Connector

In Bubble, go to **Plugins → API Connector** and add a new API:

**Name:** Alquemist API
**Authentication:** Private key in header

**Shared Headers:**
```
Authorization: Bearer [api_token]
Content-Type: application/json
```

#### 3. Get API Token Workflow

Create a workflow in Bubble to get the API token after user authentication:

**Action:** Call API
**Endpoint:** `POST /api/v1/auth/token`
**Headers:** `Authorization: Bearer [Clerk session token]`

**Save Result:** Store `data.token` in Bubble's custom state or database.

#### 4. Create API Calls

For each endpoint, create an API call in Bubble's API Connector:

**Example - List Facilities:**
- Type: GET
- URL: `https://your-domain.com/api/v1/facilities?page=1&limit=50`
- Headers: Use shared headers with saved token
- Response: Parse JSON and use as data type

**Example - Create Batch:**
- Type: POST
- URL: `https://your-domain.com/api/v1/batches`
- Body type: JSON
- Body: Pass Bubble inputs as JSON
- Headers: Use shared headers

#### 5. Handle Responses

Use Bubble's workflows to handle API responses:

**Success:** Display data or navigate to next page
**Error:** Show error message from `error.message`

### Bubble Workflow Example

**When Button "Create Facility" is clicked:**
1. Call API - POST /api/v1/facilities
2. Body: JSON object from input fields
3. Result: Navigate to facility list page
4. Error: Show alert with response.error.message

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
