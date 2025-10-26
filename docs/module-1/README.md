# Module 1: Authentication & Account Creation

**Status**: ✅ Ready for Implementation
**Priority**: P0 (Critical Path)
**Implementation**: Bubble Frontend + Convex Backend

---

## Overview

Module 1 implements user registration with company creation in a simplified, single-step flow. Users provide minimal information to get started quickly, with the option to complete their profile later.

### Key Features

- **Simplified Registration**: Minimal fields (7 required fields)
- **Company Creation**: Automatic company workspace creation
- **Owner Role Assignment**: First user becomes Company Owner
- **Regional Support**: Colombian departments and municipalities (DANE codes)
- **Business Entity Types**: S.A.S, S.A., Ltda, E.U., Persona Natural
- **Email Validation**: Frontend and backend validation
- **Password Security**: 8+ characters, letter + number required

---

## User Flow

```
1. User lands on registration page
2. User fills form:
   - Personal: First Name, Last Name, Email, Password, Phone (optional)
   - Company: Company Name, Business Type
   - Location: Department, Municipality
3. Click "Registrar" (Register)
4. System creates:
   - Company record
   - User record (as Owner)
   - Links user to company
5. Redirect to email verification (Module 2)
```

**Time to Complete**: < 3 minutes

---

## Implementation Files

### Backend (Convex)

| File | Purpose |
|------|---------|
| [convex/schema.ts](../../convex/schema.ts) | Database tables: `companies`, `users`, `roles`, `geographic_locations` |
| [convex/registration.ts](../../convex/registration.ts) | Registration mutations and queries |
| [convex/auth.ts](../../convex/auth.ts) | Password hashing and validation utilities |
| [convex/geographic.ts](../../convex/geographic.ts) | Geographic data queries (departments, municipalities) |
| [convex/seedGeographic.ts](../../convex/seedGeographic.ts) | Colombian geographic data seeding |
| [convex/seedRoles.ts](../../convex/seedRoles.ts) | System roles seeding |

### Frontend (Bubble)

See [bubble/Module-1-Bubble-Guide.md](bubble/Module-1-Bubble-Guide.md) for detailed implementation guide.

---

## Database Schema

### Companies Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organization_id | string | ✅ | Unique organization identifier |
| name | string | ✅ | Company name |
| company_type | string | ✅ | cannabis/coffee/cocoa/flowers/mixed |
| business_entity_type | string | ❌ | S.A.S, S.A., Ltda, E.U., Persona Natural |
| country | string | ✅ | Country code (default: "CO") |
| administrative_division_1 | string | ❌ | Department name |
| administrative_division_2 | string | ❌ | Municipality name |
| regional_administrative_code | string | ❌ | DANE municipality code |
| default_locale | string | ✅ | Default: "es" |
| default_currency | string | ✅ | Default: "COP" |
| default_timezone | string | ✅ | Default: "America/Bogota" |
| subscription_plan | string | ✅ | Default: "trial" |
| status | string | ✅ | active/suspended/closed |

### Users Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| company_id | id | ✅ | Link to companies table |
| email | string | ✅ | User email (unique, lowercase) |
| password_hash | string | ✅ | Hashed password |
| email_verified | boolean | ✅ | Default: false (Module 2) |
| first_name | string | ❌ | User's first name |
| last_name | string | ❌ | User's last name |
| phone | string | ❌ | Phone number (+57XXXXXXXXXX) |
| role_id | id | ✅ | Link to roles table |
| locale | string | ✅ | Default: "es" |
| timezone | string | ✅ | From selected municipality |
| status | string | ✅ | active/inactive/suspended |

### Geographic Locations Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| country_code | string | ✅ | ISO 3166-1 alpha-2 (e.g., "CO") |
| country_name | string | ✅ | Country name |
| administrative_level | number | ✅ | 1 = Department, 2 = Municipality |
| division_1_code | string | ❌ | DANE department code |
| division_1_name | string | ❌ | Department name |
| division_2_code | string | ❌ | DANE municipality code |
| division_2_name | string | ❌ | Municipality name |
| parent_division_1_code | string | ❌ | Parent department code |
| timezone | string | ❌ | IANA timezone |

---

## API Endpoints

### Registration

**Endpoint**: `POST /api/mutation/registration:register`

**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567",
  "companyName": "Cultivos San José",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "userId": "jd7...",
  "companyId": "jn7...",
  "organizationId": "org_test_...",
  "message": "Registro exitoso. Por favor verifica tu correo electrónico."
}
```

**Response (Error)**:
```json
{
  "error": "El correo electrónico ya está registrado"
}
```

### Check Email Availability

**Endpoint**: `GET /api/query/registration:checkEmailAvailability?args={"email":"..."}`

**Response**:
```json
{
  "available": true,
  "email": "juan@example.com"
}
```

### Get Departments

**Endpoint**: `GET /api/query/geographic:getDepartments?args={"countryCode":"CO"}`

**Response**:
```json
[
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  ...
]
```

### Get Municipalities

**Endpoint**: `GET /api/query/geographic:getMunicipalities?args={"countryCode":"CO","departmentCode":"05"}`

**Response**:
```json
[
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05"
  },
  ...
]
```

---

## Validation Rules

### Email
- Format: `user@domain.com`
- Must be unique
- Case-insensitive
- Required

### Password
- Minimum 8 characters
- At least 1 letter
- At least 1 number
- No maximum length

### Phone (Optional)
- Colombian format: `+57XXXXXXXXXX` or `XXXXXXXXXX`
- Auto-formatted to `+57XXXXXXXXXX`
- 10 digits after country code

### Names
- First Name: Required, 1-50 characters
- Last Name: Required, 1-50 characters

### Company Name
- Required
- 2-100 characters
- Can include letters, numbers, spaces, and common punctuation

### Business Entity Type
- Options: `S.A.S`, `S.A.`, `Ltda`, `E.U.`, `Persona Natural`
- Required

### Company Type
- Options: `cannabis`, `coffee`, `cocoa`, `flowers`, `mixed`
- Required

---

## Regional Configuration

### Colombia (Default)

- **Currency**: COP (Colombian Peso) - Format: `$290.000`
- **Locale**: `es` (Spanish)
- **Timezone**: `America/Bogota` (UTC-5)
- **Phone Format**: `+57 XXX XXX XXXX`
- **Administrative Codes**: DANE (Departamento Administrativo Nacional de Estadística)

### Business Entity Types (Colombia)

| Type | Full Name | Description |
|------|-----------|-------------|
| S.A.S | Sociedad por Acciones Simplificada | Simplified stock corporation |
| S.A. | Sociedad Anónima | Public limited company |
| Ltda | Limitada | Private limited company |
| E.U. | Empresa Unipersonal | Sole proprietorship company |
| Persona Natural | Individual | Self-employed individual |

---

## Setup Instructions

### 1. Seed Database

Run these Convex mutations in order:

```bash
# 1. Seed roles (required for COMPANY_OWNER role)
npx convex run seedRoles:seedSystemRoles

# 2. Seed geographic data (Colombian departments and municipalities)
npx convex run seedGeographic:seedColombianGeography
```

### 2. Verify Seeding

```bash
# Check roles
npx convex run roles:list

# Check geographic data
npx convex run geographic:getDepartments '{"countryCode":"CO"}'
```

### 3. Implement Bubble Frontend

Follow the detailed guide in [bubble/Module-1-Bubble-Guide.md](bubble/Module-1-Bubble-Guide.md)

---

## Testing Checklist

### Frontend Validation
- [ ] Email format validation
- [ ] Password strength validation (8+ chars, letter + number)
- [ ] Required fields validation
- [ ] Department dropdown populates from Convex
- [ ] Municipality dropdown filters by department
- [ ] Form submits successfully

### Backend Testing
- [ ] Create user with valid data
- [ ] Reject duplicate email
- [ ] Validate password requirements
- [ ] Create company record
- [ ] Assign COMPANY_OWNER role
- [ ] Set correct timezone from municipality
- [ ] Default to trial subscription

### Edge Cases
- [ ] Email already registered
- [ ] Invalid department code
- [ ] Invalid municipality code
- [ ] Missing required fields
- [ ] Password too short
- [ ] Special characters in names

---

## Success Metrics

- **Registration Completion Rate**: >85%
- **Average Signup Time**: <3 minutes
- **Form Abandonment Rate**: <15%
- **Email Format Errors**: <5%

---

## Next Steps

After completing Module 1, proceed to:

**Module 2**: Email Verification
- Send verification email
- Verify email token
- Enable account access

---

## Support

For implementation questions:
1. Review [bubble/Module-1-Bubble-Guide.md](bubble/Module-1-Bubble-Guide.md)
2. Check API endpoint documentation above
3. Test with Convex dashboard: [https://dashboard.convex.dev](https://dashboard.convex.dev)
