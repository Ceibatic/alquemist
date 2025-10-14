# Module 1: Bubble Implementation Guide

**Complete guide for implementing Company & Facility Setup in Bubble.io**

**Version:** 1.0
**Created:** 2025-10-10
**Estimated Time:** 6-8 hours
**Difficulty:** Intermediate

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clerk Authentication Setup](#clerk-authentication-setup)
3. [API Connector Configuration](#api-connector-configuration)
4. [Data Types & Custom States](#data-types--custom-states)
5. [Pages & UI Design](#pages--ui-design)
6. [Workflows](#workflows)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need
- ✅ Bubble.io account (Free or paid plan)
- ✅ Alquemist REST API running (localhost:3000 or production)
- ✅ Clerk account with Organizations enabled
- ✅ Basic Bubble.io knowledge (pages, workflows, API Connector)

### Foundation Complete
- ✅ REST API operational (7 endpoints tested)
- ✅ Clerk Organizations configured
- ✅ Test company and facility created
- ✅ Multi-tenant isolation verified

---

## Clerk Authentication Setup

### Step 1: Install Clerk Plugin in Bubble

1. Go to **Plugins** tab in Bubble editor
2. Click **Add plugins**
3. Search for "Clerk"
4. Install **"Clerk - Authentication"** plugin

### Step 2: Configure Clerk Plugin

**In Bubble Editor:**
1. Go to **Plugins** → **Clerk - Authentication**
2. Add your Clerk credentials:
   - **Publishable Key:** `pk_test_...` (from Clerk dashboard)
   - **Frontend API:** `https://[your-clerk-app].clerk.accounts.dev`
   - **Enable Organizations:** ✅ YES

**In Clerk Dashboard:**
1. Go to **Settings** → **API Keys**
2. Copy **Publishable Key**
3. Go to **Organizations** → Enable organizations
4. Add your Bubble app URL to **Allowed origins**:
   - Development: `https://[your-app].bubbleapps.io/version-test`
   - Production: `https://[your-app].bubbleapps.io`

### Step 3: Create Authentication Pages

#### Sign Up Page (`signup`)

**Elements:**
- **Clerk SignUp Component** (from plugin)
  - Appearance: Custom theme (Alquemist colors)
  - Redirect after signup: `/create-organization`

**Workflows:**
```
When Clerk signup is complete:
  - Go to page create-organization
```

#### Sign In Page (`signin`)

**Elements:**
- **Clerk SignIn Component** (from plugin)
  - Appearance: Custom theme
  - Redirect after signin: `/dashboard`

**Workflows:**
```
When Clerk signin is complete:
  - If user has organization → Go to dashboard
  - Else → Go to create-organization
```

#### Create Organization Page (`create-organization`)

**Elements:**
- **Clerk CreateOrganization Component** (from plugin)
  - Skip if already has organization

**Workflows:**
```
When Organization is created:
  - Create company via API (POST /api/v1/companies)
  - Go to dashboard
```

### Step 4: Get Session Token

**Create a Reusable Element: "Get Session Token"**

This element will be used on every page to get the Clerk session token.

**Elements:**
- Hidden group: `group_session`
- Text element: `text_token` (not visible)
- Text element: `text_org_id` (not visible)

**Workflow on Page Load:**
```
When page is loaded:
  - Plugin Action: Clerk - Get session token
  - Set state: text_token's text = Result of step 1's token
  - Set state: text_org_id's text = Result of step 1's organization ID
```

---

## API Connector Configuration

### Step 1: Initialize API Connector

1. Go to **Plugins** → **API Connector**
2. Click **Add another API**
3. Name: `Alquemist API`

### Step 2: Configure API Settings

**API Settings:**
- **Name:** Alquemist API
- **Authentication:** Self-handled
- **Add a shared header:**
  - Key: `Content-Type`
  - Value: `application/json`

### Step 3: Configure Endpoints

#### 1. Health Check (GET /api/v1)

**Use as:** Action
**Name:** `health_check`
**Method:** GET
**URL:** `https://your-domain.com/api/v1` or `http://localhost:3000/api/v1`

**Headers:**
- None required (no auth)

**Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "version": "1.0.0"
  }
}
```

#### 2. Get Company (GET /api/v1/companies)

**Use as:** Data (so you can use it in repeating groups)
**Name:** `get_company`
**Method:** GET
**URL:** `https://your-domain.com/api/v1/companies`

**Headers:**
- **Authorization:** `Bearer <token>`
  - Make `<token>` a parameter (private)

**Parameters:**
- `token` (private, text)

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "text",
    "organization_id": "text",
    "name": "text",
    "company_type": "text",
    "status": "text",
    "legal_name": "text",
    "tax_id": "text"
  }
}
```

**Bubble Configuration:**
- Check "Capture response headers"
- Check "Allow this API call to be used as data"
- Click **Initialize call** to capture structure

#### 3. Create Company (POST /api/v1/companies)

**Use as:** Action
**Name:** `create_company`
**Method:** POST
**URL:** `https://your-domain.com/api/v1/companies`

**Headers:**
- **Authorization:** `Bearer <token>` (parameter)
- **Content-Type:** `application/json` (already in shared headers)

**Parameters:**
- `token` (private, text)

**Body type:** JSON
**Body:**
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

**Parameters to add:**
- `name` (text)
- `company_type` (text) - "Agriculture"
- `legal_name` (text)
- `tax_id` (text)
- `business_entity_type` (text) - "S.A.S", "S.A.", "Ltda", etc.
- `country` (text) - default "CO"
- `locale` (text) - default "es"
- `currency` (text) - default "COP"
- `timezone` (text) - default "America/Bogota"
- `email` (text)
- `phone` (text)

**Test with sample data and Initialize**

#### 4. Update Company (PATCH /api/v1/companies)

**Use as:** Action
**Name:** `update_company`
**Method:** PATCH
**URL:** `https://your-domain.com/api/v1/companies`

**Headers & Body:** Same as Create Company

#### 5. List Facilities (GET /api/v1/facilities)

**Use as:** Data
**Name:** `list_facilities`
**Method:** GET
**URL:** `https://your-domain.com/api/v1/facilities?page=<page>&limit=<limit>`

**Headers:**
- **Authorization:** `Bearer <token>` (parameter)

**Parameters:**
- `token` (private, text)
- `page` (number, optional) - default 1
- `limit` (number, optional) - default 50

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "text",
      "company_id": "text",
      "name": "text",
      "facility_type": "text",
      "license_number": "text",
      "license_type": "text",
      "license_authority": "text",
      "license_expiration_date": "text",
      "status": "text",
      "address": "text",
      "city": "text",
      "total_area_m2": "number"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Important:** Mark as "Data" and initialize to capture structure

#### 6. Create Facility (POST /api/v1/facilities)

**Use as:** Action
**Name:** `create_facility`
**Method:** POST
**URL:** `https://your-domain.com/api/v1/facilities`

**Headers:**
- **Authorization:** `Bearer <token>` (parameter)

**Parameters:**
- `token` (private, text)

**Body type:** JSON
**Body:**
```json
{
  "name": "<name>",
  "facility_type": "<facility_type>",
  "license_number": "<license_number>",
  "license_type": "<license_type>",
  "license_authority": "<license_authority>",
  "license_expiration_date": "<expiration_date>",
  "address": "<address>",
  "city": "<city>",
  "administrative_division_1": "<state>",
  "latitude": <latitude>,
  "longitude": <longitude>,
  "altitude_meters": <altitude>,
  "total_area_m2": <total_area>,
  "canopy_area_m2": <canopy_area>,
  "status": "<status>"
}
```

**Parameters:**
- `name` (text)
- `facility_type` (text) - "greenhouse", "indoor", "outdoor", "mixed"
- `license_number` (text)
- `license_type` (text) - "cannabis_cultivation", "processing", etc.
- `license_authority` (text) - "INVIMA", "ICA", etc.
- `expiration_date` (text) - ISO date format "2025-12-31"
- `address` (text)
- `city` (text)
- `state` (text)
- `latitude` (number, optional)
- `longitude` (number, optional)
- `altitude` (number, optional)
- `total_area` (number)
- `canopy_area` (number, optional)
- `status` (text) - default "active"

#### 7. Get Facility (GET /api/v1/facilities/:id)

**Use as:** Data
**Name:** `get_facility`
**Method:** GET
**URL:** `https://your-domain.com/api/v1/facilities/<facility_id>`

**Headers:**
- **Authorization:** `Bearer <token>` (parameter)

**Parameters:**
- `token` (private, text)
- `facility_id` (text, private)

**Response:** Same as facility object in list

---

## Data Types & Custom States

### Custom Data Types

#### Company
**Fields:**
- `id` (text)
- `organization_id` (text)
- `name` (text)
- `company_type` (text)
- `legal_name` (text)
- `tax_id` (text)
- `business_entity_type` (text)
- `status` (text)
- `default_locale` (text)
- `default_currency` (text)
- `default_timezone` (text)

#### Facility
**Fields:**
- `id` (text)
- `company_id` (text)
- `name` (text)
- `facility_type` (text)
- `license_number` (text)
- `license_type` (text)
- `license_authority` (text)
- `license_expiration_date` (date)
- `status` (text)
- `address` (text)
- `city` (text)
- `administrative_division_1` (text)
- `total_area_m2` (number)
- `canopy_area_m2` (number)
- `latitude` (number)
- `longitude` (number)

### Custom States

#### Page Level States

**All pages should have:**
- `session_token` (text)
- `organization_id` (text)
- `user_id` (text)

**Company Profile page:**
- `current_company` (Company)
- `is_editing` (yes/no)

**Facilities List page:**
- `facilities_list` (list of Facilities)
- `search_query` (text)
- `filter_type` (text)
- `current_page` (number)

**Create Facility page:**
- `wizard_step` (number) - 1, 2, or 3
- `draft_facility` (Facility)

---

## Pages & UI Design

### Page Structure

```
index (/)
  ↓
signin
  ↓
create-organization (if needed)
  ↓
dashboard
  ├─ company-profile
  └─ facilities
      ├─ facilities-list
      ├─ create-facility
      └─ facility-details
```

### 1. Dashboard Page (`dashboard`)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Reusable)                       │
│  - Logo                                 │
│  - Navigation Menu                      │
│  - User Profile (Clerk UserButton)     │
├─────────────────────────────────────────┤
│                                         │
│  Welcome, [Company Name]                │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Company  │  │Facilities│            │
│  │ Profile  │  │    5     │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  Quick Actions:                         │
│  - View Company Profile                 │
│  - Manage Facilities                    │
│  - Create New Facility                  │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**
- Reusable Header
- Group: Welcome Section
  - Text: "Welcome, [Company Name]"
  - Text: [User email]
- Group: Stats Cards
  - Card: Company Profile (clickable)
  - Card: Facilities Count (clickable)
- Group: Quick Actions
  - Button: "View Company Profile" → company-profile
  - Button: "Manage Facilities" → facilities-list
  - Button: "Create New Facility" → create-facility

**Workflow on Page Load:**
```
1. Get session token (Clerk plugin)
2. Set state: session_token, organization_id
3. API Call: get_company with token
4. Display result in welcome text
5. API Call: list_facilities with token (limit: 1000)
6. Count facilities and display in card
```

### 2. Company Profile Page (`company-profile`)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Reusable)                       │
├─────────────────────────────────────────┤
│                                         │
│  Company Profile                [Edit]  │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Basic Information                  ││
│  │                                    ││
│  │ Company Name: [Alquemist Test...]  ││
│  │ Legal Name:   [Alquemist Test...]  ││
│  │ Tax ID:       [900123456-7]        ││
│  │ Business Type:[S.A.S]              ││
│  │ Type:         [Agriculture]        ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Contact Information                ││
│  │                                    ││
│  │ Email:  [contact@company.com]      ││
│  │ Phone:  [+57 300 123 4567]         ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Regional Settings                  ││
│  │                                    ││
│  │ Country:  [Colombia (CO)]          ││
│  │ Locale:   [Spanish (es)]           ││
│  │ Currency: [COP]                    ││
│  │ Timezone: [America/Bogota]         ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**View Mode Elements:**
- Page header with "Edit" button
- Group: Basic Information (Company data type)
  - Text fields showing company data
- Group: Contact Information
- Group: Regional Settings

**Edit Mode Elements:**
- Replace texts with inputs
- "Save" and "Cancel" buttons
- Form validation

**Workflows:**

**On Page Load:**
```
1. Get session token
2. API Call: get_company
3. Set state: current_company = result
4. Display company data in text fields
```

**When Edit button is clicked:**
```
1. Set state: is_editing = yes
2. Show input fields (conditional visibility)
3. Pre-fill inputs with current values
```

**When Save button is clicked:**
```
1. Validate inputs (required fields)
2. API Call: update_company with form values
3. If success:
   - Show success message (alert or toast)
   - Refresh company data
   - Set state: is_editing = no
4. If error:
   - Show error message
```

**When Cancel button is clicked:**
```
1. Set state: is_editing = no
2. Reset inputs to original values
```

### 3. Facilities List Page (`facilities-list`)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Reusable)                       │
├─────────────────────────────────────────┤
│                                         │
│  Facilities                [+ New]      │
│                                         │
│  [Search...]  [Type: All ▼]            │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Greenhouse Facility #1             ││
│  │ Type: Greenhouse | License: LIC-.. ││
│  │ 📍 Bogotá, Cundinamarca            ││
│  │ License expires: 2026-12-31 🟢     ││
│  │                          [View >]  ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Indoor Facility A                  ││
│  │ Type: Indoor | License: LIC-...    ││
│  │ 📍 Medellín, Antioquia             ││
│  │ License expires: 2025-03-15 🟡     ││
│  │                          [View >]  ││
│  └────────────────────────────────────┘│
│                                         │
│  Page 1 of 1               [< 1 2 3 >] │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**
- Page header with "Create New Facility" button
- Search input
- Dropdown: Facility type filter
- Repeating Group: Facilities
  - Source: API Call - list_facilities
  - Item: Facility data type
  - Layout: Full list (vertical)
  - Number of rows: 10

**Facility Card (inside repeating group):**
- Text: Facility name (bold, large)
- Text: Type and License number
- Text: Location (with icon)
- Text: License expiration with status badge
  - Color logic:
    - Green (🟢): > 60 days
    - Yellow (🟡): 30-60 days
    - Red (🔴): < 30 days
- Button: "View" → go to facility-details with parameter

**Pagination:**
- Text: "Page X of Y"
- Buttons: Previous / Next
- Page numbers (1, 2, 3...)

**Empty State (conditional):**
Show when facilities list is empty:
```
┌────────────────────────────────┐
│         📦                     │
│   No facilities yet            │
│                                │
│   [Create Your First Facility] │
└────────────────────────────────┘
```

**Workflows:**

**On Page Load:**
```
1. Get session token
2. Set state: current_page = 1
3. API Call: list_facilities (page=1, limit=10)
4. Set state: facilities_list = result
5. Display facilities in repeating group
```

**When Search input changes:**
```
1. Wait 500ms (debounce)
2. Filter facilities_list by search_query
3. Refresh repeating group
```

**When Type filter changes:**
```
1. Set state: filter_type = dropdown value
2. API Call: list_facilities with filter
3. Update facilities_list
```

**When "View" button is clicked:**
```
1. Go to facility-details
2. Send parameter: facility_id = Current cell's Facility's id
```

**When "Create New Facility" is clicked:**
```
1. Go to create-facility
2. Set state: wizard_step = 1
```

### 4. Create Facility Wizard (`create-facility`)

**Layout (Multi-step form):**
```
┌─────────────────────────────────────────┐
│ Header (Reusable)                       │
├─────────────────────────────────────────┤
│                                         │
│  Create New Facility                    │
│                                         │
│  Step 1 of 3: Basic Information ━━━━━━  │
│  ●━━○━━○                                │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Facility Name *                    ││
│  │ [________________]                 ││
│  │                                    ││
│  │ Facility Type *                    ││
│  │ [Greenhouse ▼]                     ││
│  │                                    ││
│  │ Description (optional)             ││
│  │ [____________________________]     ││
│  │ [____________________________]     ││
│  │ [____________________________]     ││
│  └────────────────────────────────────┘│
│                                         │
│            [Cancel]        [Next →]     │
│                                         │
└─────────────────────────────────────────┘
```

**Step 1: Basic Information**

Elements:
- Progress indicator (step 1 of 3)
- Input: Facility name (required)
- Dropdown: Facility type (required)
  - Options: greenhouse, indoor, outdoor, mixed
- Textarea: Description (optional)
- Button: Cancel
- Button: Next

**Step 2: Location**

Elements:
- Progress indicator (step 2 of 3)
- Input: Address (required)
- Input: City (required)
- Dropdown: State/Department (required)
- Input: Latitude (optional)
- Input: Longitude (optional)
- Input: Altitude (meters) (optional)
- Input: Total area (m²) (required)
- Input: Canopy area (m²) (optional)
- Button: Back
- Button: Next

**Step 3: License Information**

Elements:
- Progress indicator (step 3 of 3)
- Input: License number (required)
- Dropdown: License type (required)
  - Options: cannabis_cultivation, processing, distribution, etc.
- Dropdown: License authority (required)
  - Options: INVIMA, ICA, Municipal, etc.
- Date picker: Expiration date (required)
- Button: Back
- Button: Create Facility

**Workflows:**

**On Page Load:**
```
1. Get session token
2. Set state: wizard_step = 1
3. Clear draft_facility (reset form)
```

**When Next is clicked (Step 1):**
```
1. Validate: name and facility_type are not empty
2. If valid:
   - Save to state: draft_facility
   - Set state: wizard_step = 2
3. If invalid:
   - Show error message
   - Don't proceed
```

**When Next is clicked (Step 2):**
```
1. Validate: address, city, state, total_area are not empty
2. If valid:
   - Update state: draft_facility with location data
   - Set state: wizard_step = 3
3. If invalid:
   - Show error message
```

**When Back is clicked:**
```
1. Set state: wizard_step = wizard_step - 1
2. Show previous step
3. Pre-fill form with draft_facility data
```

**When Create Facility is clicked (Step 3):**
```
1. Validate: license fields are not empty
2. If valid:
   - Update state: draft_facility with license data
   - Show loading spinner
   - API Call: create_facility with all draft_facility data
   - If success:
     - Show success message
     - Go to facility-details with new facility_id
   - If error:
     - Show error message
     - Stay on form
3. If invalid:
   - Show error message
```

**When Cancel is clicked:**
```
1. Show confirmation dialog: "Are you sure? Draft will be lost"
2. If confirmed:
   - Clear draft_facility
   - Go to facilities-list
```

### 5. Facility Details Page (`facility-details`)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Reusable)                       │
├─────────────────────────────────────────┤
│                                         │
│  Greenhouse Facility #1      [Edit]    │
│  📍 Bogotá, Cundinamarca               │
│                                         │
│  [Overview] [License] [Areas] [Team]   │
│  ─────────                              │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Overview                           ││
│  │                                    ││
│  │ Type: Greenhouse                   ││
│  │ Status: Active                     ││
│  │ Total Area: 5,000 m²               ││
│  │ Canopy Area: 3,500 m²              ││
│  │                                    ││
│  │ Location:                          ││
│  │ Km 5 Vía La Calera                 ││
│  │ Bogotá, Cundinamarca               ││
│  │ Colombia                           ││
│  │                                    ││
│  │ Coordinates: 4.7110, -74.0721      ││
│  │ Altitude: 2,600 MSNM               ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**

**Page Header:**
- Facility name (dynamic from URL parameter)
- Location subtitle
- Edit button

**Tab Navigation:**
- Tab 1: Overview (default)
- Tab 2: License
- Tab 3: Areas (future)
- Tab 4: Team (future)

**Overview Tab:**
- Group: Facility Info
  - Type, Status, Areas
- Group: Location
  - Full address
  - Coordinates
  - Altitude

**License Tab:**
```
┌────────────────────────────────────┐
│ License Information                │
│                                    │
│ License Number: LIC-2025-001       │
│ License Type: Cannabis Cultivation │
│ Authority: INVIMA                  │
│ Issued: 2025-01-01                 │
│ Expires: 2026-12-31                │
│                                    │
│ Status: Active 🟢                  │
│ Days remaining: 450 days           │
│                                    │
│ [Renew License]                    │
└────────────────────────────────────┘
```

**Workflows:**

**On Page Load:**
```
1. Get session token
2. Get URL parameter: facility_id
3. API Call: get_facility with facility_id
4. Display facility data in page
5. Calculate license expiration status
6. Set badge color based on days remaining
```

**When Tab is clicked:**
```
1. Set state: active_tab = tab name
2. Show corresponding content group
3. Hide other groups
```

**When Edit button is clicked:**
```
1. Go to edit-facility page
2. Send parameter: facility_id
```

---

## Workflows

### Reusable Workflows

Create these as **Custom Events** to reuse across pages:

#### 1. Get Session Token
**Custom Event:** `get_session_token`

```
Step 1: Clerk plugin - Get session
Step 2: Set state - session_token = Result's token
Step 3: Set state - organization_id = Result's org_id
Step 4: Set state - user_id = Result's user_id
```

Use on every page's "Page is loaded" event.

#### 2. Show Error Message
**Custom Event:** `show_error` (parameter: error_message)

```
Step 1: Show alert: error_message
Step 2: Log to console: error_message
```

#### 3. Show Success Message
**Custom Event:** `show_success` (parameter: success_message)

```
Step 1: Show alert: success_message (green)
Step 2: Auto-hide after 3 seconds
```

---

## Testing

### Testing Checklist

#### Authentication
- [ ] Sign up new user
- [ ] Verify email (if enabled)
- [ ] Create organization
- [ ] Sign in existing user
- [ ] Organization selection works
- [ ] Session token is retrieved on all pages

#### Company Profile
- [ ] View company data on dashboard
- [ ] Navigate to company profile page
- [ ] Edit company name
- [ ] Save changes successfully
- [ ] Cancel edit (revert changes)
- [ ] Error handling for invalid data

#### Facilities List
- [ ] View empty state (first time)
- [ ] Create first facility (via empty state)
- [ ] View facilities list
- [ ] Search facilities by name
- [ ] Filter by facility type
- [ ] Pagination works (if > 10 facilities)
- [ ] Click "View" opens facility details

#### Create Facility
- [ ] Wizard step 1 validation
- [ ] Navigate to step 2
- [ ] Navigate back to step 1 (data preserved)
- [ ] Wizard step 2 validation
- [ ] Navigate to step 3
- [ ] Cancel wizard (confirmation dialog)
- [ ] Submit form (all steps)
- [ ] Success redirect to facility details
- [ ] Error handling for API failures

#### Facility Details
- [ ] View facility overview
- [ ] View license information
- [ ] License status badge color (green/yellow/red)
- [ ] Switch between tabs
- [ ] Edit button navigation
- [ ] Data matches created facility

#### Multi-Tenancy
- [ ] Create second organization
- [ ] Switch organizations in Clerk
- [ ] Verify facilities are isolated
- [ ] No cross-tenant data leakage

---

## Troubleshooting

### Common Issues

#### 1. "Authorization failed" error

**Problem:** API calls return 401 Unauthorized

**Solution:**
- Check session token is being passed correctly
- Verify token is not expired (Clerk session duration)
- Ensure Bearer prefix is included: `Bearer <token>`
- Check Clerk plugin is configured correctly

#### 2. "Company not found" error

**Problem:** GET /api/v1/companies returns empty

**Solution:**
- Verify organization was created in Clerk
- Check if company was created via POST /api/v1/companies
- Ensure organization_id matches between Clerk and company record

#### 3. API calls not working (CORS error)

**Problem:** Browser shows CORS policy error

**Solution:**
- Add Bubble app URL to Next.js allowed origins
- Update `next.config.ts`:
  ```typescript
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: 'https://[your-app].bubbleapps.io'
    }
  ]
  ```
- Restart Next.js server

#### 4. Facilities list not showing

**Problem:** Repeating group is empty

**Solution:**
- Check API call is set to "Data" (not "Action")
- Verify response structure matches data type
- Initialize API call in API Connector
- Check facilities exist for current company

#### 5. License expiration badge not showing colors

**Problem:** All badges show same color

**Solution:**
- Verify date comparison logic in conditional:
  ```
  When Current cell's Facility's license_expiration_date < Current date + days: 30
  This element is visible: yes
  Background color: Red
  ```

#### 6. Wizard not advancing to next step

**Problem:** Next button does nothing

**Solution:**
- Check validation workflow is not blocking
- Ensure wizard_step state is being updated
- Verify conditional visibility on step groups
- Check for JavaScript errors in browser console

---

## Best Practices

### Performance
- Use "Do when condition is true" instead of "Every X seconds"
- Limit API calls on page load (combine when possible)
- Cache company and user data in custom states
- Use pagination for large lists (don't load 1000+ items)

### Security
- Never expose API tokens in visible elements
- Use private parameters for sensitive data
- Validate all user inputs before API calls
- Handle errors gracefully (don't show raw API errors)

### UX
- Show loading spinners during API calls
- Provide success/error feedback for all actions
- Use optimistic UI updates where possible
- Implement proper empty states
- Add confirmation dialogs for destructive actions

### Maintenance
- Document custom workflows
- Use consistent naming conventions
- Create reusable elements for common components
- Test thoroughly before production deployment

---

## Next Steps

### After Module 1 is Complete

1. **Module 2: Batch Management**
   - Create batches
   - QR code generation
   - Batch tracking

2. **Module 3: Activity Logging**
   - Log activities
   - Task assignment
   - Mobile-friendly capture

3. **Advanced Features**
   - File uploads (logos, documents)
   - Advanced area layouts
   - Team management UI
   - Analytics dashboard

---

**Documentation Version:** 1.0
**Last Updated:** 2025-10-10
**Next Review:** After Module 1 implementation complete

**Need Help?**
- Check [API-Bubble-Reference.md](API-Bubble-Reference.md) for endpoint details
- See [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md) for visual designs
- Review [Module-1-Bubble-Quick-Start.md](Module-1-Bubble-Quick-Start.md) for checklist
