# Bubble Setup Summary - Module 1

**Complete setup instructions for your registration form**

---

## Before You Start

✅ Verify you have:
- Bubble account created
- API Connector plugin installed (free)
- Your Convex deployment ID: `exciting-shrimp-34` (or yours)

---

## Part 1: Configure API Connector (5 minutes)

### 1.1 Add Convex API

Go to **Plugins** → **API Connector** → **Add another API**

**Settings:**
- **API Name**: `Convex`
- **Base URL**: `https://exciting-shrimp-34.convex.site`
- **Authentication**: `None` (for now)
- **Headers**: `Content-Type: application/json`

Click **Save**

---

## Part 2: Create 4 API Calls (15 minutes)

### 2.1 Get Departments

**Name**: `Get Departments`
**Method**: `POST`
**Endpoint**: `/geographic/departments`

**Body:**
```json
{
  "countryCode": "CO"
}
```

**Private Settings:**
- `countryCode` → Keep Private ✓

**Test**: Click Initialize → Should return 10 departments

---

### 2.2 Get Municipalities

**Name**: `Get Municipalities`
**Method**: `POST`
**Endpoint**: `/geographic/municipalities`

**Body:**
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

**Private Settings:**
- `countryCode` → Keep Private ✓
- `departmentCode` → **Uncheck** ☐

**Test**: Click Initialize, enter `"05"` → Should return 3 municipalities for Antioquia

---

### 2.3 Check Email

**Name**: `Check Email`
**Method**: `POST`
**Endpoint**: `/registration/check-email`

**Body:**
```json
{
  "email": "<email>"
}
```

**Private Settings:**
- `email` → **Uncheck** ☐

**Test**: Click Initialize, enter `"test@example.com"` → Should return `{"available": true}`

---

### 2.4 Register User

**Name**: `Register User`
**Method**: `POST`
**Endpoint**: `/registration/register`

**Body:**
```json
{
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>",
  "companyName": "<companyName>",
  "businessEntityType": "<businessEntityType>",
  "companyType": "<companyType>",
  "country": "CO",
  "departmentCode": "<departmentCode>",
  "municipalityCode": "<municipalityCode>"
}
```

**Private Settings:**
- `country` → Keep Private ✓
- **Everything else** → **Uncheck** ☐

**Test**: Click Initialize with:
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "3001234567",
  "companyName": "Test Company",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

Should return: `{"success": true, "userId": "...", ...}`

---

## Part 3: Build Registration Page (1-2 hours)

### 3.1 Create Page

**Page Name**: `signup`

### 3.2 Create Form Container

**Group**: `Group Registration Container`
- Width: 400px
- Center alignment
- White background
- Padding: 32px

### 3.3 Add Form Elements

Inside the container, add in this order:

| Element | Type | Name | Value/Placeholder |
|---------|------|------|-------------------|
| Title | Text | - | "Crear Cuenta" |
| Subtitle | Text | - | "Completa el formulario para comenzar" |
| First Name | Input | `Input First Name` | "Nombre" |
| Last Name | Input | `Input Last Name` | "Apellido" |
| Email | Input | `Input Email` | "Correo Electrónico" |
| Password | Input | `Input Password` | "Contraseña (mín. 8)" |
| Phone (opt) | Input | `Input Phone` | "Teléfono (opcional)" |
| Company Name | Input | `Input Company Name` | "Nombre de la Empresa" |
| Business Type | Dropdown | `Dropdown Business Type` | Options: S.A.S, S.A., Ltda, E.U., Persona Natural |
| Company Type | Dropdown | `Dropdown Company Type` | Options: Cannabis, Café, Cacao, Flores, Mixto |
| Department | Dropdown | `Dropdown Department` | Data: Get Departments API |
| Municipality | Dropdown | `Dropdown Municipality` | Data: Get Municipalities API (filtered by department) |
| Register Button | Button | `Button Register` | "Registrar" |

---

### 3.4 Configure Dropdowns

**Department Dropdown:**
1. Go to properties
2. **Type of choices**: Dynamic
3. **Data source**: Convex - Get Departments
4. **Option caption**: `division_1_name`
5. **Make searchable**: Yes

**Municipality Dropdown:**
1. Go to properties
2. **Type of choices**: Dynamic
3. **Data source**: Convex - Get Municipalities
4. **Params**:
   - `countryCode`: "CO"
   - `departmentCode`: Dropdown Department's value's `division_1_code`
5. **Option caption**: `division_2_name`
6. **Visible when**: `Dropdown Department is not empty`
7. **Make searchable**: Yes

---

## Part 4: Add Workflows (30 minutes)

### 4.1 Real-time Email Validation

**Trigger**: Input Email → value changed (with 500ms delay)

**Condition**: `Input Email is valid email`

**Actions:**
1. Call Check Email API
2. If available = true: Show green checkmark
3. If available = false: Show "Email already registered" error

---

### 4.2 Form Validation Workflow

**Trigger**: Button Register → clicked

**Validation Checks** (stop workflow if any fail):
- [ ] All required fields are filled
- [ ] Email format is valid
- [ ] Password length ≥ 8
- [ ] Password contains letter + number
- [ ] Department selected
- [ ] Municipality selected

**Error Actions**:
- Show "Please complete all required fields" if any fail

---

### 4.3 Registration Workflow

**Trigger**: Button Register → clicked (after validation passes)

**Action 1**: Call Register User API

**Parameters**:
- `email`: Input Email's value
- `password`: Input Password's value
- `firstName`: Input First Name's value
- `lastName`: Input Last Name's value
- `phone`: Input Phone's value
- `companyName`: Input Company Name's value
- `businessEntityType`: Dropdown Business Type's value
- `companyType`: Dropdown Company Type's value
- `country`: "CO"
- `departmentCode`: Dropdown Department's value's `division_1_code`
- `municipalityCode`: Dropdown Municipality's value's `division_2_code`

**Action 2**: If success
- Show success message
- Navigate to `/email-verification` page
- Pass email as parameter: `email=` Input Email's value

**Action 3**: If error
- Show error message: Result of API's error message

---

## Part 5: Test (30 minutes)

### Functional Tests

- [ ] Load page → Departments dropdown shows 10 departments
- [ ] Select department → Municipality dropdown shows municipalities
- [ ] Change department → Municipality options update
- [ ] Type email → Validation shows available/unavailable
- [ ] Fill form → All validations work
- [ ] Submit → User created successfully
- [ ] Success → Redirects to email verification page

### Data Verification

- [ ] Check Convex dashboard: New user created
- [ ] Check user record: Email, name, phone correct
- [ ] Check company record: Company name, type correct
- [ ] Check role: User has COMPANY_OWNER role

---

## Troubleshooting

### Departments dropdown empty

- [ ] Check base URL is `.convex.site` (NOT `.convex.cloud`)
- [ ] Check "Get Departments" API is initialized successfully
- [ ] Verify deployment ID matches your `.env.local`
- [ ] Check Convex dashboard: `geographic_locations` table has data

### Municipality dropdown not filtering

- [ ] Check departmentCode parameter is set to: `Dropdown Department's value's division_1_code`
- [ ] Verify "Get Municipalities" API accepts departmentCode parameter
- [ ] Test API directly: Initialize with departmentCode = "05"

### Registration fails with "Role not found"

- [ ] Run in Convex: `npx convex run seedRoles:seedSystemRoles`
- [ ] Check database: `roles` table has COMPANY_OWNER role

### Email validation not working

- [ ] Check "Check Email" API is initialized
- [ ] Verify API returns `{"available": true/false}`
- [ ] Add 500ms delay before API call

---

## Next Steps

After Bubble form is complete:

1. **Test registration flow** end-to-end
2. **Create email verification page** (Module 2)
3. **Setup email service** (SendGrid, Resend, etc.)
4. **Deploy to production**

---

## Resources

- **Detailed Guide**: [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md)
- **Parameter Explanation**: [PARAMETER-GUIDE.md](PARAMETER-GUIDE.md)
- **Quick Reference**: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- **API Reference**: [../README.md](../README.md)

---

## Quick Commands

Get your deployment ID:
```bash
cat .env.local | grep CONVEX_URL
# Output: https://[your-deployment].convex.cloud
# Use: [your-deployment].convex.site for Bubble
```

Test endpoint health:
```bash
curl https://[your-deployment].convex.site/health
```

---

## Time Estimate

- API Connector Setup: **5 minutes**
- API Calls Creation: **15 minutes**
- Form Building: **60-90 minutes**
- Workflows: **30 minutes**
- Testing: **30 minutes**

**Total: 2-3 hours**

Good luck! 🚀
