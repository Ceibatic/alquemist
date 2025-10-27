# **Complete Bubble Setup Guide - Modules 1 & 2**

## **Table of Contents**
1. [Overview](#overview)
2. [API Connectors Setup](#api-connectors-setup)
3. [Page 1: signup-step-1](#page-1-signup-step-1)
4. [Page 2: signup-verify-email](#page-2-signup-verify-email)
5. [Page 3: signup-step-2](#page-3-signup-step-2)
6. [Page 4: Dashboard Landing](#page-4-dashboard-landing)
7. [API Responses Reference](#api-responses-reference)
8. [Testing Procedures](#testing-procedures)

---

## **Overview**

This guide provides step-by-step instructions to set up the complete signup flow in Bubble, including:
- **Module 1**: 3-step user and company registration
- **Module 2**: Email verification with Resend integration
- **Auto-login**: Automatic Clerk session creation
- **Session persistence**: User directed to authenticated dashboard

### **Architecture Flow**
```
signup-step-1
  ↓ (create user + send email)
signup-verify-email
  ↓ (verify token)
signup-step-2
  ↓ (create company + auto-login)
dashboard
  ✓ (authenticated, ready for next steps)
```

---

## **API Connectors Setup**

### **API Base URL**
```
https://exciting-shrimp-34.convex.site
```

### **1. RegisterUserStep1**

**Purpose**: Create user and send verification email

```
Name: RegisterUserStep1
Method: POST
URL: https://exciting-shrimp-34.convex.site/registration/register-step-1

Headers:
  Content-Type: application/json

Body (JSON):
{
  "email": "<email_input_value>",
  "password": "<password_input_value>",
  "firstName": "<first_name_input_value>",
  "lastName": "<last_name_input_value>",
  "phone": "<phone_input_value>"
}

Parameter Configuration:
  ☐ Private (unchecked) - Allow dynamic values
```

**Sample Response:**
```json
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "email": "john@example.com",
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr",
  "expiresAt": 1761534872405,
  "message": "Verification email sent. Check your inbox."
}
```

---

### **2. VerifyEmailToken**

**Purpose**: Verify email using token from email or manual entry

```
Name: VerifyEmailToken
Method: POST
URL: https://exciting-shrimp-34.convex.site/registration/verify-email

Headers:
  Content-Type: application/json

Body (JSON):
{
  "token": "<verification_code_input_value>"
}

Parameter Configuration:
  ☐ Private (unchecked)
```

**Sample Response:**
```json
{
  "success": true,
  "message": "¡Email verificado exitosamente!",
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx"
}
```

---

### **3. ResendVerificationEmail**

**Purpose**: Resend verification email (rate limited: 5 per 5 min)

```
Name: ResendVerificationEmail
Method: POST
URL: https://exciting-shrimp-34.convex.site/registration/resend-email

Headers:
  Content-Type: application/json

Body (JSON):
{
  "email": "<current_email_value>"
}

Parameter Configuration:
  ☐ Private (unchecked)
```

**Sample Response:**
```json
{
  "success": true,
  "token": "newTokenValue",
  "email": "john@example.com",
  "message": "Email de verificación reenviado"
}
```

---

### **4. GetDepartments**

**Purpose**: Fetch Colombian departments for dropdown

```
Name: GetDepartments
Method: POST
URL: https://exciting-shrimp-34.convex.site/geographic/departments

Headers:
  Content-Type: application/json

Body (JSON):
{
  "countryCode": "CO"
}

Parameter Configuration:
  ☑ Private (checked) - "CO" never changes
```

**Sample Response:**
```json
[
  {
    "_id": "nd7...",
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota",
    ...
  },
  {
    "_id": "nd7...",
    "division_1_code": "25",
    "division_1_name": "Cundinamarca",
    "timezone": "America/Bogota",
    ...
  }
]
```

---

### **5. GetMunicipalities**

**Purpose**: Fetch municipalities for selected department

```
Name: GetMunicipalities
Method: POST
URL: https://exciting-shrimp-34.convex.site/geographic/municipalities

Headers:
  Content-Type: application/json

Body (JSON):
{
  "countryCode": "CO",
  "departmentCode": "<selected_department_code>"
}

Parameter Configuration:
  countryCode: ☑ Private (checked)
  departmentCode: ☐ Private (unchecked) - dynamic from dropdown
```

**Sample Response:**
```json
[
  {
    "_id": "nd7...",
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05",
    "latitude": 6.2476,
    "longitude": -75.5658,
    "timezone": "America/Bogota"
  }
]
```

---

### **6. RegisterCompanyStep2**

**Purpose**: Create company and complete registration

```
Name: RegisterCompanyStep2
Method: POST
URL: https://exciting-shrimp-34.convex.site/registration/register-step-2

Headers:
  Content-Type: application/json

Body (JSON):
{
  "userId": "<current_user_id_state>",
  "companyName": "<company_name_input_value>",
  "businessEntityType": "<business_type_dropdown_value>",
  "companyType": "<company_type_dropdown_value>",
  "countryCode": "CO",
  "departmentCode": "<selected_department_code>",
  "municipalityCode": "<selected_municipality_code>"
}

Parameter Configuration:
  countryCode: ☑ Private (checked)
  All others: ☐ Private (unchecked) - dynamic
```

**Sample Response:**
```json
{
  "success": true,
  "userId": "nd7a2...",
  "companyId": "nd7b4...",
  "organizationId": "org_1761533872405",
  "user": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "company": {
    "name": "Acme Corp",
    "subscriptionPlan": "trial"
  }
}
```

---

### **7. AutoLoginWithClerk**

**Purpose**: Auto-login after signup complete, create Clerk session

```
Name: AutoLoginWithClerk
Method: POST
URL: https://exciting-shrimp-34.convex.site/registration/auto-login

Headers:
  Content-Type: application/json

Body (JSON):
{
  "userId": "<current_user_id_state>",
  "email": "<current_email_state>",
  "password": "<password_from_step1>",
  "firstName": "<first_name_from_step1>",
  "lastName": "<last_name_from_step1>",
  "companyName": "<company_name_from_step2>"
}

Parameter Configuration:
  All: ☐ Private (unchecked) - all dynamic
```

**Sample Response:**
```json
{
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "clerkUserId": "user_2M...",
  "sessionId": "sess_...",
  "companyId": "nd7b4...",
  "email": "john@example.com",
  "message": "¡Bienvenido a Alquemist!",
  "redirectUrl": "/dashboard"
}
```

---

## **Page 1: signup-step-1**

### **Custom States**

Go to **Page Settings → Custom States** and add:

```
State 1: current_user_id
  Type: Text
  Default value: ""
  Description: "Stores userId from step 1"

State 2: current_email
  Type: Text
  Default value: ""
  Description: "Stores email for verification page"

State 3: registration_token
  Type: Text
  Default value: ""
  Description: "Stores verification token"

State 4: registration_error
  Type: Text
  Default value: ""
  Description: "Error messages display"

State 5: is_loading
  Type: Boolean
  Default value: false
  Description: "Show/hide loading spinner"

State 6: registration_success
  Type: Boolean
  Default value: false
  Description: "Track successful step 1"
```

### **Page Elements**

Create the following elements in a group called "SignupForm":

```
┌─────────────────────────────────────┐
│  Group: SignupForm                  │
├─────────────────────────────────────┤
│                                     │
│  Text: "Crear Cuenta"              │
│  Type: Text                         │
│  Size: 32px, Bold                   │
│                                     │
│  Text: "Paso 1/3 - Información ..."│
│  Type: Text                         │
│  Size: 14px, Color: #999            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: Email                 │  │
│  │ Name: Input_Email            │  │
│  │ Type: Email                  │  │
│  │ Placeholder: "..."           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: Password              │  │
│  │ Name: Input_Password         │  │
│  │ Type: Password               │  │
│  │ Min length: 8                │  │
│  │ Placeholder: "..."           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: FirstName             │  │
│  │ Name: Input_FirstName        │  │
│  │ Type: Text                   │  │
│  │ Placeholder: "Nombre"        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: LastName              │  │
│  │ Name: Input_LastName         │  │
│  │ Type: Text                   │  │
│  │ Placeholder: "Apellido"      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: Phone (Optional)      │  │
│  │ Name: Input_Phone            │  │
│  │ Type: Text                   │  │
│  │ Placeholder: "3001234567"    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Button: "Crear Cuenta"       │  │
│  │ Name: Button_Register        │  │
│  │ Style: Primary               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Link: "¿Ya tienes cuenta?"   │  │
│  │ Name: Link_SignIn            │  │
│  │ URL: /sign-in                │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Group: Messages                    │
├─────────────────────────────────────┤
│                                     │
│  Group: LoadingState                │
│  Condition: is_loading = true       │
│    └─ Spinner                       │
│    └─ Text: "Procesando..."         │
│                                     │
│  Group: ErrorMessage                │
│  Condition: registration_error ≠ ""│
│  Background: #f8d7da (light red)   │
│    └─ Text: "✗ " + registration_... │
│                                     │
│  Group: SuccessMessage              │
│  Condition: registration_success = │
│  Background: #d4edda (light green) │
│    └─ Text: "✓ " + message          │
│                                     │
└─────────────────────────────────────┘
```

### **Workflow: Register_User_Step1**

**Trigger**: Button "Crear Cuenta" is clicked

```
Step 1: Client-Side Validation
  Conditions:
    ✓ Input_Email.value is not empty
    ✓ Input_Email.value contains "@" (basic format)
    ✓ Input_Password.value length ≥ 8
    ✓ Input_Password.value matches .*[a-zA-Z].* (has letters)
    ✓ Input_Password.value matches .*[0-9].* (has numbers)
    ✓ Input_FirstName.value is not empty
    ✓ Input_LastName.value is not empty

  If ANY fail:
    → Set registration_error to "Validation failed message"
    → Stop workflow

---

Step 2: Show Loading State
  → Set is_loading to true
  → Set registration_error to ""
  → Disable Button_Register

---

Step 3: Call RegisterUserStep1 API
  Email: Input_Email.value
  Password: Input_Password.value
  FirstName: Input_FirstName.value
  LastName: Input_LastName.value
  Phone: Input_Phone.value

---

Step 4A: Handle Success (Condition: RegisterUserStep1.success = true)

  Sub-Step 4.1: Store in Custom States
    → Set current_user_id = RegisterUserStep1.userId
    → Set current_email = RegisterUserStep1.email
    → Set registration_token = RegisterUserStep1.token
    → Set registration_success = true
    → Set is_loading = false
    → Set registration_error = ""

  Sub-Step 4.2: Clear Form
    → Clear Input_Email
    → Clear Input_Password
    → Clear Input_FirstName
    → Clear Input_LastName
    → Clear Input_Phone

  Sub-Step 4.3: Show Success Message
    → Display "¡Cuenta creada! Verifica tu email"

  Sub-Step 4.4: Navigate After Delay
    → Wait 2 seconds
    → Navigate to: signup-verify-email page
      (Pass parameters: email=current_email, user_id=current_user_id)

---

Step 4B: Handle Error (Condition: RegisterUserStep1.success = false)

  Sub-Step 4.1: Store Error
    → Set registration_error = RegisterUserStep1.error
    → Set is_loading = false
    → Set registration_success = false

  Sub-Step 4.2: Focus Input (map error to field)
    IF registration_error contains "email":
      → Focus Input_Email
    ELSE IF registration_error contains "password":
      → Focus Input_Password
    ELSE:
      → Focus Input_Email
```

---

## **Page 2: signup-verify-email**

### **Custom States**

```
State 1: verification_code
  Type: Text
  Default: ""

State 2: verification_error
  Type: Text
  Default: ""

State 3: is_verifying
  Type: Boolean
  Default: false

State 4: verification_complete
  Type: Boolean
  Default: false

State 5: resend_cooldown_seconds
  Type: Number
  Default: 0

State 6: can_resend
  Type: Boolean
  Default: false
```

### **Page Elements**

```
┌─────────────────────────────────────┐
│  Group: VerificationForm            │
├─────────────────────────────────────┤
│                                     │
│  Text: "✉️ Verificación de Email"  │
│  Size: 28px, Bold                   │
│                                     │
│  Text: "Se envió un código a..."   │
│  Text content:                      │
│    "Se envió un código a " +
│    Get("email") (or use parent      │
│    page state)                      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Input: VerificationCode      │  │
│  │ Name: Input_Code             │  │
│  │ Placeholder: "Código de ..." │  │
│  │ Max length: 32               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Button: "Verificar"          │  │
│  │ Name: Button_Verify          │  │
│  │ Style: Primary               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Link: "¿No recibiste?"       │  │
│  │ Name: Link_Resend            │  │
│  │ Condition: can_resend = true │  │
│  └──────────────────────────────┘  │
│                                     │
│  Text: "Espera..."                 │
│  Text content:                      │
│    IF resend_cooldown_seconds > 0: │
│      "Reenviar en " +               │
│      resend_cooldown_seconds + "s"  │
│    ELSE:                            │
│      ""                             │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Group: Messages                    │
├─────────────────────────────────────┤
│                                     │
│  Group: LoadingState                │
│  Condition: is_verifying = true     │
│    └─ Spinner + "Verificando..."    │
│                                     │
│  Group: ErrorMessage                │
│  Condition: verification_error ≠ ""│
│  Background: #f8d7da                │
│    └─ Text: "✗ " + verification_... │
│                                     │
│  Group: SuccessMessage              │
│  Condition: verification_complete = │
│  Background: #d4edda                │
│    └─ Text: "✓ ¡Email verificado!"│
│                                     │
└─────────────────────────────────────┘
```

### **Workflow 1: Verify_Email_Token**

**Trigger**: Button "Verificar" clicked

```
Step 1: Validate Code Not Empty
  IF Input_Code.value is empty:
    → Set verification_error = "Ingresa el código"
    → Stop

---

Step 2: Show Loading
  → Set is_verifying = true
  → Set verification_error = ""
  → Disable Button_Verify

---

Step 3: Call VerifyEmailToken API
  Token: Input_Code.value

---

Step 4A: Success (VerifyEmailToken.success = true)
  → Set verification_complete = true
  → Set is_verifying = false
  → Set verification_error = ""
  → Show "¡Email verificado exitosamente!"

  → Wait 2 seconds
  → Navigate to: signup-step-2
    (Pass: user_id, email from states)

---

Step 4B: Error (VerifyEmailToken.success = false)
  → Set verification_error = VerifyEmailToken.error
  → Set is_verifying = false
  → Set verification_complete = false
```

### **Workflow 2: Resend_Email_Token**

**Trigger**: Link "¿No recibiste?" clicked

```
Step 1: Check Cooldown
  IF resend_cooldown_seconds > 0:
    → Set verification_error =
        "Espera " + resend_cooldown_seconds + " segundos"
    → Stop

---

Step 2: Show Loading
  → Disable Link_Resend
  → Set can_resend = false
  → Set is_verifying = true

---

Step 3: Call ResendVerificationEmail API
  Email: Get("email") (or parent email state)

---

Step 4A: Success
  → Set is_verifying = false
  → Set verification_error = ""
  → Show "Email reenviado. Revisa tu bandeja"

  → Start 5-minute cooldown timer:
    resend_cooldown_seconds = 300
    Every 1 second:
      resend_cooldown_seconds = resend_cooldown_seconds - 1
      IF resend_cooldown_seconds ≤ 0:
        set can_resend = true
        set resend_cooldown_seconds = 0

---

Step 4B: Error (rate limited or other)
  → Set verification_error = ResendVerificationEmail.error
  → Set is_verifying = false
  → Set can_resend = false
```

### **Workflow 3: Page_Load**

**Trigger**: Page loads

```
Step 1: Get email from URL or parent state
  → Display email in Text element

Step 2: Initialize State
  → Set can_resend = true (allow first resend)
  → Clear previous error
```

---

## **Page 3: signup-step-2**

### **Custom States**

```
State 1: selected_department_code
  Type: Text
  Default: ""

State 2: selected_municipality_code
  Type: Text
  Default: ""

State 3: departments_list
  Type: List of Objects
  Default: []

State 4: municipalities_list
  Type: List of Objects
  Default: []

State 5: company_creation_error
  Type: Text
  Default: ""

State 6: is_creating_company
  Type: Boolean
  Default: false

State 7: company_success
  Type: Boolean
  Default: false
```

### **Page Elements**

```
┌──────────────────────────────────────┐
│  Group: CompanyForm                  │
├──────────────────────────────────────┤
│                                      │
│  Text: "Crear Empresa"               │
│  Size: 28px, Bold                    │
│                                      │
│  Text: "Paso 3/3 - Información ..."  │
│  Size: 14px, Color: #999             │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Input: CompanyName             │   │
│  │ Name: Input_CompanyName        │   │
│  │ Placeholder: "Nombre empresa"  │   │
│  │ Required: true                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Dropdown: BusinessEntityType   │   │
│  │ Name: Dropdown_BusinessType    │   │
│  │ Options:                       │   │
│  │   • S.A.S                      │   │
│  │   • S.A.                       │   │
│  │   • Ltda.                      │   │
│  │   • E.U.                       │   │
│  │   • Persona Natural            │   │
│  │ Required: true                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Dropdown: CompanyType          │   │
│  │ Name: Dropdown_CompanyType     │   │
│  │ Options:                       │   │
│  │   • cannabis                   │   │
│  │   • coffee                     │   │
│  │   • cocoa                      │   │
│  │   • flowers                    │   │
│  │   • mixed                      │   │
│  │ Required: true                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Dropdown: Department           │   │
│  │ Name: Dropdown_Department      │   │
│  │ Choices: departments_list      │   │
│  │ Display:                       │   │
│  │   item.division_1_name         │   │
│  │ Value: item.division_1_code    │   │
│  │ Required: true                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Dropdown: Municipality         │   │
│  │ Name: Dropdown_Municipality    │   │
│  │ Choices: municipalities_list   │   │
│  │ Display:                       │   │
│  │   item.division_2_name         │   │
│  │ Value: item.division_2_code    │   │
│  │ Condition: departments_list    │   │
│  │ is not empty                   │   │
│  │ Required: true                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Button: "Crear Empresa"        │   │
│  │ Name: Button_CreateCompany     │   │
│  │ Style: Primary                 │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌───────────────────────────────┐   │
│  │ Button: "← Atrás"              │   │
│  │ Name: Button_Back              │   │
│  │ Action: Navigate to step-1     │   │
│  └───────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Group: Messages                     │
├──────────────────────────────────────┤
│ (Same as previous pages - Loading,   │
│  Error, Success displays)            │
└──────────────────────────────────────┘
```

### **Workflow 1: Page_Load**

**Trigger**: Page loads

```
Step 1: Call GetDepartments API
  CountryCode: "CO"

---

Step 2: Store Results
  → Set departments_list = GetDepartments result
  → Populate Dropdown_Department with results

---

Step 3: Clear Previous Selection
  → Set selected_department_code = ""
  → Set selected_municipality_code = ""
  → Set municipalities_list = []
```

### **Workflow 2: Department_Selected**

**Trigger**: Dropdown_Department value changed

```
Step 1: Get Selected Department Code
  → Set selected_department_code =
      Dropdown_Department.value

---

Step 2: Reset Municipality
  → Set selected_municipality_code = ""
  → Clear Dropdown_Municipality

---

Step 3: Call GetMunicipalities API
  CountryCode: "CO"
  DepartmentCode: selected_department_code

---

Step 4: Store Results
  → Set municipalities_list =
      GetMunicipalities result
  → Populate Dropdown_Municipality
```

### **Workflow 3: Create_Company**

**Trigger**: Button "Crear Empresa" clicked

```
Step 1: Validate All Fields
  Checks:
    ✓ Input_CompanyName is not empty
    ✓ Dropdown_BusinessType value selected
    ✓ Dropdown_CompanyType value selected
    ✓ Dropdown_Department value selected
    ✓ Dropdown_Municipality value selected

  If ANY fail:
    → Set company_creation_error =
        "Completa todos los campos"
    → Stop

---

Step 2: Show Loading
  → Set is_creating_company = true
  → Set company_creation_error = ""
  → Disable Button_CreateCompany

---

Step 3: Call RegisterCompanyStep2 API
  userId: current_user_id (from state)
  companyName: Input_CompanyName.value
  businessEntityType:
    Dropdown_BusinessType.value
  companyType: Dropdown_CompanyType.value
  countryCode: "CO"
  departmentCode:
    Dropdown_Department.value
  municipalityCode:
    Dropdown_Municipality.value

---

Step 4A: Success
  (RegisterCompanyStep2.success = true)

  Sub-Step 4.1: Store Company Info
    → Set company_success = true
    → Set is_creating_company = false

  Sub-Step 4.2: Call Auto-Login API
    → Call AutoLoginWithClerk
      userId: current_user_id
      email: current_email
      password: (saved from step 1)
      firstName: (saved from step 1)
      lastName: (saved from step 1)
      companyName: Input_CompanyName.value

  Sub-Step 4.3: Handle Auto-Login
    IF AutoLoginWithClerk.success = true:
      → Show "¡Bienvenido!"
      → Wait 2 seconds
      → Navigate to: /dashboard
    ELSE:
      → Show "Usuario creado pero necesitas
           inicia sesión manualmente"
      → Navigate to: /sign-in

---

Step 4B: Error
  (RegisterCompanyStep2.success = false)

  → Set company_creation_error =
      RegisterCompanyStep2.error
  → Set is_creating_company = false
  → Set company_success = false
```

---

## **Page 4: Dashboard Landing**

### **Page Structure** (After Auth)

```
┌──────────────────────────────────────┐
│  Header                              │
│  ├─ Logo                             │
│  ├─ Welcome: "¡Hola, [firstName]!"   │
│  └─ User Menu (Profile, Logout)      │
├──────────────────────────────────────┤
│  Main Content                        │
│  ├─ Status Card: "Email verificado" │
│  │  └─ Icon: ✓ (Green)              │
│  │                                   │
│  ├─ Status Card: "Empresa creada"   │
│  │  └─ Company name + type           │
│  │                                   │
│  ├─ Next Step Card                   │
│  │  Title: "Próximo paso"            │
│  │  Description: "Crea tu primera    │
│  │               instalación"        │
│  │  CTA Button: "Crear Instalación"  │
│  │  Navigates to: Module 5           │
│  │                                   │
│  └─ Quick Links                      │
│     ├─ View Profile                  │
│     ├─ Company Settings              │
│     └─ Help & Documentation          │
│                                      │
├──────────────────────────────────────┤
│  Footer                              │
│  ├─ Support: support@alquemist.com   │
│  └─ Documentation links              │
└──────────────────────────────────────┘
```

### **Display User Info**

Create a Workflow on Page Load:

```
Step 1: Fetch User Profile
  → Call query/API to get user info
  → Display firstName in welcome message

Step 2: Fetch Company Info
  → Call query/API to get company info
  → Display company name and location

Step 3: Display Onboarding Status
  → Show completed steps (✓)
  → Show current step
  → Show next step with CTA
```

---

## **API Responses Reference**

### **Error Response Format**

All endpoints return this format on error:

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

### **Common Errors**

| Error | Cause | Recovery |
|-------|-------|----------|
| "Formato de correo electrónico inválido" | Invalid email format | Correct email |
| "El correo electrónico ya está registrado" | Email exists | Use different email |
| "La contraseña debe tener al menos 8 caracteres..." | Weak password | Strengthen password |
| "Token no válido o expirado" | Invalid/expired token | Resend email |
| "Este token ya fue utilizado" | Token used twice | Resend for new token |
| "Demasiados intentos. Espera 5 minutos..." | Rate limited | Wait 5 minutes |
| "Email no encontrado" | Email doesn't exist | Check email |

---

## **Testing Procedures**

### **Test Case 1: Happy Path**

```
□ Navigate to /signup-step-1
□ Fill all fields:
  - Email: test@example.com
  - Password: TestPassword123
  - First Name: John
  - Last Name: Doe
  - Phone: 3001234567
□ Click "Crear Cuenta"
□ Verify success message appears
□ Verify redirect to verify-email page
□ Check custom states have data
□ Copy verification token from response
□ Paste token in verification page
□ Click "Verificar"
□ Verify email verified message
□ Verify auto-redirect to step-2
□ Fill company form
□ Click "Crear Empresa"
□ Verify auto-login succeeds
□ Verify redirect to /dashboard
□ Verify user is authenticated
```

### **Test Case 2: Validation**

```
□ Test empty email → Error shows
□ Test invalid email → Error shows
□ Test weak password → Error shows
□ Test missing name fields → Error shows
□ Test duplicate email → Error shows
```

### **Test Case 3: Email Verification**

```
□ Send email → Token arrives
□ Try token twice → 2nd fails
□ Try expired token → Error shows
□ Resend email → New token arrives
□ Verify 5-resend limit → Error after 5
```

---

**This guide is comprehensive and covers all aspects of Bubble setup for Modules 1 & 2 with auto-login.**
