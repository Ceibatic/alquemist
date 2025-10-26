# Two-Step Registration Guide - Bubble Implementation

**Complete guide for implementing the 2-step registration flow in Bubble**

---

## Overview

The registration process now has **3 phases**:

1. **Step 1: Personal Information** - Create user account
2. **Email Verification** - Verify email and unlock Step 2
3. **Step 2: Company Information** - Create company and complete onboarding

---

## Flow Diagram

```
┌─ Page: /signup-step-1 ────────────────────┐
│                                           │
│ [Paso 1/2] Información Personal           │
│                                           │
│ Email: [____________]                    │
│ Password: [____________]                 │
│ Name: [____] [____]                      │
│ Phone: [____________]                    │
│                                           │
│         [Crear Cuenta]                    │
│                                           │
│ Success:                                  │
│ → Navigate to /signup-verify-email       │
│                                           │
│ Error:                                    │
│ → Show message, stay on page             │
│                                           │
└───────────────────────────────────────────┘
               ↓ Success
┌─ Page: /signup-verify-email ───────────────┐
│                                            │
│ ✉️ Email de Verificación Enviado           │
│                                            │
│ Hemos enviado un enlace a:                 │
│ user@example.com                           │
│                                            │
│ [Opción 1] Click en el enlace del email   │
│                                            │
│ [Opción 2] Pega el código:                │
│ Código: [______________] [Verificar]      │
│                                            │
│ [Reenviar Email]                           │
│                                            │
│ Success:                                   │
│ → Auto-navigate to /signup-step-2        │
│                                            │
│ (Keep userId in custom state)              │
│                                            │
└────────────────────────────────────────────┘
               ↓ Email Verified
┌─ Page: /signup-step-2 ────────────────────┐
│                                           │
│ [Paso 2/2] Información de Empresa         │
│                                           │
│ Empresa: [____________]                  │
│ Tipo: [S.A.S ▼]                          │
│ Cultivo: [Cannabis ▼]                    │
│ Depto: [Antioquia ▼]                     │
│ Mpio: [Medellín ▼]                       │
│                                           │
│        [Crear Empresa]                    │
│                                           │
│ Success:                                  │
│ → Navigate to /dashboard                 │
│                                           │
│ Error:                                    │
│ → Show message, stay on page             │
│                                           │
└───────────────────────────────────────────┘
               ↓ Complete
            DASHBOARD
          (Logged in)
```

---

## Part 1: API Connector Setup

### Configure Base URL

In Bubble's **Plugins** → **API Connector**:

**API Name**: `Convex`
**Base URL**: `https://exciting-shrimp-34.convex.site`
**Headers**: `Content-Type: application/json`

(Replace `exciting-shrimp-34` with your deployment ID)

---

## Part 2: Create 3 API Calls

### API Call 1: Register Step 1

**Name**: `Register User Step 1`
**Method**: `POST`
**Endpoint**: `/registration/register-step-1`

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
- phone: **Uncheck** ☐ (optional)
- Everything else: **Uncheck** ☐

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

### API Call 2: Verify Email

**Name**: `Verify Email Token`
**Method**: `POST`
**Endpoint**: `/registration/verify-email`

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
**Method**: `POST`
**Endpoint**: `/registration/register-step-2`

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
- country: **Keep Private** ✓
- Everything else: **Uncheck** ☐

**Expected Response**:
```json
{
  "success": true,
  "userId": "n976j2dyzskxa97mjthe4endts7t6gvx",
  "companyId": "jn7ea3r18m5ssd368qjve67ke97t6bpe",
  "organizationId": "org_test_1761514959078_anx8cl",
  "message": "¡Bienvenido! Tu empresa ha sido creada exitosamente."
}
```

---

## Part 3: Build Pages

Create 3 new pages in Bubble:
- `/signup-step-1` - Personal information
- `/signup-verify-email` - Email verification
- `/signup-step-2` - Company information

---

## Part 4: Workflows

### Step 1 Workflows
1. Email validation (real-time)
2. Form validation (on submit)
3. Register API call
4. Success/error handling
5. Navigate to verification page

### Step 2 Workflows
1. Department selection handling
2. Municipality filtering
3. Form validation
4. Verify email token
5. Auto-navigate to Step 3

### Step 3 Workflows
1. Department selection handling
2. Municipality filtering
3. Form validation
4. Create company API call
5. Navigate to dashboard

---

## Testing Results

✅ **Step 1 Test**
```
POST /registration/register-step-1
Input: email, password, firstName, lastName, phone
Output: userId, token ✓
```

✅ **Step 2 Test**
```
POST /registration/verify-email
Input: token
Output: success, userId ✓
```

✅ **Step 3 Test**
```
POST /registration/register-step-2
Input: userId, company info, location
Output: companyId, organizationId ✓
```

---

## All Backend Ready

✅ Database schema updated
✅ Email verification tokens table created
✅ User registration split into 2 steps
✅ Company creation separated
✅ HTTP endpoints tested
✅ All validations working

**Next**: Build the 3 Bubble pages following this guide.

---

**For detailed implementation**, see original Module 1 documentation in `docs/module-1/bubble/`.
