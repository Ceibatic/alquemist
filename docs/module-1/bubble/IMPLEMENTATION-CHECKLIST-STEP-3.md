# Signup Step 3 - Company Registration Implementation Checklist
## Build the Company Registration Page in Bubble (20 minutes)

---

## Page Setup
- [ ] Create new page named: `signup-step-2`
- [ ] Set page type: `Standard`
- [ ] Set page layout: `Column container`

---

## Step 1: Create Custom States (7 states)

### State 1: selected_department_code
```
Name: selected_department_code
Type: Text
Expose: No
```

### State 2: selected_municipality_code
```
Name: selected_municipality_code
Type: Text
Expose: No
```

### State 3: departments_list
```
Name: departments_list
Type: List of Objects
Expose: No
```

### State 4: municipalities_list
```
Name: municipalities_list
Type: List of Objects
Expose: No
```

### State 5: company_creation_error
```
Name: company_creation_error
Type: Text
Expose: No
```

### State 6: is_creating_company
```
Name: is_creating_company
Type: Yes/No
Expose: No
Initial: No
```

### State 7: company_success
```
Name: company_success
Type: Yes/No
Expose: No
Initial: No
```

**Checklist**:
- [ ] Go to **Page settings** → **App data**
- [ ] Create state: `selected_department_code` (Type: Text)
- [ ] Create state: `selected_municipality_code` (Type: Text)
- [ ] Create state: `departments_list` (Type: List of Objects)
- [ ] Create state: `municipalities_list` (Type: List of Objects)
- [ ] Create state: `company_creation_error` (Type: Text)
- [ ] Create state: `is_creating_company` (Type: Yes/No, Initial: No)
- [ ] Create state: `company_success` (Type: Yes/No, Initial: No)

---

## Step 2: Create Text Elements (5 elements)

### Element 1: page_title
```
Element Type: Text
Text: "Crear Empresa"
Font size: 32px
Font weight: Bold
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `page_title`
- [ ] Set text: `Crear Empresa`
- [ ] Set font size: 32px
- [ ] Set font weight: Bold

### Element 2: progress_text
```
Element Type: Text
Text: "Paso 3 de 3: Información de la Empresa"
Font size: 14px
Color: Gray
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `progress_text`
- [ ] Set text: `Paso 3 de 3: Información de la Empresa`

### Element 3: error_message
```
Element Type: Text
Text: "Error message will appear here"
Font size: 14px
Text color: Red (#FF0000)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `error_message`
- [ ] Set text color: Red
- [ ] Set visibility to: Hidden

### Element 4: success_message
```
Element Type: Text
Text: "¡Empresa creada exitosamente! Redirigiendo..."
Font size: 14px
Text color: Green (#00AA00)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `success_message`
- [ ] Set text color: Green
- [ ] Set visibility to: Hidden

### Element 5: loading_message
```
Element Type: Text
Text: "Creando empresa..."
Font size: 12px
Color: Blue
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `loading_message`
- [ ] Set color: Blue
- [ ] Set visibility to: Hidden

---

## Step 3: Create Input Elements (2 inputs)

### Input 1: company_name_input
```
Element Type: Input
Placeholder: "Nombre de la empresa"
Input type: Text
Max length: 100
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `company_name_input`
- [ ] Set Placeholder: `Nombre de la empresa`
- [ ] Set Max length: `100`

### Input 2: business_type_input
```
Element Type: Dropdown / Select
Placeholder: "Tipo de entidad comercial"
Options:
  - S.A.S
  - S.A.
  - Ltda
  - E.U.
  - Persona Natural
```
**Checklist**:
- [ ] Drag **Dropdown** element to canvas
- [ ] Name it: `business_type_input`
- [ ] Set Placeholder: `Tipo de entidad comercial`
- [ ] Add options:
  - [ ] S.A.S
  - [ ] S.A.
  - [ ] Ltda
  - [ ] E.U.
  - [ ] Persona Natural

---

## Step 4: Create Dropdown Elements (3 dropdowns)

### Dropdown 1: company_type_dropdown
```
Element Type: Dropdown / Select
Placeholder: "Tipo de cultivo"
Options:
  - Cannabis
  - Coffee
  - Cocoa
  - Flowers
  - Mixed
```
**Checklist**:
- [ ] Drag **Dropdown** element to canvas
- [ ] Name it: `company_type_dropdown`
- [ ] Set Placeholder: `Tipo de cultivo`
- [ ] Add options:
  - [ ] cannabis
  - [ ] coffee
  - [ ] cocoa
  - [ ] flowers
  - [ ] mixed

### Dropdown 2: department_dropdown
```
Element Type: Dropdown / Select
Placeholder: "Departamento"
Options: Dynamic (populated from API)
```
**Checklist**:
- [ ] Drag **Dropdown** element to canvas
- [ ] Name it: `department_dropdown`
- [ ] Set Placeholder: `Departamento`
- [ ] Configure as dynamic dropdown (options come from API)

### Dropdown 3: municipality_dropdown
```
Element Type: Dropdown / Select
Placeholder: "Municipio"
Options: Dynamic (populated from API, depends on department selection)
```
**Checklist**:
- [ ] Drag **Dropdown** element to canvas
- [ ] Name it: `municipality_dropdown`
- [ ] Set Placeholder: `Municipio`
- [ ] Configure as dynamic dropdown (options depend on department_dropdown selection)

---

## Step 5: Create Buttons (2 buttons)

### Button 1: create_company_button
```
Element Type: Button
Text: "Crear Empresa"
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `create_company_button`
- [ ] Set button text: `Crear Empresa`

### Button 2: back_button
```
Element Type: Button
Text: "Volver Atrás"
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `back_button`
- [ ] Set button text: `Volver Atrás`

---

## Step 6: Setup Page Load Workflow

### Workflow: Page Load (Initialize)

**Trigger**: Page loads

#### Action 1: Fetch Departments List
```
Action Type: Plugin → API Connector
Call: GetDepartments

Parameters:
  countryCode: "CO"
```

#### Action 2: Store Departments in Page State
```
Trigger: When GetDepartments completes successfully

Action: Set custom state
State: departments_list
Value: GetDepartments.data.body
```

#### Action 3: Error Handling
```
Trigger: When GetDepartments fails

Action: Show error message
Element: error_message
Text: "Error al cargar departamentos: " + GetDepartments.data.body.error
```

**Checklist**:
- [ ] Create page load workflow
- [ ] Add action: API Connector → GetDepartments
- [ ] Add success handler: Set state departments_list
- [ ] Add error handler: Show error message

---

## Step 7: Create Department Selection Workflow

### Workflow: Department Selected

**Trigger**: User selects department from `department_dropdown`

#### Action 1: Store Selected Department Code
```
Action Type: Set custom state
State: selected_department_code
Value: department_dropdown value
```

#### Action 2: Fetch Municipalities
```
Action Type: Plugin → API Connector
Call: GetMunicipalities

Parameters:
  countryCode: "CO"
  departmentCode: selected_department_code
```

#### Action 3: Store Municipalities
```
Trigger: When GetMunicipalities completes successfully

Action: Set custom state
State: municipalities_list
Value: GetMunicipalities.data.body
```

#### Action 4: Clear Municipality Selection
```
Action: Element → Clear
Element: municipality_dropdown
```

#### Action 5: Error Handling
```
Trigger: When GetMunicipalities fails

Action: Show error message
Element: error_message
Text: "Error al cargar municipios: " + GetMunicipalities.data.body.error
```

**Checklist**:
- [ ] Create workflow: Department selected (trigger: element changed)
- [ ] Add action: Set state selected_department_code
- [ ] Add action: API Connector → GetMunicipalities
- [ ] Add success handler: Set state municipalities_list
- [ ] Add action: Clear municipality_dropdown
- [ ] Add error handler: Show error

---

## Step 8: Create Municipality Selection Workflow

### Workflow: Municipality Selected

**Trigger**: User selects municipality from `municipality_dropdown`

#### Action 1: Store Selected Municipality Code
```
Action Type: Set custom state
State: selected_municipality_code
Value: municipality_dropdown value
```

#### Action 2: Hide Error Message
```
Action Type: Element → Hide
Element: error_message
```

**Checklist**:
- [ ] Create workflow: Municipality selected (trigger: element changed)
- [ ] Add action: Set state selected_municipality_code
- [ ] Add action: Hide error_message

---

## Step 9: Create Company Creation Workflow (Main)

### Workflow: Create Company

**Trigger**: Click on `create_company_button`

#### Action 1: Validate Inputs
```
Condition: company_name_input value is empty

If true:
  Show error: "Por favor ingresa el nombre de la empresa"
  STOP

Condition: business_type_input value is empty

If true:
  Show error: "Por favor selecciona un tipo de entidad"
  STOP

Condition: company_type_dropdown value is empty

If true:
  Show error: "Por favor selecciona un tipo de cultivo"
  STOP

Condition: department_dropdown value is empty

If true:
  Show error: "Por favor selecciona un departamento"
  STOP

Condition: municipality_dropdown value is empty

If true:
  Show error: "Por favor selecciona un municipio"
  STOP
```

#### Action 2: Show Loading State
```
Action Type: Element → Disable
Element: create_company_button

Action Type: Element → Show
Element: loading_message
```

#### Action 3: Make API Call to Create Company
```
Action Type: Plugin → API Connector
Call: RegisterCompanyStep2

Parameters:
  userId: GetPageData(signup-step-1).current_user_id
  companyName: company_name_input value
  businessEntityType: business_type_input value
  companyType: company_type_dropdown value
  country: "CO"
  departmentCode: selected_department_code
  municipalityCode: selected_municipality_code
```

#### Action 4: On Success - Auto-Login
```
Trigger: When RegisterCompanyStep2 completes successfully

Store values:
  companyId = RegisterCompanyStep2.data.body.companyId
  organizationId = RegisterCompanyStep2.data.body.organizationId

Then call: AutoLoginWithClerk

Parameters:
  userId: GetPageData(signup-step-1).current_user_id
  email: GetPageData(signup-step-1).current_email
  password: GetPageData(signup-step-1).registration_token (TODO: need to rethink this)
  firstName: [stored in step 1]
  lastName: [stored in step 1]
  companyName: company_name_input value
```

**NOTE**: The password handling needs clarification - you may need to store password in step 1 page state or get it from secure storage.

#### Action 5: On Success - Show Success & Navigate
```
Trigger: When AutoLoginWithClerk completes successfully

Actions:
  1. Show success message
     Element: success_message
     Text: "¡Empresa creada exitosamente!"

  2. Set custom state
     State: company_success = Yes

  3. Clear all inputs
     Element: company_name_input → Clear
     Element: business_type_input → Clear
     Element: company_type_dropdown → Clear
     Element: department_dropdown → Clear
     Element: municipality_dropdown → Clear

  4. Hide loading message
     Element: loading_message → Hide

  5. Navigate to dashboard (after 2 seconds)
     Action: Wait 2 seconds
     Action: Navigate to page: dashboard
```

#### Action 6: On Error - Handle Error
```
Trigger: When RegisterCompanyStep2 or AutoLoginWithClerk fails

Actions:
  1. Show error message
     Element: error_message

  2. Set error text
     Text: AutoLoginWithClerk.data.body.error OR RegisterCompanyStep2.data.body.error

  3. Enable button
     Action: Element → Enable
     Element: create_company_button

  4. Hide loading message
     Action: Element → Hide
     Element: loading_message
```

**Workflow Checklist**:
- [ ] Create workflow: Create Company (trigger: click create_company_button)
- [ ] Add validation for all 5 required fields
- [ ] Add action: Disable create_company_button
- [ ] Add action: Show loading_message
- [ ] Add action: API Connector → RegisterCompanyStep2
- [ ] Add success handler:
  - [ ] API Connector → AutoLoginWithClerk
  - [ ] Show success_message
  - [ ] Clear all inputs
  - [ ] Hide loading_message
  - [ ] Navigate to dashboard after 2 seconds
- [ ] Add error handler:
  - [ ] Show error_message
  - [ ] Enable create_company_button
  - [ ] Hide loading_message

---

## Step 10: Create Back Button Workflow

### Workflow: Go Back

**Trigger**: Click on `back_button`

#### Action 1: Navigate Back
```
Action Type: Navigate
Destination: Page `signup-verify-email`
```

**Checklist**:
- [ ] Right-click on `back_button`
- [ ] Select **Start/Edit workflow**
- [ ] Add action: Navigate → signup-verify-email

---

## Step 11: Create API Calls (If Not Already Done)

### API Call 1: GetDepartments
**Verify it exists**:
- [ ] Go to **Plugins** → **API Connector**
- [ ] Verify: `GetDepartments`
- [ ] URL: `https://[your-deployment].convex.site/geographic/departments`
- [ ] Method: `POST`
- [ ] Body:
  ```json
  {
    "countryCode": "CO"
  }
  ```

### API Call 2: GetMunicipalities
**Verify it exists**:
- [ ] Go to **Plugins** → **API Connector**
- [ ] Verify: `GetMunicipalities`
- [ ] URL: `https://[your-deployment].convex.site/geographic/municipalities`
- [ ] Method: `POST`
- [ ] Body:
  ```json
  {
    "countryCode": "CO",
    "departmentCode": "05"
  }
  ```

### API Call 3: RegisterCompanyStep2
**Verify it exists**:
- [ ] Go to **Plugins** → **API Connector**
- [ ] Verify: `RegisterCompanyStep2`
- [ ] URL: `https://[your-deployment].convex.site/registration/register-step-2`
- [ ] Method: `POST`
- [ ] Body:
  ```json
  {
    "userId": "nd7a2...",
    "companyName": "My Company",
    "businessEntityType": "S.A.S",
    "companyType": "cannabis",
    "country": "CO",
    "departmentCode": "05",
    "municipalityCode": "05001"
  }
  ```

### API Call 4: AutoLoginWithClerk
**Verify it exists**:
- [ ] Go to **Plugins** → **API Connector**
- [ ] Verify: `AutoLoginWithClerk`
- [ ] URL: `https://[your-deployment].convex.site/registration/auto-login`
- [ ] Method: `POST`
- [ ] Body:
  ```json
  {
    "userId": "nd7a2...",
    "email": "user@example.com",
    "password": "TestPass123",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "My Company"
  }
  ```

---

## Step 12: Testing

**Test Case 1: Valid Company Creation**
- [ ] Complete signup steps 1 & 2
- [ ] Arrive at signup-step-2 page
- [ ] Verify page loads with departments dropdown populated
- [ ] Select department: `Antioquia` (or any valid department)
- [ ] Verify municipalities dropdown updates with correct municipalities
- [ ] Select municipality: `Medellín` (or any municipality)
- [ ] Enter company name: `Test Company LLC`
- [ ] Select business entity type: `S.A.S`
- [ ] Select company type: `Cannabis`
- [ ] Click **Crear Empresa**
- [ ] Verify: Loading message appears
- [ ] Verify: Success message appears: "¡Empresa creada exitosamente!"
- [ ] Verify: Redirects to `dashboard` page after 2 seconds
- [ ] Verify: User is now logged in with Clerk session

**Test Case 2: Missing Company Name**
- [ ] Fill all fields except company_name_input
- [ ] Click **Crear Empresa**
- [ ] Verify: Error message: "Por favor ingresa el nombre de la empresa"
- [ ] Verify: Does NOT make API call
- [ ] Verify: Does NOT navigate away

**Test Case 3: Missing Business Entity Type**
- [ ] Fill all fields except business_type_input
- [ ] Click **Crear Empresa**
- [ ] Verify: Error message: "Por favor selecciona un tipo de entidad"
- [ ] Verify: Does NOT navigate away

**Test Case 4: Missing Department**
- [ ] Fill all fields except department_dropdown
- [ ] Click **Crear Empresa**
- [ ] Verify: Error message: "Por favor selecciona un departamento"
- [ ] Verify: Does NOT navigate away

**Test Case 5: Missing Municipality**
- [ ] Select department
- [ ] Do NOT select municipality
- [ ] Click **Crear Empresa**
- [ ] Verify: Error message: "Por favor selecciona un municipio"
- [ ] Verify: Does NOT navigate away

**Test Case 6: Municipality Updates on Department Change**
- [ ] Select department: `Antioquia`
- [ ] Verify municipalities list updates to show Antioquia municipalities
- [ ] Select municipality: `Medellín`
- [ ] Change department to: `Cundinamarca`
- [ ] Verify: municipality_dropdown is cleared
- [ ] Verify: New municipalities list shows Cundinamarca municipalities

**Test Case 7: Back Button**
- [ ] On signup-step-2 page
- [ ] Click **Volver Atrás**
- [ ] Verify: Navigates back to `signup-verify-email` page
- [ ] Verify: Can go forward again if needed

**Test Case 8: Duplicate Company Name (Same User)**
- [ ] Complete one full signup with company name "Acme Corp"
- [ ] Try to register again with same email (should fail at step 1 with duplicate email)
- [ ] Use new email but try same company name
- [ ] Verify: System allows same company name for different users

---

## Final Checklist

- [ ] Page created: `signup-step-2`
- [ ] All 7 custom states created
- [ ] All text elements created (5 elements)
- [ ] Input elements created: company_name_input, business_type_input
- [ ] Dropdown elements created: company_type_dropdown, department_dropdown, municipality_dropdown
- [ ] Both buttons created: create_company_button, back_button
- [ ] Page load workflow created (fetches departments)
- [ ] Department selection workflow created (fetches municipalities)
- [ ] Municipality selection workflow created
- [ ] Company creation workflow created with validation + API calls + auto-login
- [ ] Back button workflow created
- [ ] All 4 API calls configured and tested
- [ ] All 8 test cases passed
- [ ] Page ready for dashboard integration

---

## Expected Result

### Successful Company Creation Flow:
1. ✅ Departments load on page load
2. ✅ User selects department → municipalities load dynamically
3. ✅ User fills all required fields
4. ✅ Clicks "Crear Empresa"
5. ✅ Loading message appears
6. ✅ Company is created in Convex
7. ✅ User is auto-created in Clerk
8. ✅ Clerk session is established
9. ✅ Success message appears
10. ✅ Page redirects to dashboard after 2 seconds
11. ✅ User is now fully authenticated and on-boarded

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Departments dropdown empty on load | Verify GetDepartments API call configured correctly |
| Municipalities don't update on department change | Verify department selection workflow is triggered |
| API returns "Invalid location" | Verify department and municipality codes are correct |
| Auto-login fails | Verify Clerk credentials are configured in backend |
| Password not stored from Step 1 | Need to add password to page state in signup-step-1 |
| Dashboard page doesn't exist | Create dashboard page before testing |
| Navigation doesn't work | Verify page names match exactly (case-sensitive) |
| Can't select municipality | First select a department to populate the list |

---

**Next Step**: Create the [dashboard](./IMPLEMENTATION-CHECKLIST-DASHBOARD.md) landing page and onboarding flow.
