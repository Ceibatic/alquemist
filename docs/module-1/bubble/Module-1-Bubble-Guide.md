# Module 1: Bubble Implementation Guide

**Complete step-by-step guide for implementing user registration in Bubble**

---

## Prerequisites

Before starting:

1. ✅ Convex database seeded with:
   - System roles (`seedRoles:seedSystemRoles`)
   - Geographic data (`seedGeographic:seedColombianGeography`)
2. ✅ Convex deployment URL available
3. ✅ Bubble account created
4. ✅ Basic familiarity with Bubble editor

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

**Authentication**: `None` (we'll handle this later when adding Clerk)

**Shared Headers**:
```
Content-Type: application/json
```

**Server URLs**:
- Development: `https://[your-deployment].convex.site`
- Production: `https://[your-deployment].convex.site`

Replace `[your-deployment]` with your actual Convex deployment ID from the Convex dashboard.

**Important**: Use `.convex.site` (NOT `.convex.cloud`) for HTTP actions. The `.cloud` domain is for WebSocket connections only.

---

## Part 2: Create API Calls

### Step 2.1: Get Departments API Call

In API Connector, add new call:

**Call Name**: `Get Departments`
**Use as**: `Data` (to fetch data)
**Data type**: `JSON`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/geographic/departments`

**Body**:
```json
{
  "countryCode": "CO"
}
```

Click **Initialize call** to test.

**Expected Response**:
```json
[
  {
    "_id": "...",
    "_creationTime": 1234567890,
    "country_code": "CO",
    "country_name": "Colombia",
    "administrative_level": 1,
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota",
    "is_active": true,
    "created_at": 1234567890
  }
]
```

After initialization, Bubble will parse the response structure. Verify it shows the fields above.

### Step 2.2: Get Municipalities API Call

**Call Name**: `Get Municipalities`
**Use as**: `Data`
**Data type**: `JSON`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/geographic/municipalities`

**Body**:
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

Mark `<departmentCode>` as **private** (uncheck "private" in the parameter list to make it dynamic).

Click **Initialize call** with a test value like `"05"` for Antioquia.

### Step 2.3: Check Email Availability API Call

**Call Name**: `Check Email`
**Use as**: `Data`
**Data type**: `JSON`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/registration/check-email`

**Body**:
```json
{
  "email": "<email>"
}
```

Mark `<email>` as private/dynamic.

### Step 2.4: Register User API Call

**Call Name**: `Register User`
**Use as**: `Action` (modifies data)
**Data type**: `JSON`
**Method**: `POST`
**URL**: `https://[your-deployment].convex.site/registration/register`

**Body**:
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

Mark all `<parameters>` as private/dynamic except `"country": "CO"` (leave as static for now).

Click **Initialize call** with test data:
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

---

## Part 3: Build Registration Page

### Step 3.1: Create New Page

1. Go to **Design** tab
2. Create new page: `signup`
3. Set page width: `1200px` (or responsive)
4. Set background color: Light gray or white

### Step 3.2: Add Container Group

1. Add **Group** element
2. Name: `Group Registration Container`
3. Style:
   - Width: `400px` (fixed) or `80%` (responsive, max-width 400px)
   - Horizontal alignment: Center
   - Background: White
   - Border radius: `8px`
   - Padding: `32px`
   - Shadow: Yes (subtle)

### Step 3.3: Add Form Elements

Inside the container group, add elements in this order:

#### 3.3.1 Header Text
- **Element**: Text
- **Content**: `"Crear Cuenta"`
- **Style**: Heading 1, Bold, 28px
- **Margin bottom**: 8px

#### 3.3.2 Subheader Text
- **Element**: Text
- **Content**: `"Completa el formulario para comenzar"`
- **Style**: Paragraph, 14px, Gray
- **Margin bottom**: 24px

#### 3.3.3 Personal Information Section

**Section Label**:
- **Text**: `"Información Personal"`
- **Style**: Bold, 16px
- **Margin bottom**: 12px

**First Name Input**:
- **Element**: Input
- **Name**: `Input First Name`
- **Placeholder**: `"Nombre"`
- **Type**: Text
- **Margin bottom**: 12px

**Last Name Input**:
- **Element**: Input
- **Name**: `Input Last Name`
- **Placeholder**: `"Apellido"`
- **Type**: Text
- **Margin bottom**: 12px

**Email Input**:
- **Element**: Input
- **Name**: `Input Email`
- **Placeholder**: `"Correo Electrónico"`
- **Type**: Email
- **Margin bottom**: 12px

**Password Input**:
- **Element**: Input
- **Name**: `Input Password`
- **Placeholder**: `"Contraseña (mín. 8 caracteres)"`
- **Type**: Password
- **Margin bottom**: 12px

**Phone Input** (Optional):
- **Element**: Input
- **Name**: `Input Phone`
- **Placeholder**: `"Teléfono (opcional)"`
- **Type**: Text
- **Margin bottom**: 24px

#### 3.3.4 Company Information Section

**Section Label**:
- **Text**: `"Información de la Empresa"`
- **Style**: Bold, 16px
- **Margin bottom**: 12px

**Company Name Input**:
- **Element**: Input
- **Name**: `Input Company Name`
- **Placeholder**: `"Nombre de la Empresa"`
- **Type**: Text
- **Margin bottom**: 12px

**Business Entity Type Dropdown**:
- **Element**: Dropdown
- **Name**: `Dropdown Business Type`
- **Choices**: Manual entry
  - `S.A.S`
  - `S.A.`
  - `Ltda`
  - `E.U.`
  - `Persona Natural`
- **Default**: `S.A.S`
- **Placeholder**: `"Tipo de Empresa"`
- **Margin bottom**: 12px

**Company Type Dropdown**:
- **Element**: Dropdown
- **Name**: `Dropdown Company Type`
- **Choices**: Manual entry
  - `cannabis` - Display: `Cannabis`
  - `coffee` - Display: `Café`
  - `cocoa` - Display: `Cacao`
  - `flowers` - Display: `Flores`
  - `mixed` - Display: `Mixto`
- **Placeholder**: `"Tipo de Cultivo"`
- **Margin bottom**: 24px

#### 3.3.5 Location Section

**Section Label**:
- **Text**: `"Ubicación"`
- **Style**: Bold, 16px
- **Margin bottom**: 12px

**Department Dropdown**:
- **Element**: Dropdown
- **Name**: `Dropdown Department`
- **Choices style**: Dynamic choices
- **Type of choices**: Convex Get Departments
- **Option caption**: `division_1_name` (this is what users see)
- **Placeholder**: `"Departamento"`
- **Margin bottom**: 12px

To configure:
1. Click on dropdown
2. In property editor, set **Choices style** to "Dynamic"
3. Click **Get data from an external API**
4. Select: `Convex - Get Departments`
5. Set **Option caption** to `division_1_name`
6. The dropdown will now display department names

**Municipality Dropdown**:
- **Element**: Dropdown
- **Name**: `Dropdown Municipality`
- **Choices style**: Dynamic choices
- **Type of choices**: Convex Get Municipalities
  - Set `departmentCode` parameter to: `Dropdown Department's value's division_1_code`
- **Option caption**: `division_2_name`
- **Placeholder**: `"Municipio"`
- **This element is visible**: `Dropdown Department is not empty`
- **Margin bottom**: 24px

#### 3.3.6 Submit Button

- **Element**: Button
- **Name**: `Button Register`
- **Label**: `"Registrar"`
- **Style**: Primary button, full width
- **Background**: Green (`#10B981` or similar)
- **Padding**: `12px`
- **Margin bottom**: 16px

#### 3.3.7 Login Link

- **Element**: Text
- **Content**: `"¿Ya tienes cuenta? "`
- **Link**: Add "Iniciar sesión" text with link to `/login` page
- **Alignment**: Center
- **Style**: 14px

---

## Part 4: Add Workflows

### Step 4.1: Form Validation Workflow

Create workflow on **Button Register** → `When clicked`

**Actions**:

1. **Action**: Show message (if validation fails)
   - **Condition**: `Input Email is empty` OR `Input Password is empty` OR ... (check all required fields)
   - **Message**: `"Por favor completa todos los campos requeridos"`
   - **Style**: Error (red)

2. **Action**: Show message (password too short)
   - **Condition**: `Input Password:count characters < 8`
   - **Message**: `"La contraseña debe tener al menos 8 caracteres"`
   - **Style**: Error

3. **Action**: Show message (invalid email)
   - **Condition**: `Input Email is invalid email`
   - **Message**: `"Formato de correo electrónico inválido"`
   - **Style**: Error

Add a terminating condition after each validation that stops the workflow if validation fails.

### Step 4.2: Registration Workflow

Continue the workflow (after validation passes):

**Action 1**: Call Convex Register API
- **API**: Convex - Register User
- **Parameters**:
  - `email`: `Input Email's value`
  - `password`: `Input Password's value`
  - `firstName`: `Input First Name's value`
  - `lastName`: `Input Last Name's value`
  - `phone`: `Input Phone's value` (can be empty)
  - `companyName`: `Input Company Name's value`
  - `businessEntityType`: `Dropdown Business Type's value`
  - `companyType`: `Dropdown Company Type's value`
  - `departmentCode`: `Dropdown Department's value's division_1_code`
  - `municipalityCode`: `Dropdown Municipality's value's division_2_code`

**Action 2**: Show success message
- **Condition**: `Result of step 1's success is "yes"`
- **Message**: `Result of step 1's message`
- **Style**: Success (green)

**Action 3**: Navigate to email verification page
- **Condition**: `Result of step 1's success is "yes"`
- **Destination**: `/email-verification` (Module 2)
- **Send more parameters**:
  - `email`: `Input Email's value`

**Action 4**: Show error message (if registration fails)
- **Condition**: `Result of step 1's success is not "yes"`
- **Message**: `Result of step 1's error`
- **Style**: Error (red)

---

## Part 5: Add Real-time Email Validation

Create workflow on **Input Email** → `Every time the input is changed`

**Condition**: `Input Email is not empty` AND `Input Email is a valid email`

**Action 1**: Call Check Email API (after 500ms delay)
- **API**: Convex - Check Email
- **Parameters**:
  - `email`: `Input Email's value`

**Action 2**: Show validation icon/text
- Add a small text element next to email input
- **Condition**: `Result of step 1's available is "no"`
- **Text**: `"❌ Este correo ya está registrado"`
- **Color**: Red

- **Condition**: `Result of step 1's available is "yes"`
- **Text**: `"✓ Correo disponible"`
- **Color**: Green

---

## Part 6: Styling & Responsiveness

### Desktop View (Width > 768px)
- Container: `400px` fixed width, centered
- Inputs: Full width with consistent `12px` margin bottom
- Font sizes: 14px for inputs, 16px for labels

### Mobile View (Width ≤ 768px)
- Container: `90%` width, `16px` padding
- Inputs: Full width
- Font sizes: 14px for inputs, 14px for labels
- Reduce heading size to 24px

### Color Palette
- **Primary**: `#10B981` (Green for cannabis/agriculture theme)
- **Background**: `#F9FAFB` (Light gray)
- **Text**: `#111827` (Dark gray/black)
- **Input Border**: `#D1D5DB` (Medium gray)
- **Error**: `#EF4444` (Red)
- **Success**: `#10B981` (Green)

---

## Part 7: Testing Checklist

### Functional Testing
- [ ] Department dropdown loads Colombian departments
- [ ] Municipality dropdown loads municipalities for selected department
- [ ] Municipality dropdown clears when department changes
- [ ] Email validation shows available/unavailable status
- [ ] Password validation rejects <8 characters
- [ ] Registration succeeds with valid data
- [ ] Registration fails with duplicate email
- [ ] Success message displays on successful registration
- [ ] Error message displays on failed registration
- [ ] Redirect to email verification page works

### UI Testing
- [ ] Form is centered on page
- [ ] All inputs have correct placeholders in Spanish
- [ ] Dropdowns display correct options
- [ ] Button is full width and green
- [ ] Responsive layout works on mobile (test with width < 768px)
- [ ] All text is in Spanish

### Edge Case Testing
- [ ] Submit with empty fields shows error
- [ ] Submit with invalid email format shows error
- [ ] Submit with password < 8 chars shows error
- [ ] Submit with unavailable email shows error from backend
- [ ] Change department clears municipality selection

---

## Part 8: Go Live

### Pre-launch Checklist
- [ ] All API calls are configured correctly
- [ ] Convex deployment URL is correct (production, not dev)
- [ ] Database is seeded with roles and geographic data
- [ ] All workflows are tested
- [ ] Mobile responsiveness verified
- [ ] Spanish translations verified
- [ ] Privacy policy and terms links added (if required)

### Launch Steps
1. Set signup page as public (not login-required)
2. Update index page to redirect to `/signup` if not logged in
3. Test full registration flow one final time
4. Monitor Convex logs for errors
5. Set up error tracking (optional - Bubble analytics)

---

## Troubleshooting

### Problem: Departments dropdown is empty
**Solution**:
- Verify Convex API call is configured correctly
- Check Convex deployment URL
- Run `seedGeographic:seedColombianGeography` mutation
- Check API Connector initialization - re-initialize if needed

### Problem: "Email already registered" error on new email
**Solution**:
- Check database - email might exist from previous test
- Delete test users from Convex dashboard
- Ensure email is lowercase in database

### Problem: Registration fails with "Role not found"
**Solution**:
- Run `seedRoles:seedSystemRoles` mutation in Convex
- Verify `COMPANY_OWNER` role exists in database

### Problem: Municipality dropdown doesn't filter by department
**Solution**:
- Check `departmentCode` parameter is set to `Dropdown Department's value's division_1_code`
- Verify dropdown is using correct API call
- Check if parent-child relationship in database is correct

---

## Next Module

After completing Module 1, implement:

**Module 2: Email Verification**
- Send verification email
- Create email verification page
- Verify token and activate account

---

## Support Resources

- **Bubble Manual**: [https://manual.bubble.io](https://manual.bubble.io)
- **Convex Docs**: [https://docs.convex.dev](https://docs.convex.dev)
- **API Integration**: [../../core/API-Integration.md](../../core/API-Integration.md)
