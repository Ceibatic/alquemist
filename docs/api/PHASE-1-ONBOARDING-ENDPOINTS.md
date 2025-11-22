# PHASE 1: ONBOARDING & FOUNDATION - API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Related Documentation**:
- **Database Schema**: [../database/SCHEMA.md](../database/SCHEMA.md)
- **UI Requirements**: [../ui/bubble/PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md)
- **Restructure Plan**: [../TEMP-API-RESTRUCTURE-PLAN.md](../TEMP-API-RESTRUCTURE-PLAN.md)

---

## PHASE 1 OVERVIEW

**Purpose**: User authentication, company setup, initial facility configuration, and dashboard access

**Two Onboarding Flows**:
1. **First User Flow** (Modules 1-4): Complete signup → company → facility creation (7 screens)
2. **Invited User Flow** (Module 1B + 5): Accept invitation → set password → join company (4 screens)

**Modules**:
- **MODULE 1**: Authentication & Account Creation (First User)
- **MODULE 1B**: Invited User Acceptance
- **MODULE 2**: Company Creation
- **MODULE 3**: Facility Creation & Basics
- **MODULE 4**: User Role Assignment
- **MODULE 5**: Dashboard Home
- **MODULE 6**: Login & Session Management

**Estimated Pages**: 11 screens total (7 for first user + 4 for invited user)
**Exit Point**: Operational Dashboard with facility context established

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

## MODULE 1B: Invited User Acceptance

**Related UI Documentation**: See [Phase 1, Module 5](../ui/bubble/PHASE-1-ONBOARDING.md#module-5-invited-user-acceptance) for complete user flow

**Purpose**: Handle user invitations for joining existing companies. Unlike the first user flow (Module 1), invited users receive an email with a token, set their password, and join pre-existing companies and facilities.

**Key Differences**:
- No email verification step (invitation link acts as verification)
- No company or facility creation
- Role and facilities pre-assigned by inviter
- Faster onboarding (4 screens vs 7 screens)

---

### Validate Invitation Token

**Endpoint**: `POST /invitations/validate-token`
**Convex Function**: `invitations.validateToken`

**Purpose**: Validate invitation token and retrieve invitation details when user clicks email link

#### Bubble API Connector Configuration

**Name**: `validateInvitationToken`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/validate-token`
**Data Type**: Single object (Return list = No)

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
| token | text | No | URL parameter | abc123xyz789... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "valid": true,
  "invitation": {
    "_id": "inv789",
    "email": "maria@example.com",
    "firstName": "María",
    "lastName": "García",
    "company": {
      "_id": "comp123",
      "name": "Agrícola del Valle SAS",
      "businessType": "S.A.S"
    },
    "role": {
      "_id": "role456",
      "name": "PRODUCTION_SUPERVISOR",
      "display_name": "Supervisor de Producción"
    },
    "inviter": {
      "_id": "user001",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "facilities": [
      {
        "_id": "fac001",
        "name": "Instalación Norte"
      },
      {
        "_id": "fac002",
        "name": "Instalación Sur"
      }
    ],
    "expiresAt": 1700000000000,
    "createdAt": 1699741200000
  }
}
```

**Response Fields**:
- `valid` (yes/no) - Si el token es válido
- `invitation._id` (text) - ID de la invitación
- `invitation.email` (text) - Email del usuario invitado
- `invitation.firstName` (text) - Nombre
- `invitation.lastName` (text) - Apellido
- `invitation.company._id` (text) - ID de la empresa
- `invitation.company.name` (text) - Nombre de la empresa
- `invitation.company.businessType` (text) - Tipo de empresa
- `invitation.role._id` (text) - ID del rol asignado
- `invitation.role.name` (text) - Nombre técnico del rol
- `invitation.role.display_name` (text) - Nombre del rol para mostrar
- `invitation.inviter._id` (text) - ID del usuario que invitó
- `invitation.inviter.firstName` (text) - Nombre del invitador
- `invitation.inviter.lastName` (text) - Apellido del invitador
- `invitation.facilities` (list) - Lista de instalaciones asignadas
- `invitation.facilities.each._id` (text) - ID de la instalación
- `invitation.facilities.each.name` (text) - Nombre de la instalación
- `invitation.expiresAt` (number) - Timestamp de expiración (72 horas)
- `invitation.createdAt` (number) - Timestamp de creación

**Error Response** (token inválido):
```json
{
  "valid": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "El token de invitación no es válido o ha expirado"
  }
}
```

#### Bubble Usage

**On Accept Invitation Page Load**:
1. Get `token` from URL parameter
2. Call `validateInvitationToken`
3. If `valid` = yes:
   - Display invitation details
   - Show company name, role, inviter, facilities
4. If `valid` = no:
   - Navigate to "invitation-invalid" page
   - Display error message

#### Database Operations (Backend)

**Reads from**:
- `invitations` table - Get invitation by token
- `companies` table - Get company details
- `roles` table - Get role details
- `users` table - Get inviter details
- `facilities` table - Get assigned facilities

**Validates**:
- Token exists and matches
- `status` = "pending"
- `expiresAt` > now() (not expired)

---

### Accept Invitation

**Endpoint**: `POST /invitations/accept`
**Convex Function**: `invitations.accept`

**Purpose**: Create user account from invitation and link to company/facilities

#### Bubble API Connector Configuration

**Name**: `acceptInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/accept`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "token": "<token>",
  "password": "<password>",
  "phone": "<phone>",
  "language": "<language>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Required | Example |
|-----------|------|---------|--------|----------|---------|
| token | text | No | URL parameter | Yes | abc123xyz789... |
| password | text | Yes | Input field | Yes | MyP@ssw0rd123 |
| phone | text | No | Input field | No | 3001234567 |
| language | text | No | Radio button | No | es / en |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "user": {
    "_id": "user789",
    "email": "maria@example.com",
    "firstName": "María",
    "lastName": "García",
    "phone": "3001234567",
    "language": "es",
    "email_verified": true,
    "company_id": "comp123",
    "role_id": "role456",
    "currentFacilityId": "fac001"
  },
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "company": {
    "_id": "comp123",
    "name": "Agrícola del Valle SAS"
  },
  "facilities": [
    {
      "_id": "fac001",
      "name": "Instalación Norte"
    },
    {
      "_id": "fac002",
      "name": "Instalación Sur"
    }
  ]
}
```

**Response Fields**:
- `success` (yes/no) - Si la aceptación fue exitosa
- `user._id` (text) - ID del nuevo usuario creado
- `user.email` (text) - Email del usuario
- `user.firstName` (text) - Nombre
- `user.lastName` (text) - Apellido
- `user.phone` (text) - Teléfono
- `user.language` (text) - Idioma preferido (es/en)
- `user.email_verified` (yes/no) - Email verificado (siempre true para invitados)
- `user.company_id` (text) - ID de la empresa
- `user.role_id` (text) - ID del rol asignado
- `user.currentFacilityId` (text) - ID de la instalación por defecto
- `authToken` (text) - Token de autenticación (guardar en sesión)
- `company._id` (text) - ID de la empresa
- `company.name` (text) - Nombre de la empresa
- `facilities` (list) - Lista de instalaciones asignadas

**Error Responses**:

```json
// Token expirado
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "El token de invitación ha expirado. Solicita una nueva invitación."
  }
}

// Token ya usado
{
  "success": false,
  "error": {
    "code": "TOKEN_ALREADY_USED",
    "message": "Esta invitación ya fue aceptada."
  }
}

// Contraseña débil
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial."
  }
}
```

#### Bubble Usage

**On Submit Create Account**:
1. Validate password requirements met
2. Call `acceptInvitation` with token, password, phone, language
3. If `success` = yes:
   - Store `authToken` in browser storage
   - Set Current User data from response
   - Navigate to welcome page (`/welcome-invited`)
4. If `success` = no:
   - Display error message
   - If TOKEN_EXPIRED, offer "Request New Invitation"

**Auto-Login After Accept**:
- Use `authToken` from response to authenticate user
- Set Bubble Current User with returned user data
- Establish facility context with `currentFacilityId`

#### Database Operations (Backend)

**Reads from**:
- `invitations` table - Validate token and get invitation data

**Writes to**:
- `users` table - Create new user account with hashed password
  - Sets: email, firstName, lastName, phone, language, email_verified=true, company_id, role_id, currentFacilityId
- `facility_users` table - Link user to all assigned facilities
  - Creates: One record per facility in invitation

**Updates**:
- `invitations` table - Mark invitation as used
  - Sets: status = "accepted", accepted_at = now()

**Validation**:
- Token exists and valid
- Token not expired (< 72 hours old)
- Status = "pending" (not already accepted)
- Password meets security requirements
- Email not already registered (should not happen, but validate)

---

### Reject Invitation

**Endpoint**: `POST /invitations/reject`
**Convex Function**: `invitations.reject`

**Purpose**: Allow user to reject an invitation (updates status, notifies inviter)

#### Bubble API Connector Configuration

**Name**: `rejectInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/reject`
**Data Type**: Single object (Return list = No)

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
| token | text | No | URL parameter | abc123xyz789... |

**Complete Response**:
```json
{
  "success": true,
  "message": "Invitación rechazada exitosamente"
}
```

**Response Fields**:
- `success` (yes/no) - Si el rechazo fue exitoso
- `message` (text) - Mensaje de confirmación

#### Bubble Usage

**On Reject Button Click**:
1. Show confirmation popup: "¿Estás seguro que deseas rechazar esta invitación?"
2. If confirmed, call `rejectInvitation`
3. If `success` = yes:
   - Display "Invitación rechazada" message
   - Navigate to login page after 3 seconds
4. Backend sends notification email to inviter

#### Database Operations (Backend)

**Updates**:
- `invitations` table
  - Sets: status = "rejected", updated_at = now()

**Side Effects**:
- Send notification email to inviter
- Log rejection event

---

### Create Invitation (Admin Endpoint)

**Endpoint**: `POST /invitations/create`
**Convex Function**: `invitations.create`

**Purpose**: Admin/Manager creates invitation for new team member

**Related UI**: See [Phase 2, Module 17](../ui/bubble/PHASE-2-BASIC-SETUP.md#module-17-user-invitations--team-management) for invitation management interface

#### Bubble API Connector Configuration

**Name**: `createInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/create`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "email": "<email>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "roleId": "<roleId>",
  "facilityIds": ["<facilityId1>", "<facilityId2>"]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Required | Example |
|-----------|------|---------|--------|----------|---------|
| token | text | Yes | Current User session | Yes | a2g3YnI1M2RuazR5bWplNms... |
| email | text | No | Input field | Yes | maria@example.com |
| firstName | text | No | Input field | Yes | María |
| lastName | text | No | Input field | Yes | García |
| roleId | text | No | Dropdown | Yes | role456 |
| facilityIds | list | No | Multiselect | Yes | ["fac001", "fac002"] |

**Complete Response**:
```json
{
  "success": true,
  "invitation": {
    "_id": "inv789",
    "email": "maria@example.com",
    "token": "abc123xyz789",
    "invitationLink": "https://app.alquemist.com/accept-invitation?token=abc123xyz789",
    "expiresAt": 1700000000000,
    "status": "pending"
  },
  "emailSent": true
}
```

**Response Fields**:
- `success` (yes/no) - Si la invitación fue creada
- `invitation._id` (text) - ID de la invitación creada
- `invitation.email` (text) - Email del invitado
- `invitation.token` (text) - Token único de la invitación
- `invitation.invitationLink` (text) - URL completa de aceptación
- `invitation.expiresAt` (number) - Timestamp de expiración
- `invitation.status` (text) - Estado (siempre "pending" al crear)
- `emailSent` (yes/no) - Si el email fue enviado exitosamente

**Error Responses**:
```json
// Email ya registrado
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Este email ya está registrado en el sistema."
  }
}

// Invitación pendiente existe
{
  "success": false,
  "error": {
    "code": "INVITATION_PENDING",
    "message": "Ya existe una invitación pendiente para este email."
  }
}

// Límite de usuarios alcanzado (según plan)
{
  "success": false,
  "error": {
    "code": "USER_LIMIT_REACHED",
    "message": "Has alcanzado el límite de usuarios de tu plan actual."
  }
}
```

#### Bubble Usage

**On Invite User Popup Submit**:
1. Validate all fields filled
2. Call `createInvitation` with user details
3. If `success` = yes:
   - Show success message: "Invitación enviada a [email]"
   - Optionally display `invitationLink` for manual sharing
   - Refresh users list
4. If error:
   - Display appropriate error message

#### Database Operations (Backend)

**Reads from**:
- `users` table - Check if email already exists
- `invitations` table - Check for pending invitations
- `companies` table - Get company plan limits

**Writes to**:
- `invitations` table - Create invitation record
  - Sets: email, firstName, lastName, inviter_user_id, company_id, role_id, facility_ids, token (generated), status="pending", expires_at (now + 72 hours)

**Side Effects**:
- Generate unique invitation token (UUID v4)
- Send invitation email with link
- Log invitation creation event

**Validation**:
- User has permission to invite (ADMIN, FACILITY_MANAGER roles only)
- Email not already registered
- No pending invitation for this email
- Company hasn't reached user limit from plan
- Facilities belong to the company

---

### Resend Invitation

**Endpoint**: `POST /invitations/resend`
**Convex Function**: `invitations.resend`

**Purpose**: Resend invitation email with new token (previous token expires)

#### Bubble API Connector Configuration

**Name**: `resendInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/resend`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "invitationId": "<invitationId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Current User session | a2g3YnI1M2RuazR5bWplNms... |
| invitationId | text | No | Repeating group cell | inv789 |

**Complete Response**:
```json
{
  "success": true,
  "newToken": "xyz987abc321",
  "invitationLink": "https://app.alquemist.com/accept-invitation?token=xyz987abc321",
  "expiresAt": 1700100000000,
  "emailSent": true
}
```

**Response Fields**:
- `success` (yes/no) - Si el reenvío fue exitoso
- `newToken` (text) - Nuevo token generado
- `invitationLink` (text) - Nueva URL de invitación
- `expiresAt` (number) - Nueva fecha de expiración
- `emailSent` (yes/no) - Si el email fue enviado

#### Bubble Usage

**On Resend Button Click** (in users management page):
1. Get `invitationId` from repeating group cell
2. Call `resendInvitation`
3. If `success` = yes:
   - Show message: "Invitación reenviada"
   - Update invitation timestamp in list
4. Old token becomes invalid automatically

#### Database Operations (Backend)

**Reads from**:
- `invitations` table - Get invitation details

**Updates**:
- `invitations` table
  - Sets: token = new_token, expires_at = now() + 72 hours, updated_at = now()

**Side Effects**:
- Send new invitation email
- Invalidate previous token

---

### Revoke Invitation

**Endpoint**: `POST /invitations/revoke`
**Convex Function**: `invitations.revoke`

**Purpose**: Cancel pending invitation (user cannot accept anymore)

#### Bubble API Connector Configuration

**Name**: `revokeInvitation`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/invitations/revoke`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "invitationId": "<invitationId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Current User session | a2g3YnI1M2RuazR5bWplNms... |
| invitationId | text | No | Repeating group cell | inv789 |

**Complete Response**:
```json
{
  "success": true,
  "message": "Invitación revocada exitosamente"
}
```

**Response Fields**:
- `success` (yes/no) - Si la revocación fue exitosa
- `message` (text) - Mensaje de confirmación

#### Bubble Usage

**On Revoke/Cancel Button Click** (in users management page):
1. Show confirmation: "¿Cancelar invitación para [email]?"
2. If confirmed, call `revokeInvitation`
3. If `success` = yes:
   - Remove invitation from list
   - Show "Invitación cancelada"
4. Token becomes invalid (user cannot accept)

#### Database Operations (Backend)

**Updates**:
- `invitations` table
  - Sets: status = "revoked", updated_at = now()

---

## MODULE 1B SUMMARY

### Endpoints Created

| Endpoint | Purpose | Authentication | Used In |
|----------|---------|----------------|---------|
| `POST /invitations/validate-token` | Validate invitation link | No | Accept Invitation page (load) |
| `POST /invitations/accept` | Accept invitation & create account | No | Set Password page (submit) |
| `POST /invitations/reject` | Reject invitation | No | Accept Invitation page (reject button) |
| `POST /invitations/create` | Admin sends invitation | Yes (Bearer) | Phase 2 Module 17 (Invite User popup) |
| `POST /invitations/resend` | Resend invitation email | Yes (Bearer) | Phase 2 Module 17 (Resend button) |
| `POST /invitations/revoke` | Cancel pending invitation | Yes (Bearer) | Phase 2 Module 17 (Cancel button) |

### Database Tables Used

- **invitations** - Core table for invitation management
- **users** - Create user accounts on acceptance
- **facility_users** - Link users to facilities
- **companies** - Validate company context
- **roles** - Assign roles to invited users
- **facilities** - Validate facility assignments

### Related Documentation

- **UI Flow**: [Phase 1, Module 5](../ui/bubble/PHASE-1-ONBOARDING.md#module-5-invited-user-acceptance) - Complete user screens and workflows
- **Database Schema**: [Schema - invitations table](../database/SCHEMA.md) - Table structure (to be added)
- **User Management**: [Phase 2, Module 17](../ui/bubble/PHASE-2-BASIC-SETUP.md#module-17-user-invitations--team-management) - Admin interface for managing invitations

---

## MODULE 2: Company Creation

### Get Departments

**Endpoint**: `POST /geographic/departments`
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

### Get Crop Types

**Endpoint**: `POST /crop-types/list`
**Convex Function**: `crops.getCropTypes`

**Purpose**: Obtain list of available crop types (Cannabis, Coffee, Cocoa, Flowers) for facility creation

#### Bubble API Connector Configuration

**Name**: `getCropTypes`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/crop-types/list`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "includeInactive": false
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| includeInactive | boolean | No | Body | false |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "id": "crop123...",
    "name": "Cannabis",
    "display_name_es": "Cannabis",
    "category": "flowering_plant",
    "default_units": "kg",
    "is_active": true
  },
  {
    "id": "crop456...",
    "name": "Coffee",
    "display_name_es": "Café",
    "category": "crop",
    "default_units": "kg",
    "is_active": true
  },
  {
    "id": "crop789...",
    "name": "Cocoa",
    "display_name_es": "Cacao",
    "category": "tree_crop",
    "default_units": "kg",
    "is_active": true
  }
]
```

**Response Fields**:
- `id` (text) - ID del tipo de cultivo
- `name` (text) - Nombre en inglés
- `display_name_es` (text) - Nombre en español
- `category` (text) - Categoría del cultivo
- `default_units` (text) - Unidad de medida por defecto
- `is_active` (boolean) - Si el cultivo está activo

#### Bubble Dropdown Setup

1. **Multi-select Dropdown "Crop Types"**:
   - Choices source: Get data from API → getCropTypes
   - Option caption: `This crop's display_name_es`
   - Option value: `This crop's id`
   - Allow multiple selections: Yes (for primaryCropTypeIds)

#### Usage in Facility Creation

When creating a facility (MODULE 3 - Create Facility), use this endpoint to populate the crop type selector:
- Load crop types on page load or when user accesses facility form
- User can select one or more crop types as primary crops
- Selected IDs are passed to `createFacility` as `primaryCropTypeIds`

---

### Create Company (Step 2)

**Endpoint**: `POST /registration/register-step-2`
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
4. **Step 3**: Navigate to "facility-setup" page
5. **Step 4** (Only when `success = false`): Show alert with `Result of Step 1's error`

**Option Sets requeridos**:
- `businessEntityType`: S.A.S, S.A., Ltda, E.U.
- `companyType`: cannabis, coffee, flowers, vegetables

---

## MODULE 3: Facility Creation & Basics

### Create Facility

**Endpoint**: `POST /facilities/create`
**Convex Function**: `facilities.create`

**Purpose**: Create the company's first facility during onboarding (or additional facilities later)

#### Bubble API Connector Configuration

**Name**: `createFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>",
  "name": "<name>",
  "licenseNumber": "<licenseNumber>",
  "licenseType": "<licenseType>",
  "primaryCropTypeIds": ["<cropTypeId>"],
  "address": "<address>",
  "municipalityCode": "<municipalityCode>",
  "departmentCode": "<departmentCode>",
  "latitude": <latitude>,
  "longitude": <longitude>,
  "totalAreaM2": <totalAreaM2>,
  "climateZone": "<climateZone>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | k12def... |
| name | text | No | Body | North Farm |
| licenseNumber | text | No | Body | LC-12345-2025 |
| licenseType | text | No | Body | commercial_growing |
| primaryCropTypeIds | list | No | Body | ["crop123"] |
| address | text | No | Body | Finca La Esperanza, Km 15 |
| municipalityCode | text | No | Body | 05001 |
| departmentCode | text | No | Body | 05 |
| latitude | number | No | Body | 6.244747 |
| longitude | number | No | Body | -75.581211 |
| totalAreaM2 | number | No | Body | 5000 |
| climateZone | text | No | Body | tropical |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "facilityId": "f78ghi...",
  "message": "Instalación creada exitosamente",
  "error": "License number already exists",
  "code": "DUPLICATE_LICENSE"
}
```

**Response Fields**:
- `success` (boolean) - true si la instalación se creó exitosamente
- `facilityId` (text) - ID de la instalación creada
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

**Setup (on page load)**:
1. Load crop types: API Call → getCropTypes
2. Populate multi-select dropdown with crop types

**On Create Facility Click**:
1. **Trigger**: Button "Create Facility" is clicked
2. **Step 1**: Plugins → createFacility
   - token = `Current User's session_token`
   - companyId = `Current User's company_id`
   - name = `Input name's value`
   - licenseNumber = `Input licenseNumber's value`
   - licenseType = `Dropdown licenseType's value`
   - primaryCropTypeIds = `Dropdown cropTypes's checked values (list of IDs)`
   - address = `Input address's value`
   - municipalityCode = `Dropdown municipality's value`
   - departmentCode = `Dropdown department's value`
   - latitude = `Input latitude's value`
   - longitude = `Input longitude's value`
   - totalAreaM2 = `Input totalAreaM2's value`
   - climateZone = `Dropdown climateZone's value`
3. **Step 2** (Only when `success = true`): Make changes to Current User
   - `primary_facility_id` = `Result of Step 1's facilityId`
4. **Step 3**: Navigate to "user-roles" page
5. **Step 4** (Only when `success = false`): Show alert with `Result of Step 1's error`

**Option Sets requeridos**:
- `licenseType`: commercial_growing, research, medical, hemp
- `climateZone`: tropical, subtropical, temperate, cold

**Validation**:
- License number must be unique across system
- Company hasn't exceeded max_facilities limit
- Valid municipality and department codes
- Valid crop type IDs

---

### Get Facilities by Company

**Endpoint**: `POST /facilities/get-by-company`
**Convex Function**: `facilities.getByCompany`

**Purpose**: List all facilities for a company (used in facility selector, settings, etc.)

#### Bubble API Connector Configuration

**Name**: `getFacilitiesByCompany`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/get-by-company`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | k12def... |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "id": "f78ghi...",
    "name": "North Farm",
    "licenseNumber": "LC-12345-2025",
    "licenseType": "commercial_growing",
    "primaryCropTypeIds": ["crop123"],
    "totalAreaM2": 5000,
    "status": "active",
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

**Response Fields**:
- `id` (text) - ID de la instalación
- `name` (text) - Nombre de la instalación
- `licenseNumber` (text) - Número de licencia
- `licenseType` (text) - Tipo de licencia
- `primaryCropTypeIds` (list) - IDs de cultivos principales
- `totalAreaM2` (number) - Área total en m²
- `status` (text) - Estado (active, inactive)
- `createdAt` (text) - Fecha de creación ISO

#### Bubble Usage

**Dropdown Setup**:
1. **Dropdown "Facility Selector"**:
   - Choices source: Get data from API → getFacilitiesByCompany
     - token (Header) = `Current User's session_token`
     - companyId (Body) = `Current User's company_id`
   - Option caption: `This Facility's name`
   - Option value: `This Facility's id`

---

### Check License Availability

**Endpoint**: `POST /facilities/check-license`
**Convex Function**: `facilities.checkLicenseAvailability`

**Purpose**: Verify license number is unique before creating facility

#### Bubble API Connector Configuration

**Name**: `checkLicenseAvailability`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/check-license`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "licenseNumber": "<licenseNumber>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| licenseNumber | text | No | Body | LC-12345-2025 |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "available": true,
  "licenseNumber": "LC-12345-2025",
  "error": "License already exists",
  "code": "DUPLICATE_LICENSE"
}
```

**Response Fields**:
- `available` (boolean) - true si el número de licencia está disponible
- `licenseNumber` (text) - Número de licencia verificado
- `error` (text) - Mensaje de error si no disponible
- `code` (text) - Código técnico del error

#### Bubble Workflow

1. **Trigger**: Input "licenseNumber"'s value is changed → value is not empty
2. **Step 1**: Plugins → checkLicenseAvailability
   - licenseNumber = `Input licenseNumber's value`
3. **Step 2** (Only when `available is "false"`): Show alert "Este número de licencia ya está registrado"
4. **Step 3** (Only when `available is "true"`): Enable "Create Facility" button

---

### Update Facility

**Endpoint**: `POST /facilities/update`
**Convex Function**: `facilities.update`

**Purpose**: Update facility details (used in Phase 2 settings)

#### Bubble API Connector Configuration

**Name**: `updateFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/update`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "name": "<name>",
  "address": "<address>",
  "totalAreaM2": <totalAreaM2>
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| name | text | No | Body | North Farm - Updated |
| address | text | No | Body | New Address |
| totalAreaM2 | number | No | Body | 6000 |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Instalación actualizada exitosamente",
  "error": "Facility not found",
  "code": "FACILITY_NOT_FOUND"
}
```

**Response Fields**:
- `success` (boolean) - true si se actualizó exitosamente
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

---

### Delete Facility

**Endpoint**: `POST /facilities/delete`
**Convex Function**: `facilities.delete`

**Purpose**: Soft delete facility (set status to inactive)

#### Bubble API Connector Configuration

**Name**: `deleteFacility`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/delete`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Instalación eliminada exitosamente",
  "error": "Cannot delete facility with active production orders",
  "code": "FACILITY_HAS_DEPENDENCIES"
}
```

**Response Fields**:
- `success` (boolean) - true si se eliminó exitosamente
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

**Validation**:
- Check no active production orders in facility
- Check no active areas with ongoing activities
- Soft delete (set status="inactive") rather than hard delete

---

## CONTEXT DATA ENDPOINTS (Persistent Application State)

**Purpose**: Load and cache contextual data (Company, Facility) in Bubble's custom state for use across the entire application. These endpoints provide complete entity data for filtering, validation, and UI state.

**When to Load**:
1. **Page Load**: When user enters an authenticated page
2. **Facility Change**: When user switches to a different facility
3. **After Create/Update**: After creating or updating company/facility

---

### Get Company Data

**Endpoint**: `POST /companies/get`
**Convex Function**: `companies.getById`

**Purpose**: Retrieve complete company data for context persistence in Bubble

#### Bubble API Connector Configuration

**Name**: `getCompanyData`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/companies/get`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "companyId": "<companyId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| companyId | text | No | Body | k12def... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "id": "k12def...",
  "name": "Cultivos San José S.A.S",
  "legal_name": "Cultivos San José Sociedad por Acciones Simplificada",
  "business_entity_type": "S.A.S",
  "company_type": "cannabis",
  "country": "CO",
  "department_code": "05",
  "municipality_code": "05001",
  "subscription_plan": "trial",
  "max_facilities": 3,
  "max_users": 10,
  "status": "active",
  "created_at": 1705329600000
}
```

**Response Fields**:
- `id` (text) - ID de la empresa
- `name` (text) - Nombre de la empresa
- `legal_name` (text) - Nombre legal registrado
- `business_entity_type` (text) - Tipo de entidad (S.A.S, S.A., Ltda)
- `company_type` (text) - Tipo de cultivo (cannabis, coffee, etc.)
- `country` (text) - País (CO)
- `department_code` (text) - Código del departamento
- `municipality_code` (text) - Código del municipio
- `subscription_plan` (text) - Plan de suscripción
- `max_facilities` (number) - Máximo de instalaciones permitidas
- `max_users` (number) - Máximo de usuarios permitidos
- `status` (text) - Estado de la empresa (active, inactive)
- `created_at` (number) - Timestamp de creación

#### Bubble Usage - Store in Custom State

```javascript
// On page load (after validateToken)
Workflow: When page loads
  Step 1: Get Current User's company_id
  Step 2: API Call → getCompanyData (companyId = Current User's company_id)
  Step 3: Save to Custom State "CurrentContext"
    - Set CurrentContext.company = Result of Step 2
    - Set CurrentContext.loaded = yes
```

---

### Get Facility Data

**Endpoint**: `POST /facilities/get`
**Convex Function**: `facilities.get`

**Purpose**: Retrieve complete facility data for context persistence in Bubble

#### Bubble API Connector Configuration

**Name**: `getFacilityData`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/facilities/get`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "companyId": "<companyId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| facilityId | text | No | Body | f78ghi... |
| companyId | text | No | Body | k12def... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "id": "f78ghi...",
  "company_id": "k12def...",
  "name": "North Farm",
  "license_number": "LC-12345-2025",
  "license_type": "commercial_growing",
  "primary_crop_type_ids": ["crop123", "crop456"],
  "address": "Finca La Esperanza, Km 15",
  "administrative_division_1": "05",
  "administrative_division_2": "05001",
  "latitude": 6.244747,
  "longitude": -75.581211,
  "total_area_m2": 5000,
  "status": "active",
  "created_at": 1705329600000
}
```

**Response Fields**:
- `id` (text) - ID de la instalación
- `company_id` (text) - ID de la empresa propietaria
- `name` (text) - Nombre de la instalación
- `license_number` (text) - Número de licencia
- `license_type` (text) - Tipo de licencia
- `primary_crop_type_ids` (list) - IDs de cultivos principales
- `address` (text) - Dirección de la instalación
- `administrative_division_1` (text) - Código del departamento
- `administrative_division_2` (text) - Código del municipio
- `latitude` (number) - Coordenada de latitud
- `longitude` (number) - Coordenada de longitud
- `total_area_m2` (number) - Área total en metros cuadrados
- `status` (text) - Estado (active, inactive)
- `created_at` (number) - Timestamp de creación

#### Bubble Usage - Store in Custom State

```javascript
// On page load or when user changes facility
Workflow: When page loads OR When facility selector changes
  Step 1: Get facility ID (from Current User's primary_facility_id OR dropdown)
  Step 2: API Call → getFacilityData
    - facilityId = facility ID
    - companyId = Current User's company_id
  Step 3: Save to Custom State "CurrentContext"
    - Set CurrentContext.facility = Result of Step 2
    - Set CurrentContext.loaded = yes

// Used by all dropdowns for pre-population:
Dropdown "Department":
  - Initial value: CurrentContext.facility.administrative_division_1

Dropdown "Municipality":
  - Load: getMunicipalities(departmentCode = CurrentContext.facility.administrative_division_1)
```

---

## MODULE 4: User Role Assignment

### Assign User Role

**Endpoint**: `POST /users/assign-role`
**Convex Function**: `users.assignRole`

**Purpose**: Assign role to user during onboarding (Owner, Manager) or invite new users later

#### Bubble API Connector Configuration

**Name**: `assignUserRole`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/assign-role`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>",
  "companyId": "<companyId>",
  "roleId": "<roleId>",
  "facilityAccess": ["<facilityId>"]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | j97abc... |
| companyId | text | No | Body | k12def... |
| roleId | text | No | Body | role_owner |
| facilityAccess | list | No | Body | ["f78ghi..."] |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Rol asignado exitosamente",
  "error": "User already has role",
  "code": "USER_ALREADY_HAS_ROLE"
}
```

**Response Fields**:
- `success` (boolean) - true si se asignó el rol exitosamente
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

#### Bubble Workflow

**During Onboarding (auto-assign Owner)**:
1. **Trigger**: Page "user-roles" is loaded
2. **Step 1**: Plugins → assignUserRole
   - token = `Current User's session_token`
   - userId = `Current User's backend_user_id`
   - companyId = `Current User's company_id`
   - roleId = "role_owner"
   - facilityAccess = [`Current User's primary_facility_id`]
3. **Step 2** (Only when `success = true`): Navigate to "dashboard"

**Role Types**:
- `role_owner` - Full access, can manage company settings
- `role_manager` - Can approve production orders, manage users
- `role_supervisor` - Can create production orders, view reports
- `role_operator` - Can execute activities only

---

### Get Users by Company

**Endpoint**: `POST /users/get-by-company`
**Convex Function**: `users.getByCompany`

**Purpose**: List all users in company (used in user management page)

#### Bubble API Connector Configuration

**Name**: `getUsersByCompany`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/get-by-company`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "companyId": "<companyId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| companyId | text | No | Body | k12def... |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "id": "j97abc...",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roleId": "role_owner",
    "roleName": "Owner",
    "status": "active",
    "lastLogin": "2025-01-15T10:30:00Z"
  }
]
```

**Response Fields**:
- `id` (text) - ID del usuario
- `email` (text) - Email del usuario
- `firstName` (text) - Nombre
- `lastName` (text) - Apellido
- `roleId` (text) - ID del rol
- `roleName` (text) - Nombre del rol
- `status` (text) - Estado (active, inactive, pending_invitation)
- `lastLogin` (text) - Último login ISO

---

### Update User Role

**Endpoint**: `POST /users/update-role`
**Convex Function**: `users.updateRole`

**Purpose**: Change user's role or facility access

#### Bubble API Connector Configuration

**Name**: `updateUserRole`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/update-role`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>",
  "roleId": "<roleId>",
  "facilityAccess": ["<facilityId>"]
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | j97abc... |
| roleId | text | No | Body | role_manager |
| facilityAccess | list | No | Body | ["f78ghi..."] |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "error": "Cannot remove last owner",
  "code": "CANNOT_REMOVE_LAST_OWNER"
}
```

**Response Fields**:
- `success` (boolean) - true si se actualizó exitosamente
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

**Validation**:
- Cannot remove last owner from company
- Only owners can assign owner role
- Manager+ required to assign manager role

---

### Deactivate User

**Endpoint**: `POST /users/deactivate`
**Convex Function**: `users.deactivate`

**Purpose**: Soft delete user (set status to inactive, revoke access)

#### Bubble API Connector Configuration

**Name**: `deactivateUser`
**Use as**: Action
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/users/deactivate`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "userId": "<userId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| userId | text | No | Body | j97abc... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "error": "Cannot deactivate last owner",
  "code": "CANNOT_DEACTIVATE_LAST_OWNER"
}
```

**Response Fields**:
- `success` (boolean) - true si se desactivó exitosamente
- `message` (text) - Mensaje descriptivo del resultado
- `error` (text) - Mensaje de error si success=false
- `code` (text) - Código técnico del error

---

## MODULE 5: Dashboard Home

### Get Dashboard Summary

**Endpoint**: `POST /dashboard/summary`
**Convex Function**: `dashboard.getSummary`

**Purpose**: Get key metrics for dashboard home page

#### Bubble API Connector Configuration

**Name**: `getDashboardSummary`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/dashboard/summary`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |

**Complete Response** (inicializar TODOS estos campos en Bubble):
```json
{
  "facilityName": "North Farm",
  "activeProductionOrders": 12,
  "pendingActivities": 8,
  "overdueActivities": 2,
  "completionRate": 85.5,
  "areasInUse": 6,
  "totalAreas": 8,
  "lowStockItems": 3
}
```

**Response Fields**:
- `facilityName` (text) - Nombre de la instalación
- `activeProductionOrders` (number) - Órdenes de producción activas
- `pendingActivities` (number) - Actividades pendientes hoy
- `overdueActivities` (number) - Actividades vencidas
- `completionRate` (number) - Tasa de completación (%)
- `areasInUse` (number) - Áreas en uso
- `totalAreas` (number) - Total de áreas
- `lowStockItems` (number) - Items con stock bajo

#### Bubble Usage

**Display on Dashboard**:
- Show summary cards with these metrics
- Update on page load
- Color-code warnings (red for overdue, yellow for low stock)

---

### Get Recent Activities

**Endpoint**: `POST /dashboard/recent-activities`
**Convex Function**: `dashboard.getRecentActivities`

**Purpose**: Get list of recent/upcoming activities for dashboard

#### Bubble API Connector Configuration

**Name**: `getRecentActivities`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/dashboard/recent-activities`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>",
  "limit": <limit>
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |
| limit | number | No | Body | 10 |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "id": "act123...",
    "name": "Riego matutino",
    "productionOrderName": "Batch Cannabis #45",
    "areaName": "Greenhouse A",
    "scheduledDate": "2025-01-15",
    "status": "pending",
    "priority": "high",
    "assignedTo": "Juan Pérez"
  }
]
```

**Response Fields**:
- `id` (text) - ID de la actividad
- `name` (text) - Nombre de la actividad
- `productionOrderName` (text) - Nombre de la orden de producción
- `areaName` (text) - Nombre del área
- `scheduledDate` (text) - Fecha programada (ISO)
- `status` (text) - Estado (pending, in_progress, completed, overdue)
- `priority` (text) - Prioridad (low, medium, high)
- `assignedTo` (text) - Usuario asignado

#### Bubble Usage

**Repeating Group Setup**:
- Data source: Get data from API → getRecentActivities
- Sort by: scheduledDate
- Filter: Show today + next 7 days
- Color-code by status

---

### Get Active Alerts

**Endpoint**: `POST /dashboard/alerts`
**Convex Function**: `dashboard.getActiveAlerts`

**Purpose**: Get system alerts and notifications

#### Bubble API Connector Configuration

**Name**: `getActiveAlerts`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/dashboard/alerts`
**Data Type**: List of objects (Return list = Yes)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "facilityId": "<facilityId>"
}
```

**Parameters**:
| Parameter | Type | Private | Source | Example |
|-----------|------|---------|--------|---------|
| token | text | Yes | Header | a2g3YnI1M2RuazR5bWplNms... |
| facilityId | text | No | Body | f78ghi... |

**Complete Response** (array - inicializar estos campos en Bubble):
```json
[
  {
    "id": "alert123...",
    "type": "low_stock",
    "severity": "warning",
    "message": "Nutriente A bajo en stock (5 unidades restantes)",
    "createdAt": "2025-01-15T08:00:00Z",
    "actionRequired": true,
    "actionUrl": "/inventory/item/inv123"
  }
]
```

**Response Fields**:
- `id` (text) - ID de la alerta
- `type` (text) - Tipo (low_stock, overdue_activity, pest_detected, compliance_due)
- `severity` (text) - Severidad (info, warning, critical)
- `message` (text) - Mensaje descriptivo
- `createdAt` (text) - Fecha de creación ISO
- `actionRequired` (boolean) - Requiere acción
- `actionUrl` (text) - URL para acción (relativa)

#### Bubble Usage

**Alert Banner**:
- Show critical alerts at top of dashboard
- Color-code by severity (blue=info, yellow=warning, red=critical)
- Link to action URL when clicked
- Dismiss functionality

---

## MODULE 6: Login & Session Management

### Simple Login

**Endpoint**: `POST /registration/login`
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

**Endpoint**: `POST /registration/validate-token`
**Convex Function**: `registration.validateToken`

**Use**: Llamar en page load de páginas protegidas. Si valid=false, hacer logout y redirigir a login.

#### Bubble API Connector Configuration

**Name**: `validateToken`
**Use as**: Data
**Method**: POST
**URL**: `https://handsome-jay-388.convex.site/registration/validate-token`
**Data Type**: Single object (Return list = No)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
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

## IMPLEMENTATION STATUS SUMMARY

### ✅ Fully Implemented (Ready for Bubble)

**MODULE 1: Authentication** - 5 endpoints
- ✅ Check email availability
- ✅ Register user (step 1)
- ✅ Verify email token
- ✅ Resend verification email
- ✅ Check verification status

**MODULE 2: Company Creation** - 3 endpoints
- ✅ Get departments
- ✅ Get municipalities
- ✅ Create company (step 2)

**MODULE 3: Facility Creation** - 1 endpoint
- ✅ Get crop types (NEW)

**Context Data Endpoints** - 2 endpoints
- ✅ Get company data (NEW)
- ✅ Get facility data (NEW)

**MODULE 6: Login & Session** - 3 endpoints
- ✅ Simple login
- ✅ Validate session token
- ✅ Logout

**Total Ready**: 14 endpoints

**Convex Files**:
- [convex/registration.ts](../../convex/registration.ts)
- [convex/emailVerification.ts](../../convex/emailVerification.ts)
- [convex/geographic.ts](../../convex/geographic.ts)
- [convex/crops.ts](../../convex/crops.ts)
- [convex/companies.ts](../../convex/companies.ts)
- [convex/facilities.ts](../../convex/facilities.ts)

---

### ✅ Newly Completed (2025-01-20)

**MODULE 3: Facility Creation** - 5 endpoints
- ✅ Create facility
- ✅ Get facilities by company
- ✅ Check license availability
- ✅ Update facility
- ✅ Delete facility

**MODULE 4: User Role Assignment** - 4 endpoints
- ✅ Assign user role
- ✅ Get users by company
- ✅ Update user role
- ✅ Deactivate user

**MODULE 5: Dashboard Home** - 3 endpoints
- ✅ Get dashboard summary
- ✅ Get recent activities
- ✅ Get active alerts

**Total Completed**: 12 endpoints

**Implementation Files**:
- [convex/facilities.ts](../../convex/facilities.ts) - Facility management functions
- [convex/users.ts](../../convex/users.ts) - User role management functions
- [convex/dashboard.ts](../../convex/dashboard.ts) - Dashboard metrics and alerts
- [convex/http.ts](../../convex/http.ts) - HTTP endpoints for all modules (lines 507-1363)

---

## AUTHENTICATION & HEADERS

All authenticated endpoints (after login) should include:

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [user-session-token]
```

**Note**: The token is stored in Bubble User's `session_token` field after successful login/registration.

**Token Lifecycle**:
1. Generated during registration or login (30-day expiration)
2. Stored in User's session_token field
3. Sent in Authorization header for all authenticated requests
4. Validated on protected page loads
5. Invalidated on logout or expiration

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
- `EMAIL_NOT_VERIFIED`: Email verification required
- `TOKEN_EXPIRED`: Session token expired
- `TOKEN_INVALID`: Session token invalid

For complete error code translations, see [../i18n/STRATEGY.md](../i18n/STRATEGY.md).

---

## BUBBLE DEVELOPER QUICK START

### Step-by-Step Setup Guide

1. **Install API Connector Plugin**
   - Go to Plugins tab in Bubble
   - Add plugin: "API Connector"

2. **Create API Connection**
   - Name: "Alquemist Backend"
   - Authentication: None (we use custom tokens)

3. **Configure Each Endpoint** (12 ready + 11 pending)
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
   - `primary_facility_id` (text)

5. **Create Option Sets** (for dropdowns)
   - `businessEntityType`: S.A.S, S.A., Ltda, E.U.
   - `companyType`: cannabis, coffee, flowers, vegetables
   - `licenseType`: commercial_growing, research, medical, hemp
   - `climateZone`: tropical, subtropical, temperate, cold
   - `userRole`: role_owner, role_manager, role_supervisor, role_operator

6. **Implement Page Workflows**
   - Signup page → registerUserStep1
   - Verification page → verifyEmailToken, checkVerificationStatus
   - Company setup → getDepartments, getMunicipalities, registerCompanyStep2
   - Facility setup → getCropTypes, createFacility, checkLicenseAvailability
   - User roles → assignUserRole
   - Dashboard → getDashboardSummary, getRecentActivities, getActiveAlerts
   - Login page → login
   - Protected pages → validateToken (on page load)
   - Logout button → logout

### API Call Order (User Journey)

```
ONBOARDING FLOW:
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
6. getCropTypes (for facility form dropdowns)
   ↓
7. createFacility (with checkLicenseAvailability)
   ↓
8. assignUserRole (auto-assign owner)
   ↓
9. Navigate to dashboard → getDashboardSummary, getRecentActivities

RETURNING USER FLOW:
1. login (returns token)
   ↓
2. validateToken (on each page load)
   ↓
3. [Use app]
   ↓
4. logout (invalidates token)
```

---

## REAL-TIME UPDATES & DATA POLLING

### Overview

Phase 1 primarily handles **one-time transactions** (sign up, login, create company). Most data does **not** require real-time updates. However, the **Dashboard** (getDashboardSummary, getRecentActivities, getActiveAlerts) may need periodic refreshes if accessed for extended periods.

**Important**: HTTP endpoints are **not reactive**. Changes made by other users are not automatically pushed to the client. Use polling to periodically fetch updated data.

### Polling Strategy by Module

#### MODULE 1-4: Authentication, Company, Facilities, Users
**Polling Requirement: NONE**
- One-time operations (register, login, create company)
- No need for periodic updates
- Use event-based refresh only (after creating facility, assigning role)

**Example Workflow:**
```javascript
Workflow: When facility is created successfully
  Step 1: createFacility API call
  Step 2: Wait 1 second
  Step 3: Refresh getFacilitiesByCompany (to show new facility)
  Step 4: Navigate to next page
```

#### MODULE 5: Dashboard Home
**Polling Requirement: OPTIONAL (if dashboard kept open)**

**Data Volatility:**
- **Dashboard Summary**: Low (changes hourly, not critical)
- **Recent Activities**: Medium (changes as users work)
- **Active Alerts**: Medium (new stock alerts, overdue activities)

**Recommended Approach:**

| Scenario | Strategy |
|----------|----------|
| User views dashboard briefly | Page load only |
| User keeps dashboard open 30+ min | Poll every 60 seconds |
| Real-time monitoring dashboard | Poll every 15-30 seconds |

**Implementation:**

```markdown
### Dashboard Refresh Patterns

**Pattern 1: Page Load Only (Default)**
```javascript
Workflow: Page Load
  → API: getDashboardSummary
  → API: getRecentActivities
  → API: getActiveAlerts
  → Display results
```

**Pattern 2: Periodic Refresh (If dashboard stays open)**
```javascript
Workflow: Every 60 seconds
  → API: getDashboardSummary
  → API: getRecentActivities
  → API: getActiveAlerts
  → Update display

Element: Text "Last Updated"
  Text: "Last updated: [Current date/time]"
  Visibility: Show when page.dashboard_loaded = true
```

**Pattern 3: Optimized with Count Endpoint (Future)**
```javascript
Workflow: Every 30 seconds
  → API: getActivityCount (lightweight, returns count only)

  → Only if count changed:
      → API: getRecentActivities (full data)
      → Update display

// This reduces API calls by 90% if nothing changed
```

**Pattern 4: Manual Refresh + Auto-Refresh**
```javascript
Element: Button "Refresh Dashboard"

Workflow: Page Load
  → Auto-load dashboard data (Pattern 1)

Workflow: Every 60 seconds
  → Auto-refresh dashboard (Pattern 2)

Workflow: Click "Refresh Dashboard"
  → Manual immediate refresh
  → Show "Last updated: just now"
```

### Cost Implications

**Per User, Per Hour:**
- Page load only: 0-1 API calls (free)
- Periodic refresh (60s): ~60 API calls
- Aggressive refresh (15s): ~240 API calls
- Optimized count approach: ~10 full refreshes + 240 count checks

**Recommendation for Phase 1:**
- Start with **page load only** (no polling)
- Add periodic refresh (60s) if users report stale data
- Add manual refresh button as fallback
- Monitor Bubble workload units and adjust

### Documentation for Bubble Developers

Include this note in your Bubble setup guides:

```markdown
## Dashboard Data Freshness

The dashboard shows a snapshot of current data when the page loads.

**Data is not updated automatically** if you keep the page open. This is a limitation of HTTP-based APIs.

If you need current data:
1. Click the "Refresh" button to update immediately
2. Or wait for periodic auto-refresh (if configured)

Changes you make in other parts of the app will appear on the dashboard:
- Within 1-2 seconds if you navigate to dashboard
- Within 60 seconds if dashboard is already open and polling is enabled
```

---

### Testing Checklist

**Phase 1 Onboarding** (23/23 endpoints ✅ COMPLETE):

**MODULE 1: Authentication** ✅
- [x] Check email availability
- [x] Register user (step 1)
- [x] Verify email token
- [x] Check verification status
- [x] Resend verification email
- [x] Register user (step 2)
- [x] Login with credentials
- [x] Validate session token

**MODULE 2: Company Management** ✅
- [x] Create company
- [x] Update company info
- [x] Get company info

**MODULE 3: Facility Management** ✅
- [x] Create facility
- [x] Get facilities by company
- [x] Check license availability
- [x] Update facility
- [x] Delete facility
- [x] Get departments
- [x] Get municipalities by department

**MODULE 4: User Role Assignment** ✅
- [x] Assign user role
- [x] Get users by company
- [x] Update user role
- [x] Deactivate user

**MODULE 5: Dashboard** ✅
- [x] Get dashboard summary
- [x] Get recent activities
- [x] Get active alerts

---

**Status**: ✅ Phase 1 COMPLETE - All endpoints implemented and production-ready
**Ready Endpoints**: 23/23 (100% complete)
**Implementation Status**:
- ✅ All authentication endpoints functional with email verification
- ✅ Company creation and management fully implemented
- ✅ Facility creation with license validation working
- ✅ User role assignment with access control NEWLY ADDED
- ✅ Dashboard with alerts and activity tracking NEWLY ADDED
- ✅ Geographic data (departments/municipalities) integrated
- ✅ Session management and token validation complete

**Recent Changes (2025-01-20)**:
- Added MODULE 4 HTTP endpoints for user role assignment (4 endpoints)
- Added MODULE 5 HTTP endpoints for dashboard (3 endpoints)
- All 23 Phase 1 endpoints now exposed via HTTP for Bubble integration

**Next Steps**:
1. ✅ Phase 1 backend COMPLETE - Move to Phase 2 (Basic Setup & Master Data)
2. Implement PHASE 2 endpoints (Areas, Cultivars, Suppliers, Inventory, Settings)
3. Continue with Phase 3-5 as per project roadmap

---

**Last Updated**: 2025-01-20
**Version**: 2.1 (Phase 1 fully complete with all HTTP endpoints)
