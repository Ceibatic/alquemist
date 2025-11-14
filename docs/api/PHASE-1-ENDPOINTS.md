# PHASE 1: API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Database Schema**: See [../database/SCHEMA.md](../database/SCHEMA.md)
**UI Requirements**: See [../ui/bubble/PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md)

---

## BUBBLE API CONNECTOR SETUP

### Initial Configuration

1. **Add Plugin**: Install "API Connector" plugin in Bubble
2. **Create API**: Name it "Alquemist Backend"
3. **Authentication**: None (we use custom Bearer tokens)
4. **Base URL**: Leave empty (use full URLs per call)

### Common Settings

**Content-Type**: All calls use `application/json`

**Authentication Header** (for authenticated endpoints):
- Key: `Authorization`
- Value: `Bearer <token>` where `<token>` is dynamic from User's session_token field

### Call Types in Bubble

- **Data Call**: Use when you need to display/retrieve information (GET-like operations)
- **Action Call**: Use when you're creating/updating/deleting data (POST operations)

### Dynamic Values Setup

When configuring each call:
1. Click "Add parameter" for each dynamic field
2. Set as "Private" if it contains sensitive data (passwords, tokens)
3. Set as "Shared" for non-sensitive data (email, names)
4. Choose "Taken from URL" for query parameters
5. Choose "Taken from body" for request body fields

---

## MODULE 1: Authentication & Account Creation

### Check Email Availability

**Status**: ✅ Ready

**Endpoint**: `POST /registration/check-email`

**Triggered by**: Bubble signup form (on email input blur/change)

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "available": true,
  "email": "user@example.com"
}
```

**Convex Function**: `registration.checkEmailAvailability`

**Database Operations**:
- **Reads**: `users` table → check if email exists

#### Bubble API Setup

**Call Type**: Action (modifies nothing, but used in workflow)

**API Connector Configuration**:
- **Name**: `checkEmailAvailability`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/check-email`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "email": "<email>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| email | text | No | Body | user@example.com |

**Response Fields to Initialize**:
- `available` (boolean)
- `email` (text)

**Bubble Usage**:
1. **Trigger**: Input "email"'s value is changed → This input's value is not empty
2. **Workflow Action**: Plugins → Alquemist Backend - checkEmailAvailability
   - email = `Input email's value`
3. **Conditional Actions**:
   - If `Result of Step 1's available is "false"`: Show alert "Este email ya está registrado"
   - If `Result of Step 1's available is "true"`: Enable "Create Account" button

---

### Register User (Step 1)

**Status**: ✅ Ready

**Endpoint**: `POST /registration/register-step-1`

**Triggered by**: Bubble "Create Account" button

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567"
}
```

**Response**:
```json
{
  "success": true,
  "userId": "j97abc...",
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "email": "user@example.com",
  "message": "Cuenta creada. Por favor verifica tu correo electrónico.",
  "verificationSent": true
}
```

**Convex Function**: `registration.registerUserStep1`

**Database Operations**:
- **Writes**: `users` table → create new user (email_verified=false)
- **Writes**: `sessions` table → create 30-day session token
- **Writes**: `emailVerificationTokens` table → create 24h verification token
- **Reads**: `roles` table → get COMPANY_OWNER role ID

**Validation**:
- Email format valid
- Password strength: min 8 chars, letters + numbers
- Email not already registered

**Important**: The `token` field is a **session token** (30-day validity) for API authentication. Save this to Bubble User data type.

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `registerUserStep1`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/register-step-1`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| email | text | No | Body | user@example.com |
| password | text | Yes | Body | SecurePass123! |
| firstName | text | No | Body | Juan |
| lastName | text | No | Body | Pérez |
| phone | text | No | Body | 3001234567 |

**Response Fields to Initialize**:
- `success` (boolean)
- `userId` (text)
- `token` (text)
- `email` (text)
- `message` (text)
- `verificationSent` (boolean)

**Bubble Usage**:
1. **Trigger**: Button "Create Account" is clicked
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - registerUserStep1
     - email = `Input email's value`
     - password = `Input password's value`
     - firstName = `Input firstName's value`
     - lastName = `Input lastName's value`
     - phone = `Input phone's value`
   - **Step 2** (Only when Step 1's success = true): Sign the user up
     - Email = `Result of Step 1's email`
     - Password = `Input password's value` (use same password from input)
   - **Step 3**: Make changes to Current User
     - `session_token` = `Result of Step 1's token`
     - `backend_user_id` = `Result of Step 1's userId`
     - `email_verified` = no
   - **Step 4**: Navigate to "email-verification" page

**Error Handling**:
- Show `Result of Step 1's message` if `success` is false
- Common errors: "Email already exists", "Password too weak"

---

### Verify Email Token

**Status**: ✅ Ready

**Endpoint**: `POST /registration/verify-email`

**Triggered by**: Bubble "Verify" button OR email link click

**Request**:
```json
{
  "token": "abc123xyz456..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "¡Email verificado exitosamente!",
  "userId": "j97abc..."
}
```

**Convex Function**: `emailVerification.verifyEmailToken`

**Database Operations**:
- **Reads**: `emailVerificationTokens` table → find token
- **Reads**: `users` table → get user info
- **Updates**: `emailVerificationTokens` table → set used=true
- **Updates**: `users` table → set email_verified=true

**Validation**:
- Token exists and matches
- Token not expired (24h limit)
- Token not already used

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `verifyEmailToken`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/verify-email`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "token": "<token>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| token | text | Yes | Body | abc123xyz456... |

**Response Fields to Initialize**:
- `success` (boolean)
- `message` (text)
- `userId` (text)

**Bubble Usage - Option 1: Manual Button**:
1. **Trigger**: Button "Verify Email" is clicked
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - verifyEmailToken
     - token = `Input verification_code's value`
   - **Step 2** (Only when Step 1's success = true): Make changes to Current User
     - `email_verified` = yes
   - **Step 3**: Navigate to "company-setup" page

**Bubble Usage - Option 2: Email Link** (URL parameter):
1. **Page Load Workflow**: When "email-verification" page is loaded AND Get token from page URL is not empty
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - verifyEmailToken
     - token = `Get token from page URL`
   - **Step 2** (Only when Step 1's success = true): Make changes to Current User
     - `email_verified` = yes
   - **Step 3**: Show success message, navigate after 2 seconds

**Error Handling**:
- Show alert with `Result of Step 1's message`
- Common errors: "Token expired", "Token invalid", "Token already used"

---

### Resend Verification Email

**Status**: ✅ Ready

**Endpoint**: `POST /registration/resend-verification`

**Triggered by**: Bubble "Resend Email" button

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email de verificación reenviado",
  "token": "xyz123..."
}
```

**Convex Function**: `emailVerification.resendVerificationEmail`

**Database Operations**:
- **Reads**: `users` table → find user by email
- **Writes**: `emailVerificationTokens` table → create new token
- **External**: Resend API → send email

**Rate Limiting**:
- Max 5 resends
- 5 minutes between each resend

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `resendVerificationEmail`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/resend-verification`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "email": "<email>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| email | text | No | Body | user@example.com |

**Response Fields to Initialize**:
- `success` (boolean)
- `message` (text)
- `token` (text)

**Bubble Usage**:
1. **Trigger**: Button "Resend Verification Email" is clicked
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - resendVerificationEmail
     - email = `Current User's email`
   - **Step 2** (Only when Step 1's success = true): Show alert "Email reenviado. Revisa tu bandeja de entrada."
   - **Step 2 Alternative** (When Step 1's success = false): Show alert with `Result of Step 1's message`

**Rate Limiting UI**:
- Disable button for 5 minutes after successful resend
- Use Custom State "last_resend_time" to track
- Show countdown: "Reenviar disponible en X minutos"

**Error Handling**:
- "Rate limit exceeded": Show time remaining
- "User not found": Redirect to signup
- "Email already verified": Navigate to company setup

---

### Check Verification Status

**Status**: ✅ Ready

**Endpoint**: `POST /registration/check-verification-status`

**Triggered by**: Bubble page load (verification page polling)

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "exists": true,
  "verified": true,
  "userId": "j97abc...",
  "message": "Email verificado"
}
```

**Convex Function**: `emailVerification.checkEmailVerificationStatus`

**Database Operations**:
- **Reads**: `users` table → check email_verified status

#### Bubble API Setup

**Call Type**: Data (for polling/checking status)

**API Connector Configuration**:
- **Name**: `checkVerificationStatus`
- **Use as**: Data
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/check-verification-status`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "email": "<email>"
}
```
- **Data Type**: Return list = No (single object)

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| email | text | No | Body | user@example.com |

**Response Fields to Initialize**:
- `exists` (boolean)
- `verified` (boolean)
- `userId` (text)
- `message` (text)

**Bubble Usage - Polling Pattern**:
1. **Add Repeating Element** on "email-verification" page
   - Type: Custom
   - Data Source: Get data from external API → checkVerificationStatus
     - email = `Current User's email`
   - Refresh interval: Every 5 seconds
2. **Conditional Workflow**: When RepeatingGroup's checkVerificationStatus's verified is "yes"
   - **Step 1**: Cancel current workflow
   - **Step 2**: Make changes to Current User
     - `email_verified` = yes
   - **Step 3**: Navigate to "company-setup" page

**Alternative - Manual Check Button**:
1. **Trigger**: Button "Check Status" is clicked
2. **Workflow Actions**:
   - **Step 1**: Display data (Get data from external API)
     - API: checkVerificationStatus
     - email = `Current User's email`
   - **Step 2** (Only when Step 1's verified = true): Navigate to "company-setup"

**Error Handling**:
- If `exists` is false: User doesn't exist, redirect to signup
- Show `message` field to inform user of status

---

## MODULE 2: Company Creation

### Get Departments

**Status**: ✅ Ready

**Endpoint**: `POST /geographic/departments`

**Triggered by**: Bubble company setup page load

**Request**:
```json
{
  "countryCode": "CO"
}
```

**Response**:
```json
[
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  {
    "division_1_code": "11",
    "division_1_name": "Bogotá D.C.",
    "timezone": "America/Bogota"
  }
]
```

**Convex Function**: `geographic.getDepartments`

**Database Operations**:
- **Reads**: `geographic_locations` table → where administrative_level=1

#### Bubble API Setup

**Call Type**: Data (returns list for dropdown)

**API Connector Configuration**:
- **Name**: `getDepartments`
- **Use as**: Data
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/geographic/departments`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "countryCode": "<countryCode>"
}
```
- **Data Type**: Return list = Yes (array of departments)

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| countryCode | text | No | Body | CO |

**Response Fields to Initialize**:
- `division_1_code` (text)
- `division_1_name` (text)
- `timezone` (text)

**Bubble Usage**:
1. **Dropdown "Departamento"**:
   - Type: Dynamic choices
   - Choices Source: Get data from external API → getDepartments
     - countryCode = "CO" (hardcoded for now)
   - Option caption: `This Department's division_1_name`
   - Option value: `This Department's division_1_code`
2. **Display**: Show department names in dropdown
3. **On Selection**: Trigger getMunicipalities call with selected department code

**Caching**:
- Since departments rarely change, consider loading once on page load
- Store in Custom State if needed for offline access

---

### Get Municipalities

**Status**: ✅ Ready

**Endpoint**: `POST /geographic/municipalities`

**Triggered by**: Bubble department dropdown selection

**Request**:
```json
{
  "countryCode": "CO",
  "departmentCode": "05"
}
```

**Response**:
```json
[
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05",
    "timezone": "America/Bogota"
  },
  {
    "division_2_code": "05002",
    "division_2_name": "Abejorral",
    "parent_division_1_code": "05"
  }
]
```

**Convex Function**: `geographic.getMunicipalities`

**Database Operations**:
- **Reads**: `geographic_locations` table → where administrative_level=2 AND parent_division_1_code=departmentCode

#### Bubble API Setup

**Call Type**: Data (returns list for dropdown)

**API Connector Configuration**:
- **Name**: `getMunicipalities`
- **Use as**: Data
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/geographic/municipalities`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "countryCode": "<countryCode>",
  "departmentCode": "<departmentCode>"
}
```
- **Data Type**: Return list = Yes (array of municipalities)

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| countryCode | text | No | Body | CO |
| departmentCode | text | No | Body | 05 |

**Response Fields to Initialize**:
- `division_2_code` (text)
- `division_2_name` (text)
- `parent_division_1_code` (text)
- `timezone` (text)

**Bubble Usage**:
1. **Dropdown "Municipio"**:
   - Type: Dynamic choices
   - Choices Source: Get data from external API → getMunicipalities
     - countryCode = "CO"
     - departmentCode = `Dropdown Departamento's value`
   - Option caption: `This Municipality's division_2_name`
   - Option value: `This Municipality's division_2_code`
2. **Conditional Display**: Only show when department is selected
3. **Reset on Department Change**: Clear municipality selection when department changes

**Workflow - Department Changed**:
1. **Trigger**: Dropdown "Departamento"'s value is changed
2. **Actions**:
   - **Step 1**: Reset input → Dropdown "Municipio"
   - **Step 2**: Dropdown "Municipio" loads new data automatically (dynamic source refreshes)

---

### Create Company (Step 2)

**Status**: ✅ Ready

**Endpoint**: `POST /registration/register-step-2`

**Triggered by**: Bubble "Create Company" button

**Request**:
```json
{
  "userId": "j97abc...",
  "companyName": "Cultivos San José S.A.S",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

**Response**:
```json
{
  "success": true,
  "userId": "j97abc...",
  "companyId": "k12def...",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente. Acceso a plataforma."
}
```

**Convex Function**: `registration.registerCompanyStep2`

**Database Operations**:
- **Reads**: `users` table → verify email_verified=true
- **Reads**: `geographic_locations` table → validate municipality and department
- **Writes**: `companies` table → create company with:
  - name, business_entity_type, company_type
  - country, department/municipality codes and names
  - subscription_plan="trial", max_facilities=1, max_users=3
  - timezone from municipality
- **Updates**: `users` table → set company_id, timezone from municipality

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `registerCompanyStep2`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/register-step-2`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
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

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| userId | text | No | Body | j97abc... |
| companyName | text | No | Body | Cultivos San José S.A.S |
| businessEntityType | text | No | Body | S.A.S |
| companyType | text | No | Body | cannabis |
| country | text | No | Body | CO |
| departmentCode | text | No | Body | 05 |
| municipalityCode | text | No | Body | 05001 |

**Response Fields to Initialize**:
- `success` (boolean)
- `userId` (text)
- `companyId` (text)
- `message` (text)

**Bubble Usage**:
1. **Trigger**: Button "Create Company" is clicked
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - registerCompanyStep2
     - userId = `Current User's backend_user_id`
     - companyName = `Input companyName's value`
     - businessEntityType = `Dropdown businessEntityType's value`
     - companyType = `Dropdown companyType's value`
     - country = "CO"
     - departmentCode = `Dropdown Departamento's value`
     - municipalityCode = `Dropdown Municipio's value`
   - **Step 2** (Only when Step 1's success = true): Make changes to Current User
     - `company_id` = `Result of Step 1's companyId`
     - `company_name` = `Input companyName's value`
   - **Step 3**: Navigate to "dashboard" page

**Required Option Sets** (for dropdowns):
- **businessEntityType**: S.A.S, S.A., Ltda, E.U., etc.
- **companyType**: cannabis, coffee, flowers, vegetables, etc.

**Error Handling**:
- "Email not verified": Redirect to verification page
- "Invalid municipality": Show error, check dropdown values
- Show `Result of Step 1's message` on error

---

### Simple Login

**Status**: ✅ Ready

**Endpoint**: `POST /registration/login`

**Triggered by**: Bubble login page "Log In" button

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "userId": "j97abc...",
  "companyId": "k12def...",
  "user": {
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "locale": "es",
    "preferredLanguage": "es"
  },
  "company": {
    "name": "Cultivos San José S.A.S",
    "subscriptionPlan": "trial"
  }
}
```

**Convex Function**: `registration.login`

**Database Operations**:
- **Reads**: `users` table → find by email, verify password_hash
- **Reads**: `companies` table → get company info
- **Writes**: `sessions` table → create new 30-day session token
- **Updates**: `users` table → update last_login, reset failed_login_attempts

**Validation**:
- Email exists
- Password correct (hash comparison)
- Email verified (email_verified=true)
- Company exists (company_id not null)
- Company status is "active"

**Important**: The `token` field is a **session token** (30-day validity) for API authentication. Save this to Bubble User data type. A new token is generated on each login, invalidating the previous session.

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `login`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "email": "<email>",
  "password": "<password>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| email | text | No | Body | user@example.com |
| password | text | Yes | Body | SecurePass123! |

**Response Fields to Initialize**:
- `success` (boolean)
- `token` (text)
- `userId` (text)
- `companyId` (text)
- `user` (object)
  - `email` (text)
  - `firstName` (text)
  - `lastName` (text)
  - `locale` (text)
  - `preferredLanguage` (text)
- `company` (object)
  - `name` (text)
  - `subscriptionPlan` (text)

**Bubble Usage**:
1. **Trigger**: Button "Log In" is clicked
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - login
     - email = `Input email's value`
     - password = `Input password's value`
   - **Step 2** (Only when Step 1's success = true): Log the user in
     - Email = `Result of Step 1's user:email`
     - Password = `Input password's value`
   - **Step 3**: Make changes to Current User
     - `session_token` = `Result of Step 1's token`
     - `backend_user_id` = `Result of Step 1's userId`
     - `company_id` = `Result of Step 1's companyId`
     - `company_name` = `Result of Step 1's company:name`
     - `first_name` = `Result of Step 1's user:firstName`
     - `last_name` = `Result of Step 1's user:lastName`
     - `email_verified` = yes
   - **Step 4**: Navigate to "dashboard" page

**Error Handling**:
- "Invalid credentials": Show "Email o contraseña incorrectos"
- "Email not verified": Show message, redirect to verification page
- "Company not found": Show message, redirect to company setup
- "Account inactive": Contact support message

**Security Notes**:
- Always use HTTPS
- Never log or display the session token
- Clear password input after failed attempts
- Implement rate limiting on frontend (max 5 attempts)

---

### Validate Session Token

**Status**: ✅ Ready

**Endpoint**: `GET /registration/validate-token`

**Triggered by**: Bubble protected page load, or before any authenticated API call

**Headers**:
```
Authorization: Bearer a2g3YnI1M2RuazR5bWplNms...
```

**Query Parameters**:
```json
{
  "token": "a2g3YnI1M2RuazR5bWplNms..."
}
```

**Response (Valid)**:
```json
{
  "valid": true,
  "userId": "j97abc...",
  "companyId": "k12def...",
  "user": {
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "locale": "es",
    "preferredLanguage": "es",
    "roleId": "role123..."
  },
  "company": {
    "id": "k12def...",
    "name": "Cultivos San José S.A.S",
    "status": "active",
    "subscriptionPlan": "trial"
  }
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "error": "Token expirado"
}
```

**Convex Function**: `registration.validateToken`

**Database Operations**:
- **Reads**: `sessions` table → find token, check is_active and expires_at
- **Reads**: `users` table → get user info, check status
- **Reads**: `companies` table → get company info
- **Updates**: `sessions` table → update last_used_at timestamp

**Validation**:
- Token exists in database
- Token is_active = true
- Token not expired (<30 days old)
- User status = "active"

**Bubble Usage**: Call this on every protected page load. If `valid: false`, log user out and redirect to login page.

#### Bubble API Setup

**Call Type**: Data (checking/validating)

**API Connector Configuration**:
- **Name**: `validateToken`
- **Use as**: Data
- **Method**: GET
- **URL**: `https://handsome-jay-388.convex.site/registration/validate-token?token=<token>`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <token>` (optional, but good practice)
- **Data Type**: Return list = No (single object)

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| token | text | Yes | URL | a2g3YnI1M2RuazR5bWplNms... |

**Response Fields to Initialize**:
- `valid` (boolean)
- `userId` (text)
- `companyId` (text)
- `error` (text)
- `user` (object)
  - `email` (text)
  - `firstName` (text)
  - `lastName` (text)
  - `locale` (text)
  - `preferredLanguage` (text)
  - `roleId` (text)
- `company` (object)
  - `id` (text)
  - `name` (text)
  - `status` (text)
  - `subscriptionPlan` (text)

**Bubble Usage - Page Load Protection**:
1. **Every Protected Page**: Add this workflow on page load
2. **Workflow**: When Page is loaded
   - **Step 1**: Get data from external API → validateToken
     - token = `Current User's session_token`
   - **Step 2** (Only when Step 1's valid is "false"): Log the user out
   - **Step 3**: Navigate to "login" page
   - **Step 4**: Show alert "Sesión expirada. Por favor inicia sesión nuevamente."

**Bubble Usage - Reusable Element** (Recommended):
1. Create a **Reusable Element** "SessionValidator"
2. Place on every protected page
3. Runs validation automatically on page load
4. Handles logout and redirect centrally

**Performance Note**:
- Consider caching validation for 5 minutes to reduce API calls
- Use Custom State to track last validation time
- Only re-validate if > 5 minutes since last check

---

### Logout

**Status**: ✅ Ready

**Endpoint**: `POST /registration/logout`

**Triggered by**: Bubble logout button

**Request**:
```json
{
  "token": "a2g3YnI1M2RuazR5bWplNms..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Token no encontrado"
}
```

**Convex Function**: `registration.logout`

**Database Operations**:
- **Reads**: `sessions` table → find token
- **Updates**: `sessions` table → set is_active=false, revoked_at=now

**Bubble Usage**:
1. Call this endpoint with user's session token
2. Clear User data type `session_token` field
3. "Log the user out" action
4. Navigate to login page

#### Bubble API Setup

**Call Type**: Action

**API Connector Configuration**:
- **Name**: `logout`
- **Use as**: Action
- **Method**: POST
- **URL**: `https://handsome-jay-388.convex.site/registration/logout`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body Type**: JSON
- **Body**:
```json
{
  "token": "<token>"
}
```

**Parameters**:
| Parameter | Type | Private | Taken from | Example |
|-----------|------|---------|------------|---------|
| token | text | Yes | Body | a2g3YnI1M2RuazR5bWplNms... |

**Response Fields to Initialize**:
- `success` (boolean)
- `message` (text)
- `error` (text)

**Bubble Usage**:
1. **Trigger**: Button "Logout" is clicked (or menu item selected)
2. **Workflow Actions**:
   - **Step 1**: Plugins → Alquemist Backend - logout
     - token = `Current User's session_token`
   - **Step 2**: Make changes to Current User
     - `session_token` = empty (clear the token)
     - `backend_user_id` = empty
     - `company_id` = empty
   - **Step 3**: Log the user out
   - **Step 4**: Navigate to "login" page
   - **Step 5** (Optional): Show toast "Sesión cerrada exitosamente"

**Best Practices**:
- Always call logout endpoint before Bubble's "Log the user out" action
- This ensures session is invalidated on backend
- Even if API call fails, still log user out from Bubble for security
- Clear all sensitive Custom States on logout

**Error Handling**:
- If API call fails, still proceed with Bubble logout
- Don't block user from logging out
- Log error for debugging but continue workflow

---

## MODULE 3: Facility Creation

⚠️ **STATUS**: Not yet implemented

**Note**: Bubble API setup instructions will be added once these endpoints are implemented in the backend. The endpoint specifications below are placeholders for future development.

---

### Create Facility

**Endpoint**: `POST /facilities/create`

**Triggered by**: Bubble "Create Facility" button

**Request**:
```json
{
  "companyId": "k12def...",
  "name": "North Farm",
  "licenseNumber": "LC-12345-2025",
  "licenseType": "commercial_growing",
  "primaryCropTypeIds": ["crop123", "crop456"],
  "address": "Finca La Esperanza, Km 15 Vía El Carmen",
  "municipalityCode": "05001",
  "departmentCode": "05",
  "latitude": 6.244747,
  "longitude": -75.581211,
  "totalAreaM2": 5000,
  "climateZone": "tropical"
}
```

**Response**:
```json
{
  "success": true,
  "facilityId": "f78ghi...",
  "message": "Instalación creada exitosamente"
}
```

**Convex Function**: `facilities.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `companies` table → check max_facilities limit
- **Reads**: `geographic_locations` table → validate municipality/department
- **Reads**: `crop_types` table → validate crop type IDs
- **Writes**: `facilities` table → create facility record

**Validation**:
- License number unique across system
- Company hasn't exceeded max_facilities limit
- Valid municipality and department codes
- Valid crop type IDs

---

### Get Facilities by Company

**Endpoint**: `GET /facilities/get-by-company`

**Triggered by**: Bubble facility list page load

**Request**:
```json
{
  "companyId": "k12def..."
}
```

**Response**:
```json
{
  "facilities": [
    {
      "id": "f78ghi...",
      "name": "North Farm",
      "licenseNumber": "LC-12345-2025",
      "primaryCropTypeIds": ["crop123"],
      "totalAreaM2": 5000,
      "status": "active"
    }
  ]
}
```

**Convex Function**: `facilities.getByCompany` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `facilities` table → where company_id=companyId

---

### Check License Availability

**Endpoint**: `POST /facilities/check-license`

**Triggered by**: Bubble license input blur/change

**Request**:
```json
{
  "licenseNumber": "LC-12345-2025"
}
```

**Response**:
```json
{
  "available": true,
  "licenseNumber": "LC-12345-2025"
}
```

**Convex Function**: `facilities.checkLicenseAvailability` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `facilities` table → check if license exists

---

## MODULE 4: Area Setup

⚠️ **STATUS**: Not yet implemented

**Note**: Bubble API setup instructions will be added once these endpoints are implemented in the backend. The endpoint specifications below are placeholders for future development.

---

### Create Area

**Endpoint**: `POST /areas/create`

**Triggered by**: Bubble "Save Area" button in popup

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "name": "Propagation Room",
  "areaType": "propagation",
  "compatibleCropTypeIds": ["crop123"],
  "totalAreaM2": 50,
  "capacity": 500,
  "climateControlled": true,
  "environmentalSpecs": {
    "tempMin": 20,
    "tempMax": 25,
    "humidityMin": 60,
    "humidityMax": 70
  }
}
```

**Response**:
```json
{
  "success": true,
  "areaId": "a99jkl...",
  "message": "Área creada exitosamente"
}
```

**Convex Function**: `areas.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `facilities` table → verify facility exists
- **Writes**: `areas` table → create area record

---

### Get Areas by Facility

**Endpoint**: `GET /areas/get-by-facility`

**Triggered by**: Bubble areas page load

**Request**:
```json
{
  "facilityId": "f78ghi..."
}
```

**Response**:
```json
{
  "areas": [
    {
      "id": "a99jkl...",
      "name": "Propagation Room",
      "areaType": "propagation",
      "totalAreaM2": 50,
      "capacity": 500,
      "climateControlled": true,
      "status": "active"
    }
  ]
}
```

**Convex Function**: `areas.getByFacility` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `areas` table → where facility_id=facilityId

---

### Update Area

**Endpoint**: `POST /areas/update`

**Triggered by**: Bubble "Save Area" button (edit mode)

**Request**:
```json
{
  "areaId": "a99jkl...",
  "name": "Propagation Room A",
  "totalAreaM2": 60,
  "capacity": 600
}
```

**Response**:
```json
{
  "success": true,
  "message": "Área actualizada exitosamente"
}
```

**Convex Function**: `areas.update` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `areas` table → update specified fields

---

### Delete Area

**Endpoint**: `POST /areas/delete`

**Triggered by**: Bubble "Delete" button

**Request**:
```json
{
  "areaId": "a99jkl..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Área eliminada exitosamente"
}
```

**Convex Function**: `areas.delete` ⚠️ TO BE CREATED

**Database Operations**:
- **Validation**: Check no active batches in area
- **Updates**: `areas` table → set status="inactive" OR hard delete

---

## MODULE 5: Cultivar Selection

⚠️ **STATUS**: Not yet implemented

**Note**: Bubble API setup instructions will be added once these endpoints are implemented in the backend. The endpoint specifications below are placeholders for future development.

---

### Get Crop Types

**Endpoint**: `GET /crops/get-types`

**Triggered by**: Bubble cultivar page load

**Request**: None

**Response**:
```json
{
  "cropTypes": [
    {
      "id": "crop123",
      "name": "Cannabis",
      "display_name_es": "Cannabis"
    },
    {
      "id": "crop456",
      "name": "Coffee",
      "display_name_es": "Café"
    }
  ]
}
```

**Convex Function**: `crops.getCropTypes` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `crop_types` table

---

### Get Cultivars by Crop

**Endpoint**: `GET /cultivars/get-by-crop`

**Triggered by**: Bubble crop type dropdown selection

**Request**:
```json
{
  "cropTypeId": "crop123"
}
```

**Response**:
```json
{
  "cultivars": [
    {
      "id": "cult789",
      "name": "Cherry AK",
      "varietyType": "Indica",
      "floweringWeeks": 8,
      "yieldLevel": "medium-high"
    },
    {
      "id": "cult790",
      "name": "White Widow",
      "varietyType": "Hybrid",
      "floweringWeeks": 9,
      "yieldLevel": "high"
    }
  ]
}
```

**Convex Function**: `cultivars.getByCrop` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `cultivars` table → where crop_type_id=cropTypeId

---

### Link Cultivars to Facility

**Endpoint**: `POST /facilities/link-cultivars`

**Triggered by**: Bubble "Continue" button on cultivar selection

**Request**:
```json
{
  "facilityId": "f78ghi...",
  "cultivarIds": ["cult789", "cult790"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cultivares vinculados exitosamente"
}
```

**Convex Function**: `facilities.linkCultivars` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `facilities` table → verify facility exists
- **Reads**: `cultivars` table → validate cultivar IDs
- **Updates**: `facilities` table → update cultivar associations (many-to-many)

---

## MODULE 6: Supplier Setup

⚠️ **STATUS**: Not yet implemented

**Note**: Bubble API setup instructions will be added once these endpoints are implemented in the backend. The endpoint specifications below are placeholders for future development.

---

### Create Supplier

**Endpoint**: `POST /suppliers/create`

**Triggered by**: Bubble "Save Supplier" button in popup

**Request**:
```json
{
  "companyId": "k12def...",
  "name": "FarmChem Inc",
  "taxId": "900123456-7",
  "productCategories": ["nutrients", "pesticides"],
  "contactName": "Juan Pérez",
  "contactEmail": "ventas@farmchem.com",
  "contactPhone": "+573001234567",
  "address": "Calle 50 #45-30, Medellín"
}
```

**Response**:
```json
{
  "success": true,
  "supplierId": "s55mno...",
  "message": "Proveedor creado exitosamente"
}
```

**Convex Function**: `suppliers.create` ⚠️ TO BE CREATED

**Database Operations**:
- **Writes**: `suppliers` table → create supplier record

**Validation**:
- Valid email format
- Valid phone format
- At least one product category selected

---

### Get Suppliers by Company

**Endpoint**: `GET /suppliers/get-by-company`

**Triggered by**: Bubble suppliers page load

**Request**:
```json
{
  "companyId": "k12def..."
}
```

**Response**:
```json
{
  "suppliers": [
    {
      "id": "s55mno...",
      "name": "FarmChem Inc",
      "taxId": "900123456-7",
      "productCategories": ["nutrients", "pesticides"],
      "contactName": "Juan Pérez",
      "status": "active"
    }
  ]
}
```

**Convex Function**: `suppliers.getByCompany` ⚠️ TO BE CREATED

**Database Operations**:
- **Reads**: `suppliers` table → where company_id=companyId

---

### Update Supplier

**Endpoint**: `POST /suppliers/update`

**Triggered by**: Bubble "Save Supplier" button (edit mode)

**Request**:
```json
{
  "supplierId": "s55mno...",
  "name": "FarmChem Industries Inc",
  "contactEmail": "sales@farmchem.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Proveedor actualizado exitosamente"
}
```

**Convex Function**: `suppliers.update` ⚠️ TO BE CREATED

**Database Operations**:
- **Updates**: `suppliers` table → update specified fields

---

### Delete Supplier

**Endpoint**: `POST /suppliers/delete`

**Triggered by**: Bubble "Delete" button

**Request**:
```json
{
  "supplierId": "s55mno..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Proveedor eliminado exitosamente"
}
```

**Convex Function**: `suppliers.delete` ⚠️ TO BE CREATED

**Database Operations**:
- **Validation**: Check no active inventory items or purchase orders
- **Updates**: `suppliers` table → set status="inactive"

---

## IMPLEMENTATION STATUS SUMMARY

### ✅ Fully Implemented (Ready for Bubble)

**Module 1-2: Authentication & Company Creation** - All include complete Bubble API setup instructions
- ✅ Check email availability
- ✅ Register user (step 1)
- ✅ Verify email token
- ✅ Resend verification email
- ✅ Check verification status
- ✅ Get departments
- ✅ Get municipalities
- ✅ Create company (step 2)
- ✅ Simple login
- ✅ Validate session token
- ✅ Logout

**Convex Files**:
- [convex/registration.ts](../../convex/registration.ts)
- [convex/emailVerification.ts](../../convex/emailVerification.ts)
- [convex/geographic.ts](../../convex/geographic.ts)

**Bubble API Setup Documentation**: ✅ Complete
- Each endpoint includes detailed Bubble API Connector configuration
- Parameters tables with type, privacy, and source information
- Response field initialization requirements
- Step-by-step workflow instructions
- Error handling guidance
- Best practices and performance notes

---

### ⚠️ Not Yet Implemented (Need to Create)

**Module 3: Facility Creation**
- ❌ Create facility
- ❌ Get facilities by company
- ❌ Check license availability
- ❌ Update facility
- ❌ Delete facility

**Module 4: Area Setup**
- ❌ Create area
- ❌ Get areas by facility
- ❌ Update area
- ❌ Delete area

**Module 5: Cultivar Selection**
- ❌ Get crop types
- ❌ Get cultivars by crop
- ❌ Link cultivars to facility
- ❌ Add custom cultivar

**Module 6: Supplier Setup**
- ❌ Create supplier
- ❌ Get suppliers by company
- ❌ Update supplier
- ❌ Delete supplier

**Convex Files to Create**:
- `convex/facilities.ts`
- `convex/areas.ts`
- `convex/crops.ts`
- `convex/cultivars.ts`
- `convex/suppliers.ts`

---

## AUTHENTICATION & HEADERS

All authenticated endpoints (after login) should include:

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [user-token-or-session]
```

**Note**: Convex handles authentication via its built-in auth system. Bubble will need to:
1. Store user session after successful login
2. Include session token in subsequent API calls
3. Handle token expiration and refresh

---

## INTERNATIONALIZATION (i18n) STRATEGY

**Backend Approach**: The API is **language-agnostic** and always sends technical codes, not translated messages.

### Principles

1. **Technical Codes Only**: API responses contain only technical values (e.g., `"commercial_growing"`, `"active"`, `"S.A.S"`), never display strings
2. **Error Codes**: All error messages use standardized error codes that can be translated by the frontend
3. **Frontend Translation**: Bubble.io handles all translation using Option Sets and Custom States
4. **No Accept-Language Header**: API does not accept or process language headers

### Error Code Translations

The frontend should maintain an `Error_Codes` Option Set with these translations:

| code | message_es | message_en |
|------|------------|------------|
| INVALID_INPUT | Entrada inválida | Invalid input |
| VALIDATION_FAILED | Validación fallida | Validation failed |
| NOT_FOUND | Recurso no encontrado | Resource not found |
| ALREADY_EXISTS | Ya existe | Already exists |
| UNAUTHORIZED | No autorizado | Unauthorized |
| FORBIDDEN | Prohibido | Forbidden |
| RATE_LIMIT_EXCEEDED | Límite de solicitudes excedido | Rate limit exceeded |
| SERVER_ERROR | Error del servidor | Server error |
| TOKEN_EXPIRED | Token expirado | Token expired |
| TOKEN_INVALID | Token inválido | Token invalid |
| EMAIL_NOT_VERIFIED | Email no verificado | Email not verified |
| COMPANY_NOT_FOUND | Empresa no encontrada | Company not found |
| FACILITY_NOT_FOUND | Instalación no encontrada | Facility not found |
| FACILITY_LIMIT_EXCEEDED | Límite de instalaciones excedido | Facility limit exceeded |
| INVALID_MUNICIPALITY | Municipio inválido | Invalid municipality |
| DUPLICATE_LICENSE | Número de licencia duplicado | Duplicate license number |

### Field-Specific Validation Messages

For field-specific errors, the API returns:

```json
{
  "success": false,
  "code": "VALIDATION_FAILED",
  "errors": [
    {"field": "email", "code": "INVALID_EMAIL"},
    {"field": "password", "code": "PASSWORD_TOO_WEAK"}
  ]
}
```

Frontend translation Option Set `Validation_Error_Codes`:

| code | message_es | message_en |
|------|------------|------------|
| REQUIRED_FIELD | Campo requerido | Required field |
| INVALID_EMAIL | Email inválido | Invalid email |
| PASSWORD_TOO_WEAK | Contraseña muy débil | Password too weak |
| PASSWORD_MISMATCH | Las contraseñas no coinciden | Passwords don't match |
| PHONE_INVALID | Teléfono inválido | Invalid phone |
| TAX_ID_INVALID | NIT inválido | Invalid tax ID |
| LICENSE_NUMBER_INVALID | Número de licencia inválido | Invalid license number |
| AREA_TOO_LARGE | Área demasiado grande | Area too large |
| CAPACITY_INVALID | Capacidad inválida | Invalid capacity |
| DATE_INVALID | Fecha inválida | Invalid date |
| DATE_IN_PAST | Fecha en el pasado | Date in past |
| QUANTITY_NEGATIVE | Cantidad negativa | Negative quantity |

For implementation details, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md) and [../i18n/BUBBLE-IMPLEMENTATION.md](../i18n/BUBBLE-IMPLEMENTATION.md).

---

## ERROR RESPONSES

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

**Common Error Codes**:
- `INVALID_INPUT`: Validation failed
- `NOT_FOUND`: Resource not found
- `ALREADY_EXISTS`: Duplicate resource (email, license, etc.)
- `UNAUTHORIZED`: Not authenticated or insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## BUBBLE DEVELOPER QUICK START

### Step-by-Step Setup Guide

1. **Install API Connector Plugin**
   - Go to Plugins tab in Bubble
   - Add plugin: "API Connector"

2. **Create API Connection**
   - Name: "Alquemist Backend"
   - Authentication: None (we use custom tokens)

3. **Configure Each Endpoint** (11 total for Modules 1-2)
   - Follow the "Bubble API Setup" section for each endpoint above
   - Initialize all response fields exactly as specified
   - Mark passwords and tokens as "Private"

4. **Create User Data Type Fields**
   Add these fields to your User data type:
   - `session_token` (text, private)
   - `backend_user_id` (text)
   - `company_id` (text)
   - `company_name` (text)
   - `first_name` (text)
   - `last_name` (text)
   - `email_verified` (yes/no)

5. **Create Option Sets** (for dropdowns)
   - `businessEntityType`: S.A.S, S.A., Ltda, E.U.
   - `companyType`: cannabis, coffee, flowers, vegetables

6. **Implement Page Workflows**
   - Signup page → registerUserStep1
   - Verification page → verifyEmailToken, checkVerificationStatus
   - Company setup → getDepartments, getMunicipalities, registerCompanyStep2
   - Login page → login
   - Protected pages → validateToken (on page load)
   - Logout button → logout

### API Call Order (User Journey)

```
1. checkEmailAvailability (on blur)
   ↓
2. registerUserStep1 (creates account)
   ↓
3. verifyEmailToken OR checkVerificationStatus (polling)
   ↓
4. getDepartments → getMunicipalities (dropdowns)
   ↓
5. registerCompanyStep2 (creates company)
   ↓
6. Navigate to dashboard

-- OR for returning users --

1. login (returns token)
   ↓
2. validateToken (on each page load)
   ↓
3. [Use app]
   ↓
4. logout (invalidates token)
```

### Common Patterns

**Data Calls** (for displaying info):
- Use as: Data
- Return list: Yes (for arrays), No (for objects)
- Called from: Dynamic dropdown choices, Repeating groups

**Action Calls** (for mutations):
- Use as: Action
- Called from: Workflow button clicks
- Check `success` field in conditional steps

**Authentication Pattern**:
```
Every API call after login should:
1. Check Current User's session_token is not empty
2. If empty → Navigate to login
3. If present → Make API call
```

### Testing Checklist

- [ ] Can register new user
- [ ] Email verification link works
- [ ] Can resend verification email
- [ ] Departments populate dropdown
- [ ] Municipalities filter by department
- [ ] Can create company
- [ ] Login returns valid token
- [ ] Token validation works on protected pages
- [ ] Logout invalidates session
- [ ] Session expires after 30 days
- [ ] Invalid token redirects to login

---

**Status**: Phase 1 API specification complete with Bubble integration guide
**Ready Endpoints**: Modules 1-2 (11 endpoints with full Bubble documentation)
**Pending Endpoints**: Modules 3-6 (20+ endpoints - backend not yet implemented)
**Next Steps**:
1. Implement Bubble UI following these specifications
2. Test all Module 1-2 endpoints
3. Implement pending Convex functions for Modules 3-6
4. Add Bubble setup documentation for Modules 3-6 once backend is ready
