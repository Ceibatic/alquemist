# API Reference for Bubble Integration

**Quick reference for configuring Alquemist API calls in Bubble's API Connector**

**Version:** 1.0
**Base URL:** `https://your-domain.com/api/v1` or `http://localhost:3000/api/v1`

---

## 🔐 Authentication

All endpoints (except health check) require Clerk authentication.

**Header Required:**
```
Authorization: Bearer <token>
```

The `<token>` is obtained from Clerk plugin's "Get session" action and should be passed as a **private parameter** in Bubble.

---

## 📍 Endpoints

### 1. Health Check

**Purpose:** Test API connection

#### Bubble Configuration
- **Name:** `health_check`
- **Use as:** Action
- **Method:** GET
- **URL:** `[BASE_URL]`

#### Parameters
None

#### Response
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "version": "1.0.0",
    "timestamp": "2025-01-10T12:00:00Z",
    "endpoints": [...]
  }
}
```

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `health_check`
3. Use as: **Action**
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1`
6. Click **Initialize call**
7. Verify response shows `"status": "operational"`

---

### 2. Get Company

**Purpose:** Retrieve current user's company profile

#### Bubble Configuration
- **Name:** `get_company`
- **Use as:** **Data** (for use in repeating groups/text elements)
- **Method:** GET
- **URL:** `[BASE_URL]/companies`

#### Headers
```
Authorization: Bearer <token>
```

#### Parameters
| Parameter | Type | Private | Required | Description |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | Clerk session token |

#### Request URL in Bubble
```
https://your-domain.com/api/v1/companies
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Alquemist Test Company",
    "company_type": "Agriculture",
    "status": "active",
    "subscription_plan": "trial",
    "max_facilities": 1,
    "max_users": 3,
    "legal_name": "Alquemist Test Company SAS",
    "tax_id": "900123456-7",
    "business_entity_type": "S.A.S",
    "country": "CO",
    "default_locale": "es",
    "default_currency": "COP",
    "default_timezone": "America/Bogota",
    "primary_contact_email": "contact@company.com",
    "primary_contact_phone": "+57 300 123 4567"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `get_company`
3. Use as: **Data** ← Important!
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/companies`
6. Add header:
   - Key: `Authorization`
   - Value: `Bearer <token>` (make `<token>` a parameter)
7. Add parameter:
   - Name: `token`
   - Type: text
   - Private: ✅ Yes
8. Click **Initialize call** with test token
9. Bubble will capture the response structure

#### Usage in Bubble
**In a text element:**
```
Get data from external API > Alquemist API - get_company
```

**Dynamic expression:**
```
Get data from external API > Alquemist API - get_company's name
Get data from external API > Alquemist API - get_company's tax_id
```

---

### 3. Create Company

**Purpose:** Create a new company profile

#### Bubble Configuration
- **Name:** `create_company`
- **Use as:** Action
- **Method:** POST
- **URL:** `[BASE_URL]/companies`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Parameters
| Parameter | Type | Private | Required | Description |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | Clerk session token |
| `name` | text | ❌ No | ✅ Yes | Company name |
| `company_type` | text | ❌ No | ✅ Yes | "Agriculture", "Processing", etc. |
| `legal_name` | text | ❌ No | ❌ No | Legal business name |
| `tax_id` | text | ❌ No | ❌ No | Tax ID (NIT in Colombia) |
| `business_entity_type` | text | ❌ No | ❌ No | "S.A.S", "S.A.", "Ltda", "E.U.", etc. |
| `country` | text | ❌ No | ❌ No | Country code (default: "CO") |
| `locale` | text | ❌ No | ❌ No | Locale (default: "es") |
| `currency` | text | ❌ No | ❌ No | Currency code (default: "COP") |
| `timezone` | text | ❌ No | ❌ No | Timezone (default: "America/Bogota") |
| `email` | text | ❌ No | ❌ No | Primary contact email |
| `phone` | text | ❌ No | ❌ No | Primary contact phone |

#### Request Body (JSON)
```json
{
  "name": "Alquemist Test Company",
  "company_type": "Agriculture",
  "legal_name": "Alquemist Test Company SAS",
  "tax_id": "900123456-7",
  "business_entity_type": "S.A.S",
  "country": "CO",
  "default_locale": "es",
  "default_currency": "COP",
  "default_timezone": "America/Bogota",
  "primary_contact_email": "contact@company.com",
  "primary_contact_phone": "+57 300 123 4567"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Alquemist Test Company",
    "company_type": "Agriculture",
    "status": "active",
    "created_at": "2025-01-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `create_company`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://your-domain.com/api/v1/companies`
6. Add header:
   - Key: `Authorization`
   - Value: `Bearer <token>` (parameter)
7. Body type: **JSON**
8. Body:
```json
{
  "name": "<name>",
  "company_type": "<company_type>",
  "legal_name": "<legal_name>",
  "tax_id": "<tax_id>",
  "business_entity_type": "<business_entity_type>",
  "country": "<country>",
  "default_locale": "<locale>",
  "default_currency": "<currency>",
  "default_timezone": "<timezone>",
  "primary_contact_email": "<email>",
  "primary_contact_phone": "<phone>"
}
```
9. Add all parameters as shown in table above
10. Click **Initialize call** with test data
11. Verify response returns company ID

#### Usage in Bubble Workflow
```
Step 1: Plugin Action - Clerk: Get session
Step 2: API Call - create_company
  - token: Result of step 1's token
  - name: Input Company Name's value
  - company_type: "Agriculture"
  - legal_name: Input Legal Name's value
  - tax_id: Input Tax ID's value
  - business_entity_type: Dropdown Business Type's value
  - country: "CO"
  - locale: "es"
  - currency: "COP"
  - timezone: "America/Bogota"
  - email: Input Email's value
  - phone: Input Phone's value
Step 3: Show alert: "Company created successfully!"
Step 4: Navigate to: dashboard
```

---

### 4. Update Company

**Purpose:** Update existing company profile

#### Bubble Configuration
- **Name:** `update_company`
- **Use as:** Action
- **Method:** PATCH
- **URL:** `[BASE_URL]/companies`

#### Configuration
Same as **Create Company** but using **PATCH** method.

All fields are optional (only send fields you want to update).

---

### 5. List Facilities

**Purpose:** Get all facilities for current company

#### Bubble Configuration
- **Name:** `list_facilities`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `[BASE_URL]/facilities?page=<page>&limit=<limit>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parameters
| Parameter | Type | Private | Required | Default | Description |
|-----------|------|---------|----------|---------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | - | Clerk session token |
| `page` | number | ❌ No | ❌ No | 1 | Page number for pagination |
| `limit` | number | ❌ No | ❌ No | 50 | Items per page |
| `status` | text | ❌ No | ❌ No | - | Filter by status: "active", "inactive", "archived" |

#### Request URL in Bubble
```
https://your-domain.com/api/v1/facilities?page=<page>&limit=<limit>&status=<status>
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "facility_id_123",
      "company_id": "company_id_456",
      "name": "Greenhouse Facility #1",
      "facility_type": "greenhouse",
      "license_number": "LIC-2025-001",
      "license_type": "cannabis_cultivation",
      "license_authority": "INVIMA",
      "license_issued_date": "2025-01-01",
      "license_expiration_date": "2026-12-31",
      "status": "active",
      "address": "Km 5 Vía La Calera",
      "city": "Bogotá",
      "administrative_division_1": "Cundinamarca",
      "country": "CO",
      "latitude": 4.7110,
      "longitude": -74.0721,
      "altitude_meters": 2600,
      "total_area_m2": 5000,
      "canopy_area_m2": 3500,
      "_creationTime": 1704902400000
    }
  ],
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `list_facilities`
3. Use as: **Data** ← Important!
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/facilities?page=<page>&limit=<limit>`
6. Add header: `Authorization: Bearer <token>` (parameter)
7. Add parameters: `token`, `page`, `limit`, `status`
8. Click **Initialize call**
9. Bubble will capture array structure

#### Usage in Bubble
**In a Repeating Group:**
- **Type of content:** Facility (create custom data type)
- **Data source:** Get data from external API > Alquemist API - list_facilities
- **Set parameters:**
  - token: Get session token workflow result
  - page: 1 (or custom state for pagination)
  - limit: 10

**Access fields in repeating group:**
```
Current cell's Facility's name
Current cell's Facility's license_number
Current cell's Facility's license_expiration_date
```

---

### 6. Get Facility

**Purpose:** Get single facility details

#### Bubble Configuration
- **Name:** `get_facility`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parameters
| Parameter | Type | Private | Required | Description |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | Clerk session token |
| `facility_id` | text | ✅ Yes | ✅ Yes | Facility ID from URL parameter |

#### Request URL in Bubble
```
https://your-domain.com/api/v1/facilities/<facility_id>
```

#### Response
Same as single facility object in list_facilities.

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `get_facility`
3. Use as: **Data**
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/facilities/<facility_id>`
6. Add header: `Authorization: Bearer <token>` (parameter)
7. Add parameters: `token`, `facility_id` (both private)
8. Initialize with test IDs

#### Usage in Bubble
**On facility details page:**
```
Get data from external API > Alquemist API - get_facility
  - token: session_token
  - facility_id: Get data from page URL (parameter)
```

---

### 7. Create Facility

**Purpose:** Create a new facility

#### Bubble Configuration
- **Name:** `create_facility`
- **Use as:** Action
- **Method:** POST
- **URL:** `[BASE_URL]/facilities`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Parameters
| Parameter | Type | Private | Required | Description |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | Clerk session token |
| `name` | text | ❌ No | ✅ Yes | Facility name |
| `facility_type` | text | ❌ No | ✅ Yes | "greenhouse", "indoor", "outdoor", "mixed" |
| `license_number` | text | ❌ No | ✅ Yes | License number |
| `license_type` | text | ❌ No | ✅ Yes | License type |
| `license_authority` | text | ❌ No | ✅ Yes | "INVIMA", "ICA", etc. |
| `license_expiration_date` | text | ❌ No | ❌ No | ISO date: "2026-12-31" |
| `address` | text | ❌ No | ✅ Yes | Street address |
| `city` | text | ❌ No | ✅ Yes | City name |
| `state` | text | ❌ No | ✅ Yes | State/Department |
| `latitude` | number | ❌ No | ❌ No | Latitude coordinate |
| `longitude` | number | ❌ No | ❌ No | Longitude coordinate |
| `altitude` | number | ❌ No | ❌ No | Altitude in meters |
| `total_area` | number | ❌ No | ✅ Yes | Total area in m² |
| `canopy_area` | number | ❌ No | ❌ No | Canopy area in m² |
| `status` | text | ❌ No | ❌ No | "active" (default) |

#### Request Body (JSON)
```json
{
  "name": "Greenhouse Facility #1",
  "facility_type": "greenhouse",
  "license_number": "LIC-2025-001",
  "license_type": "cannabis_cultivation",
  "license_authority": "INVIMA",
  "license_expiration_date": "2026-12-31",
  "address": "Km 5 Vía La Calera",
  "city": "Bogotá",
  "administrative_division_1": "Cundinamarca",
  "latitude": 4.7110,
  "longitude": -74.0721,
  "altitude_meters": 2600,
  "total_area_m2": 5000,
  "canopy_area_m2": 3500,
  "status": "active"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "new_facility_id",
    "name": "Greenhouse Facility #1",
    "license_number": "LIC-2025-001",
    "status": "active",
    "created_at": "2025-01-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Bubble Setup Steps
1. API Connector → Add another call
2. Name: `create_facility`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://your-domain.com/api/v1/facilities`
6. Add header: `Authorization: Bearer <token>` (parameter)
7. Body type: **JSON**
8. Body: (see JSON above with `<parameter>` placeholders)
9. Add all parameters from table
10. Initialize with test data

#### Usage in Bubble Workflow
```
Step 1: Show loading spinner
Step 2: API Call - create_facility
  - token: session_token (from page state)
  - name: Input Facility Name's value
  - facility_type: Dropdown Type's value
  - license_number: Input License's value
  - license_type: Dropdown License Type's value
  - license_authority: Dropdown Authority's value
  - license_expiration_date: DatePicker's value (formatted as ISO)
  - address: Input Address's value
  - city: Input City's value
  - state: Dropdown State's value
  - latitude: Input Lat's value (if not empty)
  - longitude: Input Lng's value (if not empty)
  - altitude: Input Altitude's value (if not empty)
  - total_area: Input Total Area's value
  - canopy_area: Input Canopy's value (if not empty)
  - status: "active"
Step 3: Hide loading spinner
Step 4: Show alert: "Facility created successfully!"
Step 5: Navigate to: facility-details
  - Send parameter: facility_id = Result of step 2's id
```

---

### 8. Update Facility

**Purpose:** Update existing facility

#### Bubble Configuration
- **Name:** `update_facility`
- **Use as:** Action
- **Method:** PATCH
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Configuration
Same as **Create Facility** but:
- Method: **PATCH**
- URL includes `<facility_id>` parameter
- All body fields are optional

---

### 9. Delete Facility (Soft Delete)

**Purpose:** Archive/deactivate a facility

#### Bubble Configuration
- **Name:** `delete_facility`
- **Use as:** Action
- **Method:** DELETE
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parameters
| Parameter | Type | Private | Required | Description |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Yes | ✅ Yes | Clerk session token |
| `facility_id` | text | ✅ Yes | ✅ Yes | Facility ID to delete |

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Facility archived successfully",
    "facility_id": "facility_id_123"
  }
}
```

---

## 🔄 Response Handling

### Success Response Pattern
All successful responses follow this structure:
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "ISO date string"
  }
}
```

### Error Response Pattern
All error responses follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional */ }
  },
  "meta": {
    "timestamp": "ISO date string"
  }
}
```

### Handling Errors in Bubble

**In workflows, add error handling:**

```
Step X: API Call - [any API call]
  - Only when: [conditions]

Step X+1 (Run only when Step X failed):
  - Show alert: Result of step X's error's message
  - Log to console: Result of step X
```

---

## 📊 Common Error Codes

| Code | HTTP Status | Meaning | Solution |
|------|-------------|---------|----------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token | Get fresh session token from Clerk |
| `FORBIDDEN` | 403 | User lacks permission | Check user role and organization |
| `NOT_FOUND` | 404 | Resource doesn't exist | Verify ID is correct |
| `VALIDATION_ERROR` | 400 | Invalid input data | Check required fields and formats |
| `COMPANY_NOT_FOUND` | 404 | No company for org | Create company first |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait and retry |
| `INTERNAL_ERROR` | 500 | Server error | Contact support |

---

## 🧪 Testing in Bubble

### Test Sequence

1. **Health Check**
   ```
   Workflow: When button is clicked
   Action: API Call - health_check
   Show alert: Result of step 1's data's status
   Expected: "operational"
   ```

2. **Get Company**
   ```
   Workflow: When page is loaded
   Step 1: Clerk - Get session
   Step 2: API Call - get_company (token = result of step 1)
   Display: Result of step 2's data's name
   Expected: Your company name
   ```

3. **List Facilities**
   ```
   Repeating Group data source:
   Get data from external API > list_facilities
   Parameters: token (from session), page: 1, limit: 10
   Expected: List of facilities (or empty if none)
   ```

4. **Create Facility**
   ```
   Workflow: When Create button is clicked
   Action: API Call - create_facility (all parameters from form)
   Show alert: "Success!"
   Navigate to: facility-details (with result ID)
   Expected: New facility created and displayed
   ```

---

## 💡 Pro Tips

### 1. Reusable Session Token
Create a **Custom State** on page level:
- Name: `session_token`
- Type: text

Set it once on page load:
```
When page is loaded:
  Step 1: Clerk - Get session
  Step 2: Set state: session_token = Result's token
```

Use it in all API calls:
```
token = session_token
```

### 2. Error Handling Template
Create a **Custom Event** for consistent error handling:
```
Custom Event: handle_api_error
Parameters: error_message (text)

Actions:
  - Show alert: error_message (red color)
  - Log to console: error_message
  - (Optional) Send to analytics
```

Use in workflows:
```
Step X: API Call
Step X+1 (Only when step X failed):
  Trigger event: handle_api_error
  error_message: Result of step X's error's message
```

### 3. Loading States
Always show feedback during API calls:
```
Step 1: Set state: is_loading = yes (shows spinner)
Step 2: API Call
Step 3: Set state: is_loading = no (hides spinner)
Step 4: (handle result)
```

### 4. Data Caching
Cache company data to avoid repeated calls:
```
Only fetch company on first page load
Store in Custom State: current_company
Reuse across page without re-fetching
```

---

## 📚 Additional Resources

- **Full Setup Guide:** [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md)
- **UI Wireframes:** [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md)
- **Quick Start:** [Module-1-Bubble-Quick-Start.md](Module-1-Bubble-Quick-Start.md)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**API Version:** v1
