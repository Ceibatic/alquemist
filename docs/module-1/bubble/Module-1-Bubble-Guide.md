# Module 1: Two-Step Registration - Bubble Implementation Guide

**Complete step-by-step guide for implementing the 2-step registration with email verification in Bubble**

---

## Overview

The registration process now uses a **3-phase flow**:

1. **Phase 1: Personal Information** - User creates account (email + password)
2. **Phase 2: Email Verification** - User verifies email address
3. **Phase 3: Company Information** - User creates company and completes onboarding

This approach provides:
- ✅ Better UX with shorter forms
- ✅ Verified email addresses
- ✅ Flexibility for users
- ✅ Reduced form abandonment

---

## Prerequisites

Before starting:

1. ✅ Convex database seeded with:
   - System roles (`seedRoles:seedSystemRoles`)
   - Geographic data (`seedGeographic:seedColombianGeography`)
2. ✅ Backend implementation complete:
   - Email verification system
   - Step 1 & Step 2 registration mutations
   - HTTP endpoints configured
3. ✅ Convex deployment URL available
4. ✅ Bubble account created
5. ✅ Basic familiarity with Bubble editor

---

## Part 1: Bubble API Connector Setup

### Step 1.1: Install API Connector Plugin

1. Go to **Plugins** tab in Bubble
2. Click **Add plugins**
3. Search for "API Connector"
4. Click **Install** (free plugin)

### Step 1.2: Configure Convex API

1. Open **Plugins** → **API Connector**
2. Click **Add another API**
3. Configure as follows:

**API Name**: `Convex`

**Authentication**: `None`

**Shared Headers**:
```
Content-Type: application/json
```

**Server URLs**:
- Development: `https://[your-deployment].convex.site`
- Production: `https://[your-deployment].convex.site`

Replace `[your-deployment]` with your actual Convex deployment ID.

**Important**: Use `.convex.site` (NOT `.convex.cloud`) for HTTP actions.

---

## Part 2: Create API Calls (3 Total)

### API Call 1: Register User Step 1

**Name**: `Register User Step 1`
**Use as**: `Action`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/registration/register-step-1`

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

**Private Parameters**:
- All parameters: **Uncheck** ☐ (all are dynamic)

**Test Data**:
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "3001234567"
}
```

**Expected Response**:
```json
{
  "success": true,
  "userId": "n976j2dyzskxa97mjthe4endts7t6gvx",
  "email": "test@example.com",
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr",
  "message": "Cuenta creada. Por favor verifica tu correo electrónico."
}
```

---

### API Call 2: Verify Email Token

**Name**: `Verify Email Token`
**Use as**: `Action`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/registration/verify-email`

**Body**:
```json
{
  "token": "<token>"
}
```

**Private Parameters**:
- token: **Uncheck** ☐

**Expected Response**:
```json
{
  "success": true,
  "userId": "n976j2dyzskxa97mjthe4endts7t6gvx",
  "message": "¡Email verificado exitosamente!"
}
```

---

### API Call 3: Register Company Step 2

**Name**: `Register Company Step 2`
**Use as**: `Action`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/registration/register-step-2`

**Body**:
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
- country: **Keep Private** ✓ (always "CO")
- All others: **Uncheck** ☐

**Test Data**:
```json
{
  "userId": "n976j2dyzskxa97mjthe4endts7t6gvx",
  "companyName": "Cultivos Mendez S.A.S",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

**Expected Response**:
```json
{
  "success": true,
  "userId": "n976j2dyzskxa97mjthe4endts7t6gvx",
  "companyId": "jn7ea3r18m5ssd368qjve67ke97t6bpe",
  "organizationId": "org_test_1761514959078_anx8cl",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente. Acceso a plataforma."
}
```

---

### API Call 4: Get Departments (for Step 2)

**Name**: `Get Departments`
**Use as**: `Data`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/geographic/departments`

**Body**:
```json
{
  "countryCode": "CO"
}
```

**Expected Response**: Array of departments

---

### API Call 5: Get Municipalities (for Step 2)

**Name**: `Get Municipalities`
**Use as**: `Data`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/geographic/municipalities`

**Body**:
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

**Private Parameters**:
- departmentCode: **Uncheck** ☐

**Expected Response**: Array of municipalities

---

## Part 3: Build 3 Pages

### Page 1: `/signup-step-1` - Personal Information

**Page Elements**:

| Element | Type | Name | Content/Placeholder |
|---------|------|------|-------------------|
| Title | Text | - | "Crear Cuenta" |
| Subtitle | Text | - | "Paso 1/2 - Información Personal" |
| Email | Input | `Input Email` | "Correo Electrónico" |
| Password | Input | `Input Password` | "Contraseña (mín. 8)" |
| First Name | Input | `Input First Name` | "Nombre" |
| Last Name | Input | `Input Last Name` | "Apellido" |
| Phone | Input | `Input Phone` | "Teléfono (opcional)" |
| Submit | Button | `Button Register Step1` | "Crear Cuenta" |

**Styling**:
- Container: 400px white box, centered, 32px padding
- Button: Full width, green (#10B981)
- All text in Spanish

---

### Page 2: `/signup-verify-email` - Email Verification

**Page Elements**:

| Element | Type | Name | Content/Placeholder |
|---------|------|------|-------------------|
| Header | Text | - | "✉️ Verificación de Email" |
| Message | Text | - | "Se envió un email de verificación a {email}" |
| Email Display | Text | `Text Email Display` | Show: current_email |
| Code Input | Input | `Input Verification Code` | "Pega el código (32 caracteres)" |
| Verify Button | Button | `Button Verify Email` | "Verificar" |
| Resend Link | Link | `Link Resend Email` | "¿No recibiste el email? Reenviar" |

**Styling**:
- Container: 500px white box, centered
- Info message: Light blue background
- Success state: Show green checkmark, auto-navigate after 2 seconds

---

### Page 3: `/signup-step-2` - Company Information

**Page Elements**:

| Element | Type | Name | Placeholder |
|---------|------|------|-------------|
| Title | Text | - | "Crear Empresa" |
| Subtitle | Text | - | "Paso 2/2 - Información de Empresa" |
| Company Name | Input | `Input Company Name` | "Nombre de la Empresa" |
| Business Type | Dropdown | `Dropdown Business Type` | "Tipo de Empresa" |
| Company Type | Dropdown | `Dropdown Company Type` | "Tipo de Cultivo" |
| Department | Dropdown | `Dropdown Department` | "Departamento" |
| Municipality | Dropdown | `Dropdown Municipality` | "Municipio" |
| Submit | Button | `Button Create Company` | "Crear Empresa" |

**Dropdown Configuration**:

**Business Type** (Manual):
- S.A.S
- S.A.
- Ltda
- E.U.
- Persona Natural

**Company Type** (Manual):
- cannabis → Display: Cannabis
- coffee → Display: Café
- cocoa → Display: Cacao
- flowers → Display: Flores
- mixed → Display: Mixto

**Department** (Dynamic):
- API: Get Departments
- Option caption: `division_1_name`

**Municipality** (Dynamic):
- API: Get Municipalities
- Parameter: `departmentCode` = Department's `division_1_code`
- Option caption: `division_2_name`

---

## Part 4: Custom States

Create these custom states to manage data between pages:

```
current_user_id (Text) - Store userId from Step 1
current_email (Text) - Store email from Step 1
current_company_id (Text) - Store companyId from Step 2
registration_token (Text) - Store verification token
```

---

## Part 5: Workflows

### Page: /signup-step-1

#### Workflow 1: Form Validation + Register User
**Trigger**: Button Register Step1 → clicked

**Validation**:
```
1. Email required and valid format
2. Password ≥ 8 chars with letter + number
3. First Name and Last Name required

If validation fails:
  → Show error message
  → Stop workflow
```

**Success Flow**:
```
1. Call: Register User Step 1
2. If success:
   - Save userId → current_user_id
   - Save email → current_email
   - Save token → registration_token (for testing)
   - Show success message
   - Navigate to /signup-verify-email
3. If error:
   - Show error message from API
```

---

### Page: /signup-verify-email

#### Workflow 1: Verify Email
**Trigger**: Button Verify Email → clicked

**Process**:
```
1. Get token from Input Verification Code
2. Call: Verify Email Token
3. If success:
   - Show "✓ Email verificado"
   - Wait 2 seconds
   - Navigate to /signup-step-2
4. If error:
   - Show error message
```

#### Workflow 2: Resend Email
**Trigger**: Link Resend Email → clicked

**Process**:
```
1. Call: Resend Verification Email (from Module 2)
2. If success:
   - Show "Email reenviado"
3. If error:
   - Show error (rate limit message if applicable)
```

---

### Page: /signup-step-2

#### Workflow 1: Department Selection
**Trigger**: Dropdown Department → value changed

**Action**:
```
1. Reset Municipality dropdown
2. Load municipalities (triggered automatically by dependency)
```

#### Workflow 2: Form Validation + Create Company
**Trigger**: Button Create Company → clicked

**Validation**:
```
1. Company Name required
2. Business Type selected
3. Company Type selected
4. Department selected
5. Municipality selected

If validation fails:
  → Show error message
  → Stop workflow
```

**Success Flow**:
```
1. Call: Register Company Step 2
   - userId: current_user_id
   - companyName: Input Company Name value
   - businessEntityType: Dropdown Business Type value
   - companyType: Dropdown Company Type value
   - country: "CO"
   - departmentCode: Dropdown Department value's division_1_code
   - municipalityCode: Dropdown Municipality value's division_2_code

2. If success:
   - Show success message
   - Save companyId → current_company_id
   - Wait 2 seconds
   - Navigate to /dashboard
3. If error:
   - Show error message
```

---

## Part 6: Styling & Responsiveness

### Color Palette
- **Primary**: `#10B981` (Green)
- **Background**: `#F9FAFB` (Light gray)
- **Text**: `#111827` (Dark gray/black)
- **Error**: `#EF4444` (Red)
- **Success**: `#10B981` (Green)

### Desktop View (Width > 768px)
- Container: 400-500px fixed width, centered
- Full width inputs with 12px margin

### Mobile View (Width ≤ 768px)
- Container: 90% width with padding
- Full width inputs
- Reduce heading to 24px

---

## Part 7: Testing Checklist

### Step 1 Testing
- [ ] Email validation shows error for invalid format
- [ ] Password validation shows error for <8 chars
- [ ] All required fields validation works
- [ ] Submit with valid data creates user
- [ ] Response contains userId and token
- [ ] Auto-navigate to verification page
- [ ] User data saved in custom state

### Step 2: Email Verification Testing
- [ ] Page displays correct email
- [ ] Paste token and verify works
- [ ] Success message shows
- [ ] Auto-navigate to Step 3 after 2 seconds
- [ ] Resend email works
- [ ] Rate limiting enforced (show error after 5 resends)

### Step 3: Company Creation Testing
- [ ] Department dropdown populated
- [ ] Department change filters municipalities
- [ ] All fields required validation works
- [ ] Submit creates company
- [ ] User linked to company
- [ ] Navigate to dashboard
- [ ] Email verification enforced (can't skip)

### Error Cases
- [ ] Duplicate email rejected in Step 1
- [ ] Invalid token in Step 2 shows error
- [ ] Expired token in Step 2 shows error
- [ ] Invalid location in Step 3 shows error

---

## Part 8: Go Live

### Pre-launch Checklist
- [ ] All 5 API calls configured correctly
- [ ] Convex deployment URL is production
- [ ] Database seeded (roles + geographic)
- [ ] All workflows tested
- [ ] Mobile responsiveness verified
- [ ] All text in Spanish
- [ ] Custom states working correctly

### Launch Steps
1. Set pages as public (not login-required)
2. Update index to redirect to `/signup-step-1` if not logged in
3. Test full flow end-to-end
4. Monitor Convex logs
5. Set up error tracking (optional)

---

## Troubleshooting

### Problem: Departments dropdown is empty
**Solution**:
- Verify Get Departments API call initialized
- Check Convex deployment URL
- Run `seedGeographic:seedColombianGeography`
- Re-initialize API call if needed

### Problem: "Email already registered" error on new email
**Solution**:
- Delete test users from Convex dashboard
- Ensure email is lowercase in database

### Problem: Registration fails with "Role not found"
**Solution**:
- Run `seedRoles:seedSystemRoles`
- Verify COMPANY_OWNER role exists

### Problem: Municipality dropdown doesn't filter
**Solution**:
- Check departmentCode parameter set correctly
- Verify Get Municipalities dependency on Department dropdown

### Problem: Email verification token invalid
**Solution**:
- Token expires in 24 hours - user must resend
- Can only use token once - already verified email
- Copy token exactly (32 characters)

---

## Important Notes

### Email Verification
- Token valid for 24 hours
- Token can only be used once
- Rate limiting: Max 5 resends, 5-min delay between
- Required before Step 2 (backend enforces)

### User Experience
- Clear progress indicators (Paso 1/2, Paso 2/2)
- Success messages encouraging next step
- Error messages specific and actionable
- Auto-navigation after verification

### Data Flow
- Step 1 → Custom states (userId, email, token)
- Step 2 → Custom state (companyId)
- Step 3 → Dashboard (user now fully registered)

---

## Related Documentation

- [TWO-STEP-REGISTRATION-GUIDE.md](TWO-STEP-REGISTRATION-GUIDE.md) - Quick reference
- [Module 1 README](../README.md) - Overview and database schema
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Parameter explanation

---

## Next Steps

After completing Module 1:

**Module 2: Email Service Integration**
- Configure email provider (SendGrid, Resend, etc.)
- Implement actual email sending
- Handle email bounces/failures

**Module 3: Subscription & Payments**
- Payment integration
- Plan selection
- Billing management

---

## Support Resources

- **Bubble Manual**: [https://manual.bubble.io](https://manual.bubble.io)
- **Convex Docs**: [https://docs.convex.dev](https://docs.convex.dev)
- **Alquemist Docs**: [../../README.md](../../README.md)

---

**Status**: ✅ Backend complete and tested
**Ready**: ✅ For Bubble implementation
**Estimated Time**: 2.5-3 hours to build all 3 pages + workflows
