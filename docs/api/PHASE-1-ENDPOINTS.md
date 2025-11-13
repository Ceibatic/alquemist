# PHASE 1: API ENDPOINTS

**Base URL**: `https://handsome-jay-388.convex.site`

**Database Schema**: See [../database/SCHEMA.md](../database/SCHEMA.md)
**UI Requirements**: See [../ui/bubble/PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md)

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

---

## MODULE 3: Facility Creation

⚠️ **STATUS**: Not yet implemented

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

**Module 1-2: Authentication & Company Creation**
- ✅ Check email availability
- ✅ Register user (step 1)
- ✅ Verify email token
- ✅ Resend verification email
- ✅ Check verification status
- ✅ Get departments
- ✅ Get municipalities
- ✅ Create company (step 2)
- ✅ Simple login

**Convex Files**:
- [convex/registration.ts](../../convex/registration.ts)
- [convex/emailVerification.ts](../../convex/emailVerification.ts)
- [convex/geographic.ts](../../convex/geographic.ts)

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

**Status**: Phase 1 API specification complete
**Ready Endpoints**: Modules 1-2 (8 endpoints)
**Pending Endpoints**: Modules 3-6 (20+ endpoints)
**Next Steps**: Implement pending Convex functions for Modules 3-6
