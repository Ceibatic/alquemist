# Module 1 & 2: Complete Registration + Email Verification - Bubble Implementation Guide

**Complete step-by-step guide for implementing 3-phase registration with email verification (Resend) and auto-login (Clerk) in Bubble**

---

## Overview

The registration system implements a **3-phase flow with email verification and Clerk auto-login**:

1. **Phase 1: Personal Information** - User creates account (email + password)
2. **Phase 2: Email Verification** - User verifies email address via Resend
3. **Phase 3: Company Information** - User creates company, auto-login via Clerk

### Architecture

```
Bubble Frontend
    ↓ (HTTP API Calls)
Convex Backend
    ├─→ Register User (Step 1)
    ├─→ Send Email (Resend)
    ├─→ Verify Token (Step 2)
    ├─→ Create Company (Step 3)
    └─→ Auto-Login (Clerk)
    ↓
Database (Convex)
User | Email Verification Token | Company | Geographic Data
```

---

## Prerequisites

Before starting:

1. ✅ **Backend seeded**:
   - System roles: `npx convex run seedRoles:seedSystemRoles`
   - Geographic data: `npx convex run seedGeographic:seedColombianGeography`

2. ✅ **Environment variables configured** (.env.local):
   - `CONVEX_DEPLOYMENT=exciting-shrimp-34`
   - `CLERK_SECRET_KEY=sk_live_xxxxx` (from clerk.com)
   - `RESEND_API_KEY=re_xxxxx` (from resend.com)
   - `BUBBLE_APP_URL=https://yourapp.bubbleapps.io`

3. ✅ **Convex deployment URL** available

4. ✅ **Bubble account** created

5. ✅ **Clerk project** created (https://clerk.com)

6. ✅ **Resend account** created (https://resend.com)

---

## Part 1: Environment Variables & Configuration

### 1.1 Required Environment Variables

Create `.env.local` in your Convex project root:

```env
# Convex
CONVEX_DEPLOYMENT=exciting-shrimp-34

# Clerk Authentication (get from clerk.com)
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx

# Email Service (get from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Frontend URL (your Bubble app)
BUBBLE_APP_URL=https://yourapp.bubbleapps.io
```

### 1.2 Clerk Setup (clerk.com)

1. Create Clerk project at https://clerk.com
2. Go to **API Keys** section
3. Copy **Secret Key** (starts with `sk_`)
4. Add to `.env.local` as `CLERK_SECRET_KEY`

### 1.3 Resend Setup (resend.com)

1. Create account at https://resend.com
2. Go to **API Keys** section
3. Create new API key
4. Copy API key (starts with `re_`)
5. Add to `.env.local` as `RESEND_API_KEY`
6. Verify your sender email domain (or use test domain)

### 1.4 Deploy Environment Variables

```bash
# Add to Convex deployment
npx convex env set CLERK_SECRET_KEY sk_live_xxxxxxxxxxxx
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx
npx convex env set BUBBLE_APP_URL https://yourapp.bubbleapps.io
```

---

## Part 2: API Endpoints Reference

All endpoints are HTTP POST actions exposed by Convex at:
```
https://exciting-shrimp-34.convex.site
```

### Summary of 5 API Endpoints

| Endpoint | Purpose | Step |
|----------|---------|------|
| `/registration/register-step-1` | Create user account | 1 |
| `/registration/verify-email` | Verify email token | 2 |
| `/registration/register-step-2` | Create company | 3 |
| `/geographic/departments` | Get Colombian departments | 3 |
| `/geographic/municipalities` | Get municipalities by department | 3 |

### Endpoint 1: Register User (Step 1)

**POST** `/registration/register-step-1`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "3101234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "email": "john@example.com",
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr",
  "expiresAt": 1761534872405,
  "message": "Cuenta creada. Por favor verifica tu correo electrónico."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "El correo electrónico ya está registrado"
}
```

**Validations:**
- Email must be unique and valid format
- Password must be 8+ chars with letter + number
- firstName and lastName required

---

### Endpoint 2: Verify Email Token (Step 2)

**POST** `/registration/verify-email`

**Request Body:**
```json
{
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "message": "¡Email verificado exitosamente!"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Token no válido o expirado"
}
```

**Token Properties:**
- 32-character random string
- Valid for 24 hours
- Single-use only
- Case-sensitive

---

### Endpoint 3: Create Company (Step 3)

**POST** `/registration/register-step-2`

**Request Body:**
```json
{
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "companyName": "Cultivos Mendez S.A.S",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "companyId": "jn7ea3r18m5ssd368qjve67ke97t6bpe",
  "organizationId": "org_test_1761514959078_anx8cl",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente."
}
```

**Validations:**
- Email must be verified first
- Geographic codes must be valid
- companyName required (2-100 chars)
- businessEntityType required

**Business Entity Types:**
- S.A.S (Sociedad por Acciones Simplificada)
- S.A. (Sociedad Anónima)
- Ltda (Limitada)
- E.U. (Empresa Unipersonal)
- Persona Natural

**Company Types:**
- cannabis
- coffee
- cocoa
- flowers
- mixed

---

### Endpoint 4: Get Departments

**POST** `/geographic/departments`

**Request Body:**
```json
{
  "countryCode": "CO"
}
```

**Response:**
```json
[
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  {
    "division_1_code": "08",
    "division_1_name": "Atlántico",
    "timezone": "America/Bogota"
  },
  ...
]
```

---

### Endpoint 5: Get Municipalities

**POST** `/geographic/municipalities`

**Request Body:**
```json
{
  "countryCode": "CO",
  "departmentCode": "05"
}
```

**Response:**
```json
[
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05"
  },
  {
    "division_2_code": "05002",
    "division_2_name": "Abejorral",
    "parent_division_1_code": "05"
  },
  ...
]
```

---

## Part 3: Bubble API Connector Setup

### Step 3.1: Install API Connector Plugin

1. Open Bubble app editor
2. Go to **Plugins** tab
3. Click **Add plugins**
4. Search for "API Connector"
5. Click **Install** (free plugin)

### Step 3.2: Configure Convex API

1. Open **Plugins** → **API Connector**
2. Click **Configure**
3. Click **Add another API**

Fill in:

**API Name**: `Convex`

**Authentication**: `None`

**Shared Headers**:
```
Content-Type: application/json
```

**Server URLs**:
- Development: `https://exciting-shrimp-34.convex.site`
- Production: `https://exciting-shrimp-34.convex.site`

**Save** and continue to Part 4.

---

## Part 4: Create 5 API Connectors in Bubble

### API Connector 1: RegisterUserStep1

**Settings:**
- **Name**: `RegisterUserStep1`
- **Use as**: `Action`
- **Method**: `POST`
- **URL**: `https://exciting-shrimp-34.convex.site/registration/register-step-1`

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

**Private Parameters**: All unchecked (all dynamic)

**Test Configuration**:
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "3001234567"
}
```

Click **Test** to verify.

---

### API Connector 2: VerifyEmailToken

**Settings:**
- **Name**: `VerifyEmailToken`
- **Use as**: `Action`
- **Method**: `POST`
- **URL**: `https://exciting-shrimp-34.convex.site/registration/verify-email`

**Body (JSON):**
```json
{
  "token": "<token>"
}
```

**Private Parameters**: All unchecked

---

### API Connector 3: RegisterCompanyStep2

**Settings:**
- **Name**: `RegisterCompanyStep2`
- **Use as**: `Action`
- **Method**: `POST`
- **URL**: `https://exciting-shrimp-34.convex.site/registration/register-step-2`

**Body (JSON):**
```json
{
  "userId": "<userId>",
  "companyName": "<companyName>",
  "businessEntityType": "<businessEntityType>",
  "companyType": "<companyType>",
  "country": "CO",
  "departmentCode": "<departmentCode>",
  "municipalityCode": "<municipalityCode>"
}
```

**Private Parameters**:
- `country`: Check ✓ (always "CO")
- All others: Uncheck ☐

---

### API Connector 4: GetDepartments

**Settings:**
- **Name**: `GetDepartments`
- **Use as**: `Data`
- **Method**: `POST`
- **URL**: `https://exciting-shrimp-34.convex.site/geographic/departments`

**Body (JSON):**
```json
{
  "countryCode": "CO"
}
```

**Private Parameters**:
- `countryCode`: Check ✓ (always "CO")

---

### API Connector 5: GetMunicipalities

**Settings:**
- **Name**: `GetMunicipalities`
- **Use as**: `Data`
- **Method**: `POST`
- **URL**: `https://exciting-shrimp-34.convex.site/geographic/municipalities`

**Body (JSON):**
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

**Private Parameters**:
- `countryCode`: Check ✓ (always "CO")
- `departmentCode`: Uncheck ☐ (dynamic)

---

## Part 5: Bubble Page Structure & Elements

### Page 1: `/signup-step-1` - User Registration

**Elements to Create:**

| Name | Type | Placeholder | Purpose |
|------|------|-------------|---------|
| `title` | Text | - | "Crear Cuenta" (title) |
| `subtitle` | Text | - | "Paso 1 de 3: Información Personal" |
| `email_input` | Input | "Correo Electrónico" | Email field |
| `password_input` | Input | "Contraseña (8+, número)" | Password field |
| `firstName_input` | Input | "Nombre" | First name field |
| `lastName_input` | Input | "Apellido" | Last name field |
| `phone_input` | Input | "Teléfono (opcional)" | Phone field (optional) |
| `error_message` | Text | - | Error display (hidden by default) |
| `success_message` | Text | - | Success message (hidden by default) |
| `register_button` | Button | "Crear Cuenta" | Submit button |

**Step-by-Step in Bubble:**

1. Create new page: `/signup-step-1`
2. Add container element (Column layout)
3. Add title text: "Crear Cuenta"
4. Add subtitle: "Paso 1 de 3"
5. Add 5 input elements:
   - email_input (Type: Email)
   - password_input (Type: Password)
   - firstName_input (Type: Text)
   - lastName_input (Type: Text)
   - phone_input (Type: Text, optional)
6. Add 2 text elements for messages:
   - error_message (hidden, red color)
   - success_message (hidden, green color)
7. Add register_button (green, full width)

---

### Page 2: `/signup-verify-email` - Email Verification

**Elements to Create:**

| Name | Type | Placeholder | Purpose |
|------|------|-------------|---------|
| `title` | Text | - | "Verificación de Email" |
| `instructions` | Text | - | "Se envió un código a: [email]" |
| `verification_code_input` | Input | "Código de 32 caracteres" | Token input |
| `verify_button` | Button | "Verificar" | Verify button |
| `resend_link` | Link | "Reenviar Código" | Resend trigger |
| `error_message` | Text | - | Error display (hidden) |
| `success_message` | Text | - | Success display (hidden) |

---

### Page 3: `/signup-step-2` - Company Creation

**Elements to Create:**

| Name | Type | Options/Placeholder | Purpose |
|------|------|---------------------|---------|
| `title` | Text | - | "Crear Empresa" |
| `subtitle` | Text | - | "Paso 3 de 3: Información de Empresa" |
| `company_name_input` | Input | "Nombre de la Empresa" | Company name |
| `business_type_dropdown` | Dropdown | S.A.S, S.A., Ltda, E.U., Persona Natural | Entity type |
| `company_type_dropdown` | Dropdown | cannabis, coffee, cocoa, flowers, mixed | Business type |
| `department_dropdown` | Dropdown | Dynamic (GetDepartments) | Department selector |
| `municipality_dropdown` | Dropdown | Dynamic (GetMunicipalities) | Municipality selector |
| `create_button` | Button | "Crear Empresa" | Submit button |
| `error_message` | Text | - | Error display |
| `success_message` | Text | - | Success display |

---

## Part 6: Custom States

Create these page-level custom states:

### Page 1 States (signup-step-1)
```
current_user_id (Text) - Save userId from Step 1
current_email (Text) - Save email from Step 1
registration_token (Text) - Save token for testing
```

### Page 2 States (signup-verify-email)
```
verification_code (Text) - User's manual code entry
is_verifying (Yes/No) - Loading state during verification
verification_complete (Yes/No) - Success flag
```

### Page 3 States (signup-step-2)
```
selected_department_code (Text) - Selected department
selected_municipality_code (Text) - Selected municipality
departments_list (List of Objects) - Cached departments
municipalities_list (List of Objects) - Cached municipalities
is_creating_company (Yes/No) - Loading flag
```

---

## Part 7: Detailed Workflow Setup in Bubble

### 7.1 Page 1 Workflow: RegisterUserStep1 (DETAILED)

**Trigger**: Click on `register_button`

**Step-by-Step Setup in Bubble:**

#### Step 1: Add Validation Action

1. Right-click on `register_button`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Element → Conditionally hide/disable element**
5. Configure:
   - Element: `register_button`
   - Condition:
     ```
     email_input value is empty
     OR password_input value is empty
     OR firstName_input value is empty
     OR lastName_input value is empty
     ```
   - Action: Disable if condition is true

#### Step 2: Client-Side Email Validation

1. Click **Add action**
2. Select **Element → Show → error_message**
3. Configure conditions:
   - Only show if: email_input value doesn't contain "@"
   - Set error_message text: "Por favor ingresa un email válido"

#### Step 3: Client-Side Password Validation

1. Click **Add action**
2. Select **Element → Show → error_message**
3. Condition: password_input value's length < 8
4. Set text: "Contraseña debe tener mínimo 8 caracteres"

#### Step 4: Hide Previous Messages

1. Click **Add action**
2. Select **Element → Hide → error_message**
3. Select **Element → Hide → success_message**

#### Step 5: Show Loading State

1. Click **Add action**
2. Select **Element → Disable → register_button**
3. Add spinner/loading icon to page and show it:
   - Select **Element → Show → loading_spinner**

#### Step 6: Make API Call

1. Click **Add action**
2. Select **Plugin → Call an API**
3. Choose: `RegisterUserStep1`
4. Configure parameters:
   - email: `email_input`'s value
   - password: `password_input`'s value
   - firstName: `firstName_input`'s value
   - lastName: `lastName_input`'s value
   - phone: `phone_input`'s value (can be empty)

#### Step 7: Handle Success Response

**Add event**: When RegisterUserStep1 is successful

1. Click **Add action**
2. Select **Data → Set custom state → current_user_id**
   - Value: `RegisterUserStep1.data.userId`

3. Click **Add action**
2. Select **Data → Set custom state → current_email**
   - Value: `RegisterUserStep1.data.email`

4. Click **Add action**
2. Select **Data → Set custom state → registration_token**
   - Value: `RegisterUserStep1.data.token`

5. Click **Add action**
2. Select **Element → Show → success_message**
3. Set text: `"¡Cuenta creada! Verifica tu correo: " & email_input value`

6. Click **Add action**
2. Select **Element → Clear → email_input**
   - Repeat for: password_input, firstName_input, lastName_input, phone_input

7. Click **Add action**
2. Select **Element → Hide → loading_spinner**

8. Click **Add action**
2. Select **Navigation → Go to page**
   - Page: `signup-verify-email`
   - Wait 2 seconds before: Check this box

#### Step 8: Handle Error Response

**Add event**: When RegisterUserStep1 is NOT successful

1. Click **Add action**
2. Select **Element → Show → error_message**
3. Set text: `RegisterUserStep1.data.error`

4. Click **Add action**
2. Select **Element → Enable → register_button**

5. Click **Add action**
2. Select **Element → Hide → loading_spinner**

---

### 7.2 Page 2 Workflow: VerifyEmailToken (DETAILED)

**Trigger**: Click on `verify_button`

#### Step 1: Validate Token Input

1. Right-click on `verify_button`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Element → Conditionally hide/disable element**
5. Condition: `verification_code_input value is empty`
6. If true, disable `verify_button`

#### Step 2: Show Validation Error

1. Click **Add action**
2. Select **Element → Show → error_message**
3. Set text: "Por favor ingresa el código de verificación"
4. Add condition: Only show if `verification_code_input` is empty

#### Step 3: Hide Previous Messages

1. Click **Add action**
2. Select **Element → Hide → error_message**
3. Click **Add action**
2. Select **Element → Hide → success_message**

#### Step 4: Show Loading State

1. Click **Add action**
2. Select **Element → Disable → verify_button**

#### Step 5: Make API Call

1. Click **Add action**
2. Select **Plugin → Call an API**
3. Choose: `VerifyEmailToken`
4. Parameters:
   - token: `verification_code_input`'s value

#### Step 6: Handle Success

**Add event**: When VerifyEmailToken is successful

1. Click **Add action**
2. Select **Data → Set custom state → verification_complete**
   - Value: Yes

2. Click **Add action**
2. Select **Element → Show → success_message**
3. Set text: "¡Email verificado correctamente! Redirigiendo..."

4. Click **Add action**
2. Select **Element → Clear → verification_code_input**

5. Click **Add action**
2. Select **Element → Hide → error_message**

6. Click **Add action**
2. Select **Navigation → Go to page**
   - Page: `signup-step-2`
   - Wait 2 seconds before: Check this

#### Step 7: Handle Error

**Add event**: When VerifyEmailToken is NOT successful

1. Click **Add action**
2. Select **Element → Show → error_message**
3. Set text: `VerifyEmailToken.data.error`

4. Click **Add action**
2. Select **Element → Enable → verify_button**

---

### 7.3 Page 2 Workflow: Resend Email (DETAILED)

**Trigger**: Click on `resend_link`

#### Step 1: Disable Resend During Request

1. Right-click on `resend_link`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Element → Disable → resend_link**

#### Step 2: Show Loading

1. Click **Add action**
2. Select **Element → Show** a loading text element

#### Step 3: Call Resend API

1. Click **Add action**
2. Select **Plugin → Call an API**
3. **Note**: Resend isn't exposed as separate endpoint, but you can re-trigger registration:
   - Use `RegisterUserStep1` again with same email
   - This will generate and send new token
   - Add rate-limiting check (optional)

#### Step 4: Show Success

**Add event**: When API is successful

1. Click **Add action**
2. Select **Element → Show → success_message**
3. Set text: "¡Nuevo código enviado! Revisa tu correo"

4. Click **Add action**
2. Select **Wait → 3 seconds**

5. Click **Add action**
2. Select **Element → Hide → success_message**

6. Click **Add action**
2. Select **Element → Enable → resend_link**

#### Step 5: Implement 5-Minute Cooldown

1. Create custom state: `resend_cooldown_seconds` (Number)
2. When resend succeeds:
   - Click **Add action**
   - Select **Data → Set custom state → resend_cooldown_seconds**
     - Value: 300 (5 minutes)

3. Create a repeating workflow that:
   - Runs every 1 second
   - Decrements `resend_cooldown_seconds` by 1
   - Updates display text: `"Reenviar en " & resend_cooldown_seconds & " segundos"`
   - When reaches 0, enable `resend_link` and stop timer

---

### 7.4 Page 3 Workflow: Load Departments (On Page Load)

**Trigger**: When page is loaded

1. Go to **Page settings** → Workflows
2. Add workflow: **On page load**
3. Click **Add action**
4. Select **Plugin → Call an API**
5. Choose: `GetDepartments`

#### Handle Success

1. Click **Add action**
2. Select **Data → Set custom state → departments_list**
   - Value: `GetDepartments.data`

3. Bind dropdown:
   - `department_dropdown` → Choices from dynamic data
   - Choices source: `current page's departments_list`
   - Display expression: `item.division_1_name`
   - Value expression: `item.division_1_code`

---

### 7.5 Page 3 Workflow: Department Selection Changed

**Trigger**: When `department_dropdown` value changes

1. Right-click on `department_dropdown`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Plugin → Call an API**
5. Choose: `GetMunicipalities`
6. Parameters:
   - countryCode: "CO"
   - departmentCode: `department_dropdown`'s value

#### Handle Success

1. Click **Add action**
2. Select **Data → Set custom state → selected_department_code**
   - Value: `department_dropdown`'s value

3. Click **Add action**
2. Select **Data → Set custom state → municipalities_list**
   - Value: `GetMunicipalities.data`

4. Click **Add action**
2. Select **Element → Clear → municipality_dropdown**

5. Bind municipality dropdown:
   - Choices source: `current page's municipalities_list`
   - Display expression: `item.division_2_name`
   - Value expression: `item.division_2_code`

---

### 7.6 Page 3 Workflow: Municipality Selection

**Trigger**: When `municipality_dropdown` value changes

1. Right-click on `municipality_dropdown`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Data → Set custom state → selected_municipality_code**
   - Value: `municipality_dropdown`'s value

---

### 7.7 Page 3 Workflow: Create Company & Auto-Login (MOST IMPORTANT)

**Trigger**: Click on `create_button`

#### Step 1: Validation

1. Right-click on `create_button`
2. Select **Start/Edit workflow**
3. Click **Add action**
4. Select **Element → Show → error_message** (conditional)
5. Conditions to check:
   ```
   company_name_input is empty
   OR business_type_dropdown is empty
   OR company_type_dropdown is empty
   OR department_dropdown is empty
   OR municipality_dropdown is empty
   ```
6. If any true, show error and STOP

#### Step 2: Disable Button & Show Loading

1. Click **Add action**
2. Select **Element → Disable → create_button**

3. Click **Add action**
2. Select **Element → Show → loading_spinner**

#### Step 3: Create Company (RegisterCompanyStep2)

1. Click **Add action**
2. Select **Plugin → Call an API**
3. Choose: `RegisterCompanyStep2`
4. Parameters:
   ```
   userId: current page's current_user_id (from page state)
   companyName: company_name_input value
   businessEntityType: business_type_dropdown value
   companyType: company_type_dropdown value
   country: "CO"
   departmentCode: selected_department_code (from page state)
   municipalityCode: selected_municipality_code (from page state)
   ```

#### Step 4: Auto-Login with Clerk (CRITICAL STEP)

**Add event**: When RegisterCompanyStep2 is successful

1. Click **Add action**
2. Select **Plugin → Call an API**
3. **Important**: Create new API call for auto-login:
   - Name: `AutoLoginWithClerk`
   - Method: POST
   - URL: `https://exciting-shrimp-34.convex.site/registration/auto-login`
   - Body:
     ```json
     {
       "userId": "<userId>",
       "email": "<email>",
       "password": "<password>",
       "firstName": "<firstName>",
       "lastName": "<lastName>",
       "companyName": "<companyName>"
     }
     ```

4. Parameters:
   ```
   userId: current page's current_user_id
   email: current page's current_email
   password: [Need to store from step 1!]
   firstName: [Need to store from step 1!]
   lastName: [Need to store from step 1!]
   companyName: company_name_input value
   ```

**IMPORTANT**: Add custom states to page 1 to store password, firstName, lastName for use later!

#### Step 5: Show Success Message

1. Click **Add action**
2. Select **Element → Show → success_message**
3. Set text: "¡Empresa creada exitosamente! Redirigiendo al dashboard..."

#### Step 6: Clear Form & Hide Loading

1. Click **Add action**
2. Select **Element → Clear** (all inputs)

3. Click **Add action**
2. Select **Element → Hide → loading_spinner**

#### Step 7: Navigate to Dashboard

1. Click **Add action**
2. Select **Navigation → Go to page**
   - Page: `dashboard`
   - Wait 2 seconds before: Check

---

## Part 8: Critical: Store Password & Names for Auto-Login

### Update Page 1 Custom States

Add these additional states to `/signup-step-1`:

```
registration_password (Text) - Store password
registration_first_name (Text) - Store firstName
registration_last_name (Text) - Store lastName
```

### Update Workflow: RegisterUserStep1 Success Handler

Add these actions after setting `registration_token`:

1. Click **Add action**
2. Select **Data → Set custom state → registration_password**
   - Value: `password_input`'s value

3. Click **Add action**
2. Select **Data → Set custom state → registration_first_name**
   - Value: `firstName_input`'s value

4. Click **Add action**
2. Select **Data → Set custom state → registration_last_name**
   - Value: `lastName_input`'s value

### Pass States Between Pages

When navigating from Page 2 to Page 3:

1. Right-click navigation action
2. Add parameter passing:
   - Current page states → Available to next page
   - Use data from previous pages via:
     ```
     GetPageData(signup-step-1).registration_password
     GetPageData(signup-step-1).registration_first_name
     GetPageData(signup-step-1).registration_last_name
     ```

---

## Part 9: Email Verification Flow (Resend Integration)

### When User Registers (Step 1):

1. User fills form → clicks "Crear Cuenta"
2. API call: `RegisterUserStep1`
3. **Backend automatically**:
   - Hashes password
   - Creates user in Convex
   - **Generates 32-char token**
   - **Sends email via Resend** with:
     - Verification link with token
     - Plain token for manual entry
     - Expiry info (24 hours)
     - Spanish HTML template

4. **Response includes**:
   - userId
   - email
   - token (for testing in dev)
   - expiresAt timestamp

### User Receives Email:

Email from: `noreply@alquemist.com`

Content includes:
- "Bienvenido a Alquemist"
- "Verificar Email" button (links to Bubble app)
- Plain token to copy-paste
- Expiry warning (24 hours)
- Support email link

### User Verifies (Step 2):

Option A: Click link in email
- Auto-populates token
- User clicks "Verificar"

Option B: Manual entry
- Copy token from email
- Paste in Bubble form
- Click "Verificar"

---

## Part 10: Clerk Auto-Login Flow

### When Company Created (Step 3):

1. Company created via `RegisterCompanyStep2`
2. **Immediately call**: `AutoLoginWithClerk`
3. Backend:
   - Creates user in Clerk
   - Generates session
   - Links Convex user to Clerk user
   - **Sends welcome email** via Resend
   - Returns: clerkUserId, sessionId

### Clerk Welcome Email:

- From: `noreply@alquemist.com`
- To: User's email
- Subject: "¡Bienvenido a Alquemist, [firstName]!"
- Content:
  - Welcome message
  - Company name confirmation
  - Next steps (Create facility, etc.)
  - Dashboard link

### Session Persistence:

- User is logged in to Clerk
- Can now access authenticated pages
- Session persists across refreshes
- User info available in Clerk context

---

## Part 11: Testing Checklist

### Test Case 1: Complete Happy Path

```
1. Go to /signup-step-1
2. Fill all fields
3. Click "Crear Cuenta"
4. Verify: Success message
5. Verify: Redirect to /signup-verify-email
6. Get token (from Convex logs or page state)
7. Paste token in verification form
8. Click "Verificar"
9. Verify: Success message
10. Verify: Redirect to /signup-step-2
11. Fill company form (select department/municipality)
12. Click "Crear Empresa"
13. Verify: Success message
14. Verify: Redirect to /dashboard
15. Verify: User logged in with Clerk
```

### Test Case 2: Email Resend

```
1. Register user
2. Go to /signup-verify-email
3. Click "Reenviar Código"
4. Verify: New email sent
5. Verify: Button disabled for 5 minutes
6. Verify: Countdown timer shows
```

### Test Case 3: Error Scenarios

```
Invalid Email: "notanemail" → Error message
Weak Password: "weak" → Error message
Duplicate Email: Use same email twice → Error
Invalid Token: Paste random token → Error
Email Not Verified: Skip verify, try to create company → Error
Invalid Location: Select invalid municipality → Error
```

---

## Part 12: Troubleshooting

### Problem: API returns 404

**Solution**:
- Verify URL: `https://exciting-shrimp-34.convex.site/...`
- Check endpoint path spelling
- Verify Convex is deployed: `npx convex deploy`

### Problem: Email not sending

**Solution**:
- Check RESEND_API_KEY configured: `npx convex env list`
- Verify Resend account has credits
- Check sender email is verified in Resend
- Check spam folder

### Problem: Clerk auto-login fails

**Solution**:
- Check CLERK_SECRET_KEY configured
- Verify Clerk project created
- Check user not already exists in Clerk
- Check network tab for error response

### Problem: Departments dropdown empty

**Solution**:
- Run: `npx convex run seedGeographic:seedColombianGeography`
- Verify GetDepartments API call
- Check Convex logs for errors
- Re-initialize API call in Bubble

### Problem: Token "already used"

**Solution**:
- Token is single-use
- Call resend to get new token
- Token expires in 24 hours

---

## Summary of Files & Components

### Convex Backend Files
- `convex/registration.ts` - User & company creation
- `convex/emailVerification.ts` - Token management
- `convex/email.ts` - Resend integration
- `convex/clerk.ts` - Clerk integration
- `convex/http.ts` - HTTP endpoints
- `convex/geographic.ts` - Location data

### Bubble Pages
- `/signup-step-1` - User registration
- `/signup-verify-email` - Email verification
- `/signup-step-2` - Company creation
- `/dashboard` - Authenticated landing

### API Endpoints (5 Total)
- `/registration/register-step-1`
- `/registration/verify-email`
- `/registration/register-step-2`
- `/geographic/departments`
- `/geographic/municipalities`

### Integrations
- **Resend**: Email verification & welcome emails
- **Clerk**: User authentication & sessions

---

## Next Steps

1. ✅ Setup environment variables
2. ✅ Create Bubble pages
3. ✅ Configure API connectors
4. ✅ Add workflows
5. ✅ Test complete flow
6. ✅ Deploy to production

**After Module 1 & 2**:
- Module 3: Subscription & Payments
- Module 5: Facility Management
- Module 6: Cultivation Cycles

---

**Status**: ✅ Backend Complete | 🔧 Ready for Bubble Implementation
**Estimated Time**: 3-4 hours for complete setup
**Technical Level**: Intermediate (Bubble workflows + API integration)
