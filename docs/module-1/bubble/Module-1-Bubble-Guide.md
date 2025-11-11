# Module 1: Registration with Email Verification - Bubble Guide

**Quick implementation guide for 3-phase registration with email verification in Bubble.io**

---

## 🎯 What You'll Build

A 3-phase registration flow:
1. **Personal Info** → User creates account
2. **Email Verification** → User verifies email with token
3. **Company Setup** → User creates company profile

**Backend:** Convex API
**Frontend:** Bubble.io
**Email:** Resend
**Auth:** Clerk (optional for auto-login)

---

## ✅ Prerequisites Checklist

Before starting, ensure:

- [ ] Backend seeded: `npx convex run seedRoles:seedSystemRoles`
- [ ] Geographic data: `npx convex run seedGeographic:seedColombianGeography`
- [ ] Environment variables deployed to Convex:
  ```bash
  npx convex env set CLERK_SECRET_KEY sk_xxx
  npx convex env set RESEND_API_KEY re_xxx
  npx convex env set BUBBLE_APP_URL https://your-app.bubbleapps.io
  ```
- [ ] Resend domain verified at https://resend.com/domains
- [ ] Bubble account created

**API Base URL:** `https://exciting-shrimp-34.convex.site`

---

## 📡 API Reference

### Endpoint 1: Register User

**POST** `/registration/register-step-1`

```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "3001234567"
}

// Response (Success)
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "email": "user@example.com",
  "token": "32charToken...",
  "message": "Cuenta creada. Por favor verifica tu correo."
}
```

**Validations:**
- Email: Valid format, unique
- Password: Min 8 chars, 1 letter + 1 number
- firstName/lastName: Required

---

### Endpoint 2: Verify Email

**POST** `/registration/verify-email`

```json
// Request
{
  "token": "32charToken..."
}

// Response (Success)
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "message": "¡Email verificado exitosamente!"
}
```

**Token:**
- 32 characters, case-sensitive
- Valid for 24 hours
- Single-use only

---

### Endpoint 3: Create Company

**POST** `/registration/register-step-2`

```json
// Request
{
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "companyName": "Mi Empresa S.A.S",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}

// Response (Success)
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "companyId": "jn7ea3r18m5ssd368qjve67ke97t6bpe",
  "organizationId": "org_xxx",
  "message": "¡Bienvenido! Tu empresa ha sido creada."
}
```

**Business Entity Types:** S.A.S, S.A., Ltda, E.U., Persona Natural
**Company Types:** cannabis, coffee, cocoa, flowers, mixed

---

### Endpoint 4: Get Departments

**POST** `/geographic/departments`

```json
// Request
{
  "countryCode": "CO"
}

// Response
[
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  }
]
```

---

### Endpoint 5: Get Municipalities

**POST** `/geographic/municipalities`

```json
// Request
{
  "countryCode": "CO",
  "departmentCode": "05"
}

// Response
[
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05"
  }
]
```

---

## 🛠️ Part 1: Setup API Connector

### Step 1.1: Install Plugin

1. Bubble Editor → **Plugins** tab
2. Click **Add plugins**
3. Search "API Connector"
4. Click **Install**

### Step 1.2: Configure Base API

1. Open **Plugins** → **API Connector**
2. Click **Add another API**

**Settings:**
```
Name: Convex
Authentication: None
Shared Headers:
  Content-Type: application/json

Server URL:
  Development: https://exciting-shrimp-34.convex.site
  Production: https://exciting-shrimp-34.convex.site
```

Click **Save**.

---

## 🔌 Part 2: Create API Calls

### API Call 1: RegisterUser

**Settings:**
- Name: `RegisterUser`
- Use as: `Action`
- Method: `POST`
- URL: `https://exciting-shrimp-34.convex.site/registration/register-step-1`

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

**Parameters:** All dynamic (unchecked)

**Test Values:**
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "3001234567"
}
```

Click **Initialize call**.

---

### API Call 2: VerifyEmail

**Settings:**
- Name: `VerifyEmail`
- Use as: `Action`
- Method: `POST`
- URL: `https://exciting-shrimp-34.convex.site/registration/verify-email`

**Body (JSON):**
```json
{
  "token": "<token>"
}
```

**Parameters:** All dynamic

**Test Values:**
```json
{
  "token": "testToken123456789012345678901"
}
```

Click **Initialize call**.

---

### API Call 3: CreateCompany

**Settings:**
- Name: `CreateCompany`
- Use as: `Action`
- Method: `POST`
- URL: `https://exciting-shrimp-34.convex.site/registration/register-step-2`

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

**Parameters:**
- `country`: ✅ Private (always "CO")
- All others: ☐ Dynamic

**Test Values:**
```json
{
  "userId": "testUserId123",
  "companyName": "Test Company",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}
```

Click **Initialize call**.

---

### API Call 4: GetDepartments

**Settings:**
- Name: `GetDepartments`
- Use as: `Data`
- Method: `POST`
- URL: `https://exciting-shrimp-34.convex.site/geographic/departments`

**Body (JSON):**
```json
{
  "countryCode": "CO"
}
```

**Parameters:**
- `countryCode`: ✅ Private (always "CO")

Click **Initialize call**.

---

### API Call 5: GetMunicipalities

**Settings:**
- Name: `GetMunicipalities`
- Use as: `Data`
- Method: `POST`
- URL: `https://exciting-shrimp-34.convex.site/geographic/municipalities`

**Body (JSON):**
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

**Parameters:**
- `countryCode`: ✅ Private (always "CO")
- `departmentCode`: ☐ Dynamic

**Test Values:**
```json
{
  "countryCode": "CO",
  "departmentCode": "05"
}
```

Click **Initialize call**.

---

## 📄 Part 3: Build Pages

### Page 1: signup-step-1 (User Registration)

**URL:** `/signup-step-1`

**Elements:**

| Element Name | Type | Placeholder/Options |
|-------------|------|-------------------|
| title | Text | "Crear Cuenta" |
| subtitle | Text | "Paso 1 de 3: Información Personal" |
| input_email | Input (email) | "Correo Electrónico" |
| input_password | Input (password) | "Contraseña (mín. 8 caracteres)" |
| input_firstName | Input (text) | "Nombre" |
| input_lastName | Input (text) | "Apellido" |
| input_phone | Input (text) | "Teléfono (opcional)" |
| text_error | Text | (hidden, red text) |
| text_success | Text | (hidden, green text) |
| btn_register | Button | "Crear Cuenta" |

**Custom States:**
```
None required - we'll pass data via URL parameters
```

---

### Page 2: signup-step-2 (Email Verification)

**URL:** `/signup-step-2`

**Elements:**

| Element Name | Type | Placeholder |
|-------------|------|------------|
| title | Text | "Verificar Email" |
| subtitle | Text | "Revisa tu correo: [email]" |
| input_token | Input (text) | "Código de verificación" |
| text_error | Text | (hidden, red) |
| text_success | Text | (hidden, green) |
| btn_verify | Button | "Verificar" |
| link_resend | Link | "Reenviar código" |

**Custom States:**
```
None required - token is input directly by user
```

---

### Page 3: signup-step-3 (Company Setup)

**URL:** `/signup-step-3`

**Elements:**

| Element Name | Type | Options/Source |
|-------------|------|---------------|
| title | Text | "Crear Empresa" |
| subtitle | Text | "Paso 3 de 3: Información de Empresa" |
| input_companyName | Input (text) | "Nombre de la Empresa" |
| dropdown_businessType | Dropdown | Static: S.A.S, S.A., Ltda, E.U., Persona Natural |
| dropdown_companyType | Dropdown | Static: cannabis, coffee, cocoa, flowers, mixed |
| dropdown_department | Dropdown | Dynamic: GetDepartments |
| dropdown_municipality | Dropdown | Dynamic: GetMunicipalities |
| text_error | Text | (hidden, red) |
| text_success | Text | (hidden, green) |
| btn_create | Button | "Crear Empresa y Continuar" |

**Custom States:**
```
None required - dropdown values used directly in API call
```

**Configure Dropdowns:**

**dropdown_department:**
- Choices style: Dynamic choices
- Type of choices: Get data from external API
- Data source: `GetDepartments`
- Option caption: `division_1_name`
- Option value: `division_1_code`

**dropdown_municipality:**
- Choices style: Dynamic choices
- Type of choices: Get data from external API
- Data source: `GetMunicipalities` with parameters:
  - departmentCode = `dropdown_department's value`
- Option caption: `division_2_name`
- Option value: `division_2_code`

---

## ⚡ Part 4: Build Workflows

### Workflow 1: Register User (Page 1)

**Event:** When btn_register is clicked

**Step 1: Validate Inputs**
```
Condition: input_email is empty OR
           input_password is empty OR
           input_firstName is empty OR
           input_lastName is empty

Action: Show text_error
Set text: "Por favor completa todos los campos"
Stop workflow
```

**Step 2: Call API**
```
Action: Plugins → Convex - RegisterUser

Parameters:
  email = input_email's value
  password = input_password's value
  firstName = input_firstName's value
  lastName = input_lastName's value
  phone = input_phone's value
```

**Step 3: Handle Success**
```
Only when: RegisterUser's success is "yes"

Action 1: Show text_success
Action 2: Set text = "¡Cuenta creada! Verifica tu correo"
Action 3: Navigate to page signup-step-2
  Send more parameters to page:
    userId = RegisterUser's userId
    userEmail = RegisterUser's email
```

**Step 4: Handle Error**
```
Only when: RegisterUser's success is "no"

Action 1: Show text_error
Action 2: Set text = RegisterUser's error
```

---

### Workflow 2: Verify Email (Page 2)

**Page Load Event:**
```
Action: Set text subtitle = "Revisa tu correo: " & Get userEmail from page URL
```

**Event:** When btn_verify is clicked

**Step 1: Validate Token**
```
Condition: input_token is empty

Action: Show text_error
Set text: "Por favor ingresa el código"
Stop workflow
```

**Step 2: Call API**
```
Action: Plugins → Convex - VerifyEmail

Parameters:
  token = input_token's value
```

**Step 3: Handle Success**
```
Only when: VerifyEmail's success is "yes"

Action 1: Show text_success
Action 2: Set text = "¡Email verificado!"
Action 3: Navigate to page signup-step-3
  Send parameters:
    userId = Get userId from page URL
```

**Step 4: Handle Error**
```
Only when: VerifyEmail's success is "no"

Action 1: Show text_error
Action 2: Set text = VerifyEmail's error
```

---

### Workflow 3: Load Departments (Page 3)

**Event:** When page is loaded

**No workflow needed** - the dropdown is configured to automatically load data from GetDepartments API.

---

### Workflow 4: Load Municipalities (Page 3)

**Event:** When dropdown_department's value is changed

**No workflow needed** - dropdown_municipality is configured to reload automatically when dropdown_department changes (because it uses `dropdown_department's value` as a parameter).

Optional: Add this if you want to reset the municipality when department changes:
```
Action: Reset element dropdown_municipality
```

---

### Workflow 5: Create Company (Page 3)

**Event:** When btn_create is clicked

**Step 1: Validate Inputs**
```
Condition: input_companyName is empty OR
           dropdown_businessType is empty OR
           dropdown_companyType is empty OR
           dropdown_department is empty OR
           dropdown_municipality is empty

Action: Show text_error
Set text: "Por favor completa todos los campos"
Stop workflow
```

**Step 2: Call API**
```
Action: Plugins → Convex - CreateCompany

Parameters:
  userId = Get data from page URL 'userId'
  companyName = input_companyName's value
  businessEntityType = dropdown_businessType's value
  companyType = dropdown_companyType's value
  country = "CO" (private parameter)
  departmentCode = dropdown_department's value
  municipalityCode = dropdown_municipality's value
```

**Step 3: Handle Success**
```
Only when: CreateCompany's success is "yes"

Action 1: Show text_success
Action 2: Set text = "¡Empresa creada exitosamente!"
Action 3: Navigate to page dashboard (or homepage)
  (User is now registered and company is created)
```

**Step 4: Handle Error**
```
Only when: CreateCompany's success is "no"

Action 1: Show text_error
Action 2: Set text = CreateCompany's error
```

---

## 🎨 Part 5: Styling Tips

### Visual Hierarchy
```
Page Container:
  - Max width: 500px
  - Center aligned
  - Padding: 40px

Title:
  - Font size: 28px
  - Weight: Bold
  - Color: #333

Subtitle:
  - Font size: 16px
  - Color: #666
  - Margin bottom: 30px

Inputs:
  - Height: 45px
  - Border radius: 5px
  - Border: 1px solid #ddd
  - Margin bottom: 15px

Button:
  - Height: 50px
  - Background: #667eea (purple)
  - Color: white
  - Border radius: 5px
  - Full width

Error Text:
  - Color: #e53e3e (red)
  - Font size: 14px

Success Text:
  - Color: #38a169 (green)
  - Font size: 14px
```

---

## 🧪 Part 6: Testing Flow

### Test Registration Flow

**Step 1: Open signup-step-1**
- Enter: email, password, name
- Click "Crear Cuenta"
- Expected: Success message → Navigate to step 2

**Step 2: Check Email**
- Open email inbox
- Find email from `noreply@ceibatic.com`
- Copy verification token

**Step 3: Verify Email (signup-step-2)**
- Paste token
- Click "Verificar"
- Expected: Success → Navigate to step 3

**Step 4: Create Company (signup-step-3)**
- Select department → municipalities load
- Select municipality
- Enter company details
- Click "Crear Empresa"
- Expected: Success → Navigate to dashboard

---

## 🐛 Troubleshooting

### API returns 404
- Check URL: `https://exciting-shrimp-34.convex.site/...`
- Verify endpoint path spelling
- Test in browser/Postman first

### Email not received
- Check spam folder
- Verify domain in Resend dashboard
- Check `RESEND_API_KEY` in Convex env

### Dropdown empty
- Check GetDepartments initialized correctly
- View browser console for API errors
- Verify backend seeded: `npx convex run seedGeographic:seedColombianGeography`

### Token invalid
- Token expires in 24 hours
- Token is single-use
- Check token copied correctly (no spaces)

### Parameters not passing between pages
- Check "Send more parameters to page" in Navigation action
- Verify receiving page has matching custom states
- Use "Get data from page URL" to retrieve

---

## 📋 Checklist: Implementation Complete

- [ ] API Connector installed
- [ ] All 5 API calls created and initialized
- [ ] Page 1 (signup-step-1) created with elements
- [ ] Page 2 (signup-step-2) created with elements
- [ ] Page 3 (signup-step-3) created with elements and dropdown configuration
- [ ] Workflow 1: Register user (working)
- [ ] Workflow 2: Verify email (working)
- [ ] Workflow 3-4: Dropdown setup (automatic)
- [ ] Workflow 5: Create company (working)
- [ ] Test flow completed successfully
- [ ] Error handling tested
- [ ] Styling applied

---

## 🚀 Next Steps

After Module 1 is complete:
- **Module 3:** Subscription & Payments
- **Module 5:** Facility Management
- **Module 6:** Cultivation Cycles

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or review API responses in Bubble's debugger.

**Estimated Implementation Time:** 2-3 hours
