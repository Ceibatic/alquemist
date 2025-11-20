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

**Endpoint**: `POST /registration/check-email`
**Status**: ✅ Ready
**Convex Function**: `registration.checkEmailAvailability`

#### Bubble API Connector Configuration

**Name**: `checkEmailAvailability`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/check-email`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "<email>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| email | text | No | Body | user@example.com |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "available": true,
  "email": "user@example.com",
  "error": "Email format invalid",
  "code": "INVALID_EMAIL"
}
```

**Response Fields**:
- `available` (boolean) - true si el email está disponible, false si ya existe
- `email` (text) - Email verificado
- `error` (text) - Mensaje de error si ocurre
- `code` (text) - Código de error técnico

#### Bubble Workflow

1. **Trigger**: Input "email"'s value is changed → value is not empty
2. **Step 1**: Plugins → checkEmailAvailability
   - email = `Input email's value`
3. **Step 2** (Only when `available is "false"`): Show alert "Este email ya está registrado"
4. **Step 3** (Only when `available is "true"`): Enable "Create Account" button

---

### Register User (Step 1)

**Endpoint**: `POST /registration/register-step-1`
**Status**: ✅ Ready
**Convex Function**: `registration.registerUserStep1`

**Important**: El campo `token` es un session token de 30 días. Guardarlo en el User de Bubble.

#### Bubble API Connector Configuration

**Name**: `registerUserStep1`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/register-step-1`

**Headers**:
```
Content-Type: application/json
```

**Body**:
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
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| email | text | No | Body | user@example.com |
| password | text | Yes | Body | SecurePass123! |
| firstName | text | No | Body | Juan |
| lastName | text | No | Body | Pérez |
| phone | text | No | Body | 3001234567 |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "userId": "j97abc...",
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "email": "user@example.com",
  "message": "Cuenta creada. Por favor verifica tu correo electrónico.",
  "verificationSent": true,
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

**Response Fields**:
- `success` (boolean) - true si la cuenta se creó exitosamente
- `userId` (text) - ID del usuario en el backend
- `token` (text) - Session token (30 días) para autenticación
- `email` (text) - Email del usuario
- `message` (text) - Mensaje descriptivo del resultado
- `verificationSent` (boolean) - true si se envió email de verificación
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

1. **Trigger**: Button "Create Account" is clicked
2. **Step 1**: Plugins → registerUserStep1
   - email = `Input email's value`
   - password = `Input password's value`
   - firstName = `Input firstName's value`
   - lastName = `Input lastName's value`
   - phone = `Input phone's value`
3. **Step 2** (Only when `success = true`): Sign the user up
   - Email = `Result of Step 1's email`
   - Password = `Input password's value`
4. **Step 3**: Make changes to Current User
   - `session_token` = `Result of Step 1's token`
   - `backend_user_id` = `Result of Step 1's userId`
   - `email_verified` = no
5. **Step 4**: Navigate to "email-verification" page
6. **Step 5** (Only when `success = false`): Show alert with `Result of Step 1's error`

---

### Verify Email Token

**Endpoint**: `POST /registration/verify-email`
**Status**: ✅ Ready
**Convex Function**: `emailVerification.verifyEmailToken`

#### Bubble API Connector Configuration

**Name**: `verifyEmailToken`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/verify-email`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "token": "<token>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Body | abc123xyz456... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "¡Email verificado exitosamente!",
  "userId": "j97abc...",
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

**Response Fields**:
- `success` (boolean) - true si el token es válido y se verificó el email
- `message` (text) - Mensaje descriptivo del resultado
- `userId` (text) - ID del usuario verificado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error (TOKEN_EXPIRED, TOKEN_INVALID, etc.)

#### Bubble Workflow

**Opción 1 - Manual con botón**:
1. **Trigger**: Button "Verify Email" is clicked
2. **Step 1**: Plugins → verifyEmailToken
   - token = `Input verification_code's value`
3. **Step 2** (Only when `success = true`): Make changes to Current User → `email_verified` = yes
4. **Step 3**: Navigate to "company-setup" page
5. **Step 4** (Only when `success = false`): Show alert with `Result of Step 1's error`

**Opción 2 - Desde link en email**:
1. **Trigger**: Page "email-verification" is loaded AND Get token from URL is not empty
2. **Step 1**: Plugins → verifyEmailToken
   - token = `Get token from page URL`
3. **Step 2** (Only when `success = true`): Make changes to Current User → `email_verified` = yes
4. **Step 3**: Navigate to "company-setup" page

---

### Resend Verification Email

**Endpoint**: `POST /registration/resend-verification`
**Status**: ✅ Ready
**Convex Function**: `emailVerification.resendVerificationEmail`

**Rate Limiting**: Max 5 resends, 5 minutos entre cada reenvío

#### Bubble API Connector Configuration

**Name**: `resendVerificationEmail`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/resend-verification`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "<email>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| email | text | No | Body | user@example.com |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Email de verificación reenviado",
  "token": "xyz123...",
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Response Fields**:
- `success` (boolean) - true si se envió el email correctamente
- `message` (text) - Mensaje descriptivo del resultado
- `token` (text) - Nuevo token de verificación generado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

1. **Trigger**: Button "Resend Verification Email" is clicked
2. **Step 1**: Plugins → resendVerificationEmail
   - email = `Current User's email`
3. **Step 2** (Only when `success = true`): Show alert "Email reenviado. Revisa tu bandeja."
4. **Step 3** (Only when `success = true`): Disable button for 5 minutes (Custom State)
5. **Step 4** (Only when `success = false`): Show alert with `Result of Step 1's error`

---

### Check Verification Status

**Endpoint**: `POST /registration/check-verification-status`
**Status**: ✅ Ready
**Convex Function**: `emailVerification.checkEmailVerificationStatus`

#### Bubble API Connector Configuration

**Name**: `checkVerificationStatus`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/check-verification-status`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "<email>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| email | text | No | Body | user@example.com |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "exists": true,
  "verified": true,
  "userId": "j97abc...",
  "message": "Email verificado"
}
```

**Response Fields**:
- `exists` (boolean) - true si el usuario existe en la base de datos
- `verified` (boolean) - true si el email está verificado
- `userId` (text) - ID del usuario
- `message` (text) - Mensaje descriptivo del estado

#### Bubble Workflow - Polling Pattern

1. **Add Repeating Group** en página "email-verification"
   - Data source: Get data from API → checkVerificationStatus
   - email = `Current User's email`
   - Refresh interval: Every 5 seconds
2. **Conditional Workflow**: When verified = yes
   - Make changes to Current User → `email_verified` = yes
   - Navigate to "company-setup"

---

## MODULE 2: Company Creation

### Get Departments

**Endpoint**: `POST /geographic/departments`
**Status**: ✅ Ready
**Convex Function**: `geographic.getDepartments`

#### Bubble API Connector Configuration

**Name**: `getDepartments`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/geographic/departments`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "countryCode": "<countryCode>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| countryCode | text | No | Body | CO |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  }
]
```

**Response Fields**:
- `division_1_code` (text) - Código del departamento
- `division_1_name` (text) - Nombre del departamento
- `timezone` (text) - Zona horaria

#### Bubble Dropdown Setup

1. **Dropdown "Departamento"**:
   - Choices source: Get data from API → getDepartments (countryCode = "CO")
   - Option caption: `This Department's division_1_name`
   - Option value: `This Department's division_1_code`

---

### Get Municipalities

**Endpoint**: `POST /geographic/municipalities`
**Status**: ✅ Ready
**Convex Function**: `geographic.getMunicipalities`

#### Bubble API Connector Configuration

**Name**: `getMunicipalities`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/geographic/municipalities`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "countryCode": "<countryCode>",
  "departmentCode": "<departmentCode>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| countryCode | text | No | Body | CO |
| departmentCode | text | No | Body | 05 |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05",
    "timezone": "America/Bogota"
  }
]
```

**Response Fields**:
- `division_2_code` (text) - Código del municipio
- `division_2_name` (text) - Nombre del municipio
- `parent_division_1_code` (text) - Código del departamento padre
- `timezone` (text) - Zona horaria

#### Bubble Dropdown Setup

1. **Dropdown "Municipio"**:
   - Choices source: Get data from API → getMunicipalities
     - countryCode = "CO"
     - departmentCode = `Dropdown Departamento's value`
   - Option caption: `This Municipality's division_2_name`
   - Option value: `This Municipality's division_2_code`
2. **Auto-reset**: Clear when department changes

---

### Create Company (Step 2)

**Endpoint**: `POST /registration/register-step-2`
**Status**: ✅ Ready
**Convex Function**: `registration.registerCompanyStep2`

**Note**: Requiere que el usuario tenga email verificado (email_verified=true)

#### Bubble API Connector Configuration

**Name**: `registerCompanyStep2`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/register-step-2`

**Headers**:
```
Content-Type: application/json
```

**Body**:
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
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| userId | text | No | Body | j97abc... |
| companyName | text | No | Body | Cultivos San José S.A.S |
| businessEntityType | text | No | Body | S.A.S |
| companyType | text | No | Body | cannabis |
| country | text | No | Body | CO |
| departmentCode | text | No | Body | 05 |
| municipalityCode | text | No | Body | 05001 |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "userId": "j97abc...",
  "companyId": "k12def...",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente.",
  "error": "Email not verified",
  "code": "EMAIL_NOT_VERIFIED"
}
```

**Response Fields**:
- `success` (boolean) - true si la empresa se creó exitosamente
- `userId` (text) - ID del usuario
- `companyId` (text) - ID de la empresa creada
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

1. **Trigger**: Button "Create Company" is clicked
2. **Step 1**: Plugins → registerCompanyStep2
   - userId = `Current User's backend_user_id`
   - companyName = `Input companyName's value`
   - businessEntityType = `Dropdown businessEntityType's value`
   - companyType = `Dropdown companyType's value`
   - country = "CO"
   - departmentCode = `Dropdown Departamento's value`
   - municipalityCode = `Dropdown Municipio's value`
3. **Step 2** (Only when `success = true`): Make changes to Current User
   - `company_id` = `Result of Step 1's companyId`
   - `company_name` = `Input companyName's value`
4. **Step 3**: Navigate to "dashboard" page
5. **Step 4** (Only when `success = false`): Show alert with `Result of Step 1's error`

**Option Sets requeridos**:
- `businessEntityType`: S.A.S, S.A., Ltda, E.U.
- `companyType`: cannabis, coffee, flowers, vegetables

---

### Simple Login

**Endpoint**: `POST /registration/login`
**Status**: ✅ Ready
**Convex Function**: `registration.login`

**Important**: El `token` es un session token (30 días). Cada login genera un nuevo token e invalida el anterior.

#### Bubble API Connector Configuration

**Name**: `login`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/login`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "<email>",
  "password": "<password>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| email | text | No | Body | user@example.com |
| password | text | Yes | Body | SecurePass123! |

**Complete Response** (inicializar TODOS estos campos en Bubble):
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
  },
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Response Fields**:
- `success` (boolean) - true si login exitoso
- `token` (text) - Session token (30 días)
- `userId` (text) - ID del usuario
- `companyId` (text) - ID de la empresa
- `user` (object) - Datos del usuario
  - `email` (text)
  - `firstName` (text)
  - `lastName` (text)
  - `locale` (text)
  - `preferredLanguage` (text)
- `company` (object) - Datos de la empresa
  - `name` (text)
  - `subscriptionPlan` (text)
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

1. **Trigger**: Button "Log In" is clicked
2. **Step 1**: Plugins → login
   - email = `Input email's value`
   - password = `Input password's value`
3. **Step 2** (Only when `success = true`): Log the user in
   - Email = `Result of Step 1's user:email`
   - Password = `Input password's value`
4. **Step 3**: Make changes to Current User
   - `session_token` = `Result of Step 1's token`
   - `backend_user_id` = `Result of Step 1's userId`
   - `company_id` = `Result of Step 1's companyId`
   - `company_name` = `Result of Step 1's company:name`
   - `first_name` = `Result of Step 1's user:firstName`
   - `last_name` = `Result of Step 1's user:lastName`
   - `email_verified` = yes
5. **Step 4**: Navigate to "dashboard" page
6. **Step 5** (Only when `success = false`): Show alert with `Result of Step 1's error`

**Security**: Siempre usar HTTPS. No logear ni mostrar el token. Rate limiting: max 5 intentos.

---

### Validate Session Token

**Endpoint**: `GET /registration/validate-token`
**Status**: ✅ Ready
**Convex Function**: `registration.validateToken`

**Use**: Llamar en page load de páginas protegidas. Si valid=false, hacer logout y redirigir a login.

#### Bubble API Connector Configuration

**Name**: `validateToken`
**Use as**: Data
**Method**: GET
**URL**: `https://handsome-jay-388.convex.site/registration/validate-token?token=<token>`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | URL | a2g3YnI1M2RuazR5bWplNms... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
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
  },
  "error": "Token expirado"
}
```

**Response Fields**:
- `valid` (boolean) - true si el token es válido
- `userId` (text) - ID del usuario
- `companyId` (text) - ID de la empresa
- `user` (object) - Datos del usuario
- `company` (object) - Datos de la empresa
- `error` (text) - Mensaje de error si valid=false

#### Bubble Workflow - Page Protection

1. **Page Load**: When page is loaded
2. **Step 1**: Get data from API → validateToken (token = `Current User's session_token`)
3. **Step 2** (Only when `valid = false`): Log the user out → Navigate to "login"

**Recomendación**: Crear Reusable Element "SessionValidator" para centralizar esta lógica.

**Performance**: Cachear validación por 5 minutos usando Custom State.

---

### Logout

**Endpoint**: `POST /registration/logout`
**Status**: ✅ Ready
**Convex Function**: `registration.logout`

#### Bubble API Connector Configuration

**Name**: `logout`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/logout`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "token": "<token>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Body | a2g3YnI1M2RuazR5bWplNms... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "error": "Token no encontrado"
}
```

**Response Fields**:
- `success` (boolean) - true si logout exitoso
- `message` (text) - Mensaje de confirmación
- `error` (text) - Mensaje de error si success=false

#### Bubble Workflow

1. **Trigger**: Button "Logout" is clicked
2. **Step 1**: Plugins → logout (token = `Current User's session_token`)
3. **Step 2**: Make changes to Current User
   - `session_token` = empty
   - `backend_user_id` = empty
   - `company_id` = empty
4. **Step 3**: Log the user out
5. **Step 4**: Navigate to "login" page

**Importante**: Siempre hacer logout del backend antes de Bubble's "Log the user out". Aunque falle el API, continuar con el logout de Bubble.

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
